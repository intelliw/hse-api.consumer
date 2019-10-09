//@ts-check
"use strict";
/**
 * ./consumers/BqPms.js
 *  
 */

const enums = require('../host/enums');
const consts = require('../host/constants');
const utils = require('../host/utils');

const Producer = require('../producers');
const Consumer = require('../consumers');

// instance parameters
const KAFKA_READ_TOPIC = consts.environments[consts.env].topics.monitoring.mppt;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumers.groupId.mppt;

/**
 * instance attributes
 * producer                                   //  e.g. DatasetPms - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class BqMppt extends Consumer {
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
        this.producer = new Producer.DatasetMppt()

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

        // write to kafka 
        // this.producer.sendToTopic(transformResults); // remove comment if this is needed


    }


    // transforms and returns a data item specific to this dataset
    transformDataItem(key, dataItem) {

        let volts, amps, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const STATUS_BIT_LENGTH = 16;                                                                // how many digits int he cell number e.g 02
        const STATUS_ENUM_PREFIX = 'tuple_'                                                            // prefix used on enums.equipmentStatus to support string lookup   

        //  reconstruct dataitem - add new attributes and flatten arrays 
        let dataObj = {
            mppt_id: key,
            time_local: dataItem.time_local                                                         // this gets replaced and deleted in addGenericAttributes()
        }

        // pv
        attrArray = [];
        for (let i = 1; i <= dataItem.pv.volts.length; i++) {
            volts = dataItem.pv.volts[i - 1];
            amps = dataItem.pv.amps[i - 1];
            watts = (volts * amps).toFixed(PRECISION);

            attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
        };
        dataObj.pv = attrArray;                                                                     // "pv": [ {"volts": 48, "amps": 6, "watts": 288 },

        // battery
        volts = dataItem.battery.volts;
        amps = dataItem.battery.amps;
        watts = (volts * amps).toFixed(PRECISION);

        dataObj.battery = {                                                                        //   "battery": {
            volts: volts, amps: amps, watts: parseFloat(watts)                                     //      "volts": 55.1, "amps": 0.0, "watts": 0 },
        }

        // load
        attrArray = [];
        for (let i = 1; i <= dataItem.load.volts.length; i++) {
            volts = dataItem.load.volts[i - 1];
            amps = dataItem.load.amps[i - 1];
            watts = (volts * amps).toFixed(PRECISION);

            attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
        };
        dataObj.load = attrArray;                                                                   // "load": [ {"volts": 48, "amps": 6, "watts": 288 },

        // status
        let statusBits = utils.hex2bitArray(dataItem.status, STATUS_BIT_LENGTH);                    // get a reversed array of bits (bit 0 is least significant bit)
        
        dataObj.status = {
            bus_connect: (statusBits[0] == 1) ? true : false,                                                       // bit 0    "status": { "bus_connect": true }, 
            input: enums.equipmentStatus.mppt.input[STATUS_ENUM_PREFIX + statusBits[1] + statusBits[2]],            // bit 1,2              "input": "normal"
            chgfet: (statusBits[3] == 1) ? true : false,                                                            // bit 3                "chgfet": true, 
            chgfet_antirev: (statusBits[4] == 1) ? true : false,                                                    // bit 4                "chgfet_antirev": true, 
            fet_antirev: (statusBits[5] == 1) ? true : false,                                                       // bit 5                "fet_antirev": true,   
            input_current: (statusBits[6] == 1) ? true : false,                                                     // bit 6                "input_current": true, 
            load: enums.equipmentStatus.mppt.load[STATUS_ENUM_PREFIX + statusBits[7] + statusBits[8]],              // bit 7,8              "load": "ok", 
            pv_input: (statusBits[9] == 1) ? true : false,                                                          // bit 9                "pv_input": true, 
            charging: enums.equipmentStatus.mppt.charging[STATUS_ENUM_PREFIX + statusBits[10] + statusBits[11]],    // bit 10,11            "charging": "not-charging", 
            system: (statusBits[12] == 1) ? true : false,                                                           // bit 12               "system": true,  
            standby: (statusBits[13] == 1) ? true : false                                                           // bit 13               "standby": true } 
        }
        
        // @DEBUG do move this up where statusBits array is used as this will mess up the array 
                console.log(`equ status: ${statusBits.reverse().join('')}`);                                          // put bits back in order as documented for display in the portal 

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        return dataObj;
    }
}


module.exports = BqMppt;
