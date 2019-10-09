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
const KAFKA_READ_TOPIC = consts.environments[consts.env].topics.monitoring.inverter;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumers.groupId.inverter;

/**
 * instance attributes
 * producer                                   //  e.g. DatasetPms - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class BqInverter extends Consumer {

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
        this.producer = new Producer.DatasetInverter()

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


        let volts, amps, watts, pf;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const ITEMNUMBER_LENGTH = 2;                                                                // how many digits int he cell number e.g 02
        const SQ_ROOT_OF_THREE = Math.sqrt(3);

        //  reconstruct dataitem - add new attributes and flatten arrays 
        let dataObj = {
            inverter_id: key,
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

        dataObj.battery = {                                                                         //   "battery": {
            volts: volts, amps: amps, watts: parseFloat(watts)                                      //      "volts": 55.1, "amps": 0.0, "watts": 0 },
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


        // grid
        attrArray = [];
        for (let i = 1; i <= dataItem.grid.volts.length; i++) {
            attrArray.push({ 
                volts: dataItem.grid.volts[i - 1],
                amps: dataItem.grid.amps[i - 1],
                pf: dataItem.grid.pf[i - 1],
                watts: (volts * amps * pf * SQ_ROOT_OF_THREE).toFixed(PRECISION)                    // grid.watts == V x I x pf x √3  
            });
        };
        dataObj.grid = attrArray;           

        // status
        dataObj.status = {
            bus_connect: (parseInt(dataItem.status) == 1) ? true : false                            // "status": { "bus_connect": true }, 
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        return dataObj;

    }


}


module.exports = BqInverter;
