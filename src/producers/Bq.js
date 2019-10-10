//@ts-check
"use strict";
/**
 * ./consumers/Bq.js
 *  base type for BigQuery client  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const configc = require('../host/configCommon');

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
    * @param {*} dataset                                        //  configc.env[configc.env.active].datawarehouse.datasets   - e.g. monitoring
    * @param {*} table                                          //  configc.env[configc.env.active].datawarehouse.tables   - e.g. pms
    */
    constructor(dataset, table) {

        // create the bq client
        this.bqClient = new BigQuery();                         // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
        this.dataset = dataset;
        this.table = table;

    }
    /* insert rows into Bigquery. rows is an array of data objects
     */
    async insertRows(dataArray) {

        // let rows = [{"pms_id":"PMS-01-002","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.039,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[{"volts":3.661,"dvcl":7,"open":false},{"volts":3.666,"dvcl":12,"open":false},{"volts":3.654,"dvcl":0,"open":false},{"volts":3.676,"dvcl":22,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.662,"dvcl":8,"open":false},{"volts":3.66,"dvcl":6,"open":false},{"volts":3.659,"dvcl":5,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.657,"dvcl":3,"open":false},{"volts":3.656,"dvcl":2,"open":false},{"volts":3.665,"dvcl":11,"open":true},{"volts":3.669,"dvcl":15,"open":false},{"volts":3.661,"dvcl":7,"open":false}],"fet_in":{"open":true,"temp":34.1},"fet_out":{"open":false,"temp":32.2},"status":{"bus_connect":true},"sys":{"source":"S000"},"time_event":"2019-02-09 08:00:17.0200","time_zone":"+07:00","time_processing":"2019-09-08 05:00:48.9830"}]
        let rows = JSON.parse(dataArray);
        
        

        try {
            // @DEBUG console.log(`bq rows: ${JSON.stringify(rows)}`);       
            await this.bqClient
                .dataset(this.dataset)
                .table(this.table)
                .insert(rows);

            // log output                                       // e.g. 2019-09-10 05:10:31.7310 [monitoring.inverter] 2 rows 
            console.log(`[${this.dataset}.${this.table}] ${rows.length} rows`);
        
        } catch (e) {
            console.error(`>>>>>> BQ INSERT ERROR: [${configc.kafkajs.consumer.clientId}] ${e.message}`, e)
        }

    }

}

module.exports = Bq;