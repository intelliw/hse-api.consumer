//@ts-check
"use strict";
/**
 * ./consumers/Bq.js
 *  base type for BigQuery client  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const moment = require('moment');
const { BigQuery } = require('@google-cloud/bigquery');

class Bq {
    /**
     * superclass - 
     * 
    instance attributes:  
        this.dataset
        this.table

     constructor arguments 
    * @param {*} dataset                                        //  enums.dataWarehouse.datasets   - e.g. monitoring
    * @param {*} table                                          //  enums.dataWarehouse.tables   - e.g. pms
    */
    constructor(dataset, table) {

        // create the bq client
        this.bqClient = new BigQuery();                         // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
        this.dataset = dataset;
        this.table = table;

    }

    // insert rows into Bigquery. rows is an array of data objects
    async insertRows(dataArray) {

        // let rows = [{"pms_id":"TEST-01","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.0388,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell_01":{"volts":3.661,"dvcl":7,"open":1},"cell_02":{"volts":3.666,"dvcl":12,"open":0},"cell_03":{"volts":3.654,"dvcl":0,"open":0},"cell_04":{"volts":3.676,"dvcl":22,"open":0},"cell_05":{"volts":3.658,"dvcl":4,"open":0},"cell_06":{"volts":3.662,"dvcl":8,"open":1},"cell_07":{"volts":3.66,"dvcl":6,"open":0},"cell_08":{"volts":3.659,"dvcl":5,"open":0},"cell_09":{"volts":3.658,"dvcl":4,"open":0},"cell_10":{"volts":3.657,"dvcl":3,"open":0},"cell_11":{"volts":3.656,"dvcl":2,"open":0},"cell_12":{"volts":3.665,"dvcl":11,"open":0},"cell_13":{"volts":3.669,"dvcl":15,"open":0},"cell_14":{"volts":3.661,"dvcl":7,"open":0},"fet_in":{"open":1,"temp":34.1},"fet_out":{"open":1,"temp":32.25},"sys":{"source":"S000"},"time_utc":"2019-08-09 08:00:17.0200","time_local":"2019-08-09 15:00:17.0200","time_processing":"2019-09-23 02:36:47.1200"}]
        let rows = JSON.parse(dataArray);

        await this.bqClient
            .dataset(this.dataset)
            .table(this.table)
            .insert(rows);
        
        // log output 
        // e.g. 2019-09-10 05:10:31.7310, Inserted 2 rows [monitoring.inverter]
        console.log(`${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}, ${rows.length} rows [${this.dataset}.${this.table}]`);
            

    }

}

module.exports = Bq;