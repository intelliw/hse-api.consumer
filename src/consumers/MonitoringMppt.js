//@ts-check
"use strict";
/**
 * ./consumers/BqPms.js
 *  
 */

const enums = require('../host/enums');
const consts = require('../host/constants');

const utilsc = require('../host/utilsCommon');
const configc = require('../host/configCommon');

const Producer = require('../producers');
const KafkaConsumer = require('../consumers/KafkaConsumer');

// instance parameters
const KAFKA_READ_TOPIC = configc.env[configc.env.active].topics.monitoring.mppt;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumers.groupId.mppt;


/**
 * instance attributes
 * producer                                                                             //  e.g. DatasetMppt - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringMppt extends KafkaConsumer {
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


    /* transforms and returns a data item specific to this dataset
     dataSet        - e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
     dataItem       - e.g. "data": [ { "time_local": "2
    */
    transformDataItem(key, dataSet, dataItem) {

        let volts, amps, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;

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
        let statusBits = utilsc.hex2bitArray(dataItem.status, consts.equStatus.BIT_LENGTH);                             // get a reversed array of bits (bit 0 is least significant bit)
        dataObj.status = {
            bus_connect: utilsc.tristateBoolean(statusBits[0]),                                                         // bit 0    "status": { "bus_connect": true }, 
            input: enums.equStatus.mppt.input[consts.equStatus.ENUM_PREFIX + statusBits[1] + statusBits[2]],            // bit 1,2              "input": "normal"
            chgfet: utilsc.tristateBoolean(statusBits[3]),                                                              // bit 3                "chgfet": true, 
            chgfet_antirev: utilsc.tristateBoolean(statusBits[4]),                                                      // bit 4                "chgfet_antirev": true, 
            fet_antirev: utilsc.tristateBoolean(statusBits[5]),                                                         // bit 5                "fet_antirev": true,   
            input_current: utilsc.tristateBoolean(statusBits[6]),                                                       // bit 6                "input_current": true, 
            load: enums.equStatus.mppt.load[consts.equStatus.ENUM_PREFIX + statusBits[7] + statusBits[8]],              // bit 7,8              "load": "ok", 
            pv_input: utilsc.tristateBoolean(statusBits[9]),                                                            // bit 9                "pv_input": true, 
            charging: enums.equStatus.mppt.charging[consts.equStatus.ENUM_PREFIX + statusBits[10] + statusBits[11]],    // bit 10,11            "charging": "not-charging", 
            system: utilsc.tristateBoolean(statusBits[12]),                                                             // bit 12               "system": true,  
            standby: utilsc.tristateBoolean(statusBits[13])                                                             // bit 13               "standby": true } 
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        // @DEBUG   console.log(`equ status: ${Array.from(statusBits).reverse().join('')}`);         // put bits back in order to debug and compare with documentation in the portal 
        // @DEBUG   console.log(`dataObj: ${JSON.stringify(dataObj)}`)       // @@@@@@

        return dataObj;
    }
}


module.exports = MonitoringMppt;
