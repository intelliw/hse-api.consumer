//@ts-check
"use strict";
/**
 * ./producers/MonitoringPms.js
 *  Kafka pms message producer for api devices.datasets.post  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const Producer = require('../producers');

const KAFKA_WRITE_TOPIC = enums.messageBroker.topics.dataset.pms;

/**
 */
class DatasetPms extends Producer {
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

        let watts;
        let volts;

        const PRECISION = consts.system.MONITORING_PRECISION;
        const TO_MILLIVOLTS = 1000;
        const TEMP_TOP_INDEX = 1, TEMP_MID_INDEX = 2, TEMP_BOTTOM_INDEX = 3;
        const FET_IN_INDEX = 1, FET_OUT_INDEX = 2;
        const NUM_CELLS = 14;
        const ITEMNUMBER_LENGTH = 2;                                                               // how many digits in the cell number e.g 02

        let p = dataItem.pack;                                                                      // all data objects in the sent message are inside pack

        let vcl = Math.min(...p.cell.volts);
        let vch = Math.max(...p.cell.volts);
        let dvcl = p.cell.volts.map(element => (parseFloat(((element - vcl) * TO_MILLIVOLTS).toFixed())));

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
        for (let i = 1; i <= NUM_CELLS; i++) {
            let cellid = 'cell_' + utils.padZero(i, ITEMNUMBER_LENGTH);
            dataObj[cellid] = {                                                                    //   "cell_01": {
                volts: p.cell.volts[i - 1],                                                         //      "volts": 3.661, 
                dvcl: dvcl[i - 1],                                                                  //      "dvcl": 7, 
                open: utils.valueExistsInArray(p.cell.open, i) ? 1 : 0                              //      "open": 0 },            
            }
        }

        // fets
        dataObj.fet_in = {                                                                         // "fet_in": {
            open: utils.valueExistsInArray(p.fet.open, FET_IN_INDEX) ? 1 : 0,                       //      "open": 1, 
            temp: p.fet.temp[FET_IN_INDEX - 1]                                                      //      "temp": 34.1 },        
        }
        dataObj.fet_out = {                                                                        // "fet_out": {
            open: utils.valueExistsInArray(p.fet.open, FET_OUT_INDEX) ? 1 : 0,                      //      "open": 1, 
            temp: p.fet.temp[FET_OUT_INDEX - 1]                                                     //      "temp": 32.2 },        
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_utc = dataItem.time_utc
        dataObj.time_local = dataItem.time_local
        dataObj.time_processing = dataItem.time_processing


        return dataObj;
    }

}



module.exports = DatasetPms;