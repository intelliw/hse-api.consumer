//@ts-check
"use strict";
/**
 * ./producers/MonitoringInverter.js
 *  Kafka inverter message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const Producer = require('../producers');

const KAFKA_WRITE_TOPIC = enums.messageBroker.topics.dataset.inverter;

/**
 */
class DatasetInverter extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    */
    constructor() {

        // construct super
        super(KAFKA_WRITE_TOPIC);

    }


    // transforms and returns a data item specific to this dataset
    transform(key, dataItem) {

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
        dataObj.load = attrArray;                                                                     // "load": [ {"volts": 48, "amps": 6, "watts": 288 },


        // grid
        for (let i = 1; i <= dataItem.grid.volts.length; i++) {
            volts = dataItem.grid.volts[i - 1];
            amps = dataItem.grid.amps[i - 1];
            pf = dataItem.grid.pf[i - 1];
            watts = (volts * amps * pf * SQ_ROOT_OF_THREE).toFixed(PRECISION);                      // grid.watts == V x I x pf x √3  

            let gridId = 'grid_' + utils.padZero(i, ITEMNUMBER_LENGTH);
            dataObj[gridId] = {                                                                     //   "grid_01": {
                volts: volts, amps: amps, pf: pf, watts: parseFloat(watts)                          //      "volts": 48, "amps": 1.2, "pf": 0.92, "watts": 91.785 },
            }
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_utc = dataItem.time_utc
        dataObj.time_local = dataItem.time_local
        dataObj.time_processing = dataItem.time_processing

        return dataObj;
    }

}



module.exports = DatasetInverter;