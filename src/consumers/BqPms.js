//@ts-check
'use strict';
/**
 * ./consumers/BqPms.js
 *  
 */

const enums = require('../host/enums');
const consts = require('../host/constants');

const utilsc = require('../host/utilsCommon');
const configc = require('../host/configCommon');

const Producer = require('../producers');
const Consumer = require('../consumers');

// instance parameters
const KAFKA_READ_TOPIC = configc.env[configc.env.active].topics.monitoring.pms;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumers.groupId.pms;

/**
 * instance attributes
 * producer                                   //  e.g. DatasetPms - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class BqPms extends Consumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        // start kafka consumer with a bq client
        super(
            KAFKA_CONSUMER_GROUPID,
            KAFKA_READ_TOPIC
        );

        // instance attributes
        this.producer = new Producer.DatasetPms()

    }


    // subtype implements specific transforms or calls super 
    transform(consumedMessage) {
        return super.transformMonitoringDataset(consumedMessage);
    }

    /* writes to bq and to the datasets kafka topic 
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
    */
    produce(transformResults) {
        
        // produce 
        transformResults.messages.forEach(message => {

            // bq
            this.producer.bqClient.insertRows(message.value);

        });

        // write to kafka                                               // remove comment if this is needed
        // this.producer.sendToTopic(transformResults); 

   
    }

    // transforms and returns a data item specific to this dataset
    transformDataItem(key, dataItem) {

        let volts, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const TO_MILLIVOLTS = 1000;
        const TEMP_TOP_INDEX = 1, TEMP_MID_INDEX = 2, TEMP_BOTTOM_INDEX = 3;
        const FET_IN_INDEX = 1, FET_OUT_INDEX = 2;


        let p = dataItem.pack;                                                                      // all data objects in the sent message are inside pack

        let vcl = Math.min(...p.cell.volts);
        let vch = Math.max(...p.cell.volts);
        let dvcl = p.cell.volts.map(element => (parseFloat(((element - vcl) * TO_MILLIVOLTS).toFixed())));  // make an array of dvcl

        // pack.volts,  pack.watts
        volts = dataItem.pack.cell.volts.reduce((sum, x) => sum + x).toFixed(PRECISION);            // sum all the cell volts to get pack volts
        watts = (volts * dataItem.pack.amps).toFixed(PRECISION);

        //  reconstruct dataitem - add new attributes and flatten arrays 
        let dataObj = {
            pms_id: key,                                                                            // { "pms_id": "PMS-01-002",
            pack_id: p.id,                                                                          //   "pack_id": "0248",
        }

        // pack    
        dataObj.pack = {                                                                                  //   "pack": {   
            volts: parseFloat(volts), amps: p.amps, watts: parseFloat(watts),                       //      "volts": 51.262, "amps": -0.625, "watts": -32.039,    
            vcl: vcl, vch: vch, dock: parseInt(p.dock),                                             //      "vcl": 3.654, "vch": 3.676, "dock": 4, 
            temp_top: p.temp[TEMP_TOP_INDEX - 1],                                                   //      "temp_top": 35, "temp_mid": 33, "temp_bottom": 34 },
            temp_mid: p.temp[TEMP_MID_INDEX - 1],
            temp_bottom: p.temp[TEMP_BOTTOM_INDEX - 1]
        }

        // cells   
        attrArray = [];
        for (let i = 1; i <= p.cell.volts.length; i++) {
            attrArray.push({ 
                volts: p.cell.volts[i - 1],                                                         //      { "volts": 3.661,         
                dvcl: dvcl[i - 1],                                                                  //      "dvcl": 7,  
                open: utilsc.valueExistsInArray(p.cell.open, i) ? true : false                      //      "open": false },             
            });
        };
        dataObj.cell = attrArray;                                                                   // "cell": [ { "volts": 3.661, "dvcl": 7, "open": false },

        // fets
        dataObj.fet_in = {                                                                          // "fet_in": {
            open: utilsc.valueExistsInArray(p.fet.open, FET_IN_INDEX) ? true : false,               //      "open": false, 
            temp: p.fet.temp[FET_IN_INDEX - 1]                                                      //      "temp": 34.1 },        
        }
        dataObj.fet_out = {                                                                         // "fet_out": {
            open: utilsc.valueExistsInArray(p.fet.open, FET_OUT_INDEX) ? true : false,              //      "open": false, 
            temp: p.fet.temp[FET_OUT_INDEX - 1]                                                     //      "temp": 32.2 },        
        }

        // status
        let statusBits = utilsc.hex2bitArray(p.status, consts.equStatus.BIT_LENGTH);                // get a reversed array of bits (bit 0 is least significant bit)
        dataObj.status = {
            bus_connect: utilsc.tristateBoolean(statusBits[0])                                      // bit 0    "status": { "bus_connect": true }, 
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        return dataObj;
    }

}



module.exports = BqPms;
