//@ts-check
"use strict";
/**
 * ./consumers/Bq.js
 *  base type for BigQuery client  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

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

    // insert rows into Bigquery
    async insertRows(message) {

        //let rows = [{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-02-09 08:00:17.0200","time_local":"2019-02-09 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"},{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-02-09 08:00:17.0200","time_local":"2019-02-09 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"}]
        let rows = JSON.parse(message.value)

        await this.bqClient
            .dataset(this.dataset)
            .table(this.table)
            .insert(rows);
        console.log(`Inserted ${rows.length} rows`);
    }

}

module.exports = Bq;