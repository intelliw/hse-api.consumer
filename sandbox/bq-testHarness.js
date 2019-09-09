'use strict';

const bq = {
    dataset: 'monitoring',
    location: 'asia-east1',                                             // Location must match that of the dataset(s) referenced in the query.
    TEST: {
        table: 'TEST',
        rows: [{ id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0200' }],
        //{ id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0201' }];
        sql: `SELECT id 
        FROM \`sundaya.monitoring.TEST\`
        WHERE time_local >= @start_time
        ORDER BY id DESC`
    },
    pms: {
        table: 'pms',
        rows: [{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-08-12 08:00:17.0200","time_local":"2019-08-12 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"},{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-08-12 08:00:17.0200","time_local":"2019-08-12 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"}],
        // {"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-02-09 08:00:17.0200","time_local":"2019-02-09 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"}
        sql: `SELECT COUNT(pms_id) Count
        FROM \`sundaya.monitoring.pms\`
        WHERE time_local BETWEEN '2019-08-09' AND '2019-09-12'  
        AND pms_id IN ('PMS-01-001', 'PMS-01-002')`
    }
}

// const bqParamSet = 'TEST';
const bqParamSet = 'pms';

// Create a bq client
const projectId = 'sundaya'
const keyFilename = 'C:/_frg/credentials/sundaya-66cfebae1bff.json'

const { BigQuery } = require('@google-cloud/bigquery');
const bqClient = new BigQuery();                                        // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
// const bqClient = new BigQuery({projectId, keyFilename});             // use this if not setting an env variable


// inserts rows. 
module.exports.insert = async (bqClient) => {


    // Insert data into a table
    await bqClient
        .dataset(bq.dataset)
        .table(bq[bqParamSet].table)
        .insert(bq[bqParamSet].rows);
    console.log(`Inserted ${bq[bqParamSet].rows.length} rows`);

}


// Queries a dataset.
module.exports.query = async (bqClient) => {

    const options = {
        query: bq[bqParamSet].sql,
        location: bq[bqParamSet].location,                             // Location must match that of the dataset(s) referenced in the query.
        params: { timeoutMs: 10000 },
    };

    // Run the query
    const [rows] = await bqClient.query(options);

    console.log('Rows:');
    rows.forEach(row => console.log(row));
}


this.insert(bqClient);
this.query(bqClient);