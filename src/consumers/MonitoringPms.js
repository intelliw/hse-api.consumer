//@ts-check
'use strict';
/**
 * ./consumers/MonitoringPms.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const DatasetProducer = require('../producers/DatasetProducer');
const ActiveMessageConsumer = require('../consumers').ActiveMessageConsumer;

// instance parameters
const KAFKA_READ_TOPIC = env.active.messagebroker.topics.monitoring.pms;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumerGroups.monitoring.pms;

/**
 * instance attributes
 * producer                                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringPms extends ActiveMessageConsumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        const kafkaWriteTopic = env.active.messagebroker.topics.dataset.pms;
        const bqDataset = env.active.datawarehouse.datasets.monitoring;
        const bqTable = env.active.datawarehouse.tables.pms;

        // start kafka consumer with a bq client
        super(
            KAFKA_CONSUMER_GROUPID,
            KAFKA_READ_TOPIC
        );

        // instance attributes
        this.producer = new DatasetProducer(kafkaWriteTopic, bqDataset, bqTable)

    }


    /* writes to bq and to the datasets kafka topic 
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
    */
    produce(transformResults) {
        let rowArray;
        let sharedId;

        // produce 
        transformResults.messages.forEach(message => {                 

            // parse message
            rowArray = JSON.parse(message.value);                       // rowArray = [{"pms_id":"PMS-01-002","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.039,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[{"volts":3.661,"dvcl":7,"open":false},{"volts":3.666,"dvcl":12,"open":false},{"volts":3.654,"dvcl":0,"open":false},{"volts":3.676,"dvcl":22,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.662,"dvcl":8,"open":false},{"volts":3.66,"dvcl":6,"open":false},{"volts":3.659,"dvcl":5,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.657,"dvcl":3,"open":false},{"volts":3.656,"dvcl":2,"open":false},{"volts":3.665,"dvcl":11,"open":true},{"volts":3.669,"dvcl":15,"open":false},{"volts":3.661,"dvcl":7,"open":false}],"fet_in":{"open":true,"temp":34.1},"fet_out":{"open":false,"temp":32.2},"status":{"bus_connect":true},"sys":{"source":"S000"},"time_event":"2019-02-09 08:00:17.0200","time_zone":"+07:00","time_processing":"2019-09-08 05:00:48.9830"}]
            sharedId = rowArray[0].pms_id;                              // each element in the message value array will have the same id

            // bq
            this.producer.bqClient.insertRows(sharedId, rowArray);      // message.value: [{"pms_id":"TEST-01","pack_id":"0241","pms":{"temp":48.1},"pack":{"volts":54.87,"amps":     
            
        });

        // write to kafka                                               // remove comment if this is needed
        this.producer.sendToTopic(sharedId, transformResults); 

   
    }

    /* transforms and returns a data item specific to this dataset
     dataSet        - e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
     dataItem       - e.g. "data": [ { "time_local": "2
    */
   transformDataItem(key, dataSet, dataItem) {

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

        // pms
        dataObj.pms = {                                                                             //   "pms": {   
            temp: dataSet.pms.temp                                                                  //   get temp from dataset  e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
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
                open: p.cell.open.includes(i) ? true : false                                        //      "open": false },             
            });
        };
        dataObj.cell = attrArray;                                                                   // "cell": [ { "volts": 3.661, "dvcl": 7, "open": false },

        // fets
        dataObj.fet_in = {                                                                          // "fet_in": {
            open: p.fet.open.includes(FET_IN_INDEX) ? true : false,                                 //      "open": false, 
            temp: p.fet.temp[FET_IN_INDEX - 1]                                                      //      "temp": 34.1 },        
        }
        dataObj.fet_out = {                                                                         // "fet_out": {
            open: p.fet.open.includes(FET_OUT_INDEX) ? true : false,                                //      "open": false, 
            temp: p.fet.temp[FET_OUT_INDEX - 1]                                                     //      "temp": 32.2 },        
        }

        // status
        let statusBits = utils.hex2bitArray(p.status, consts.equStatus.BIT_LENGTH);                // get a reversed array of bits (bit 0 is least significant bit)
        dataObj.status = {
            bus_connect: utils.tristateBoolean(statusBits[0], false, true)                         // bit 0    "status": { "bus_connect": true }, 
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        return dataObj;
    }

}



module.exports = MonitoringPms;
