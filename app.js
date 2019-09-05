'use strict';

const projectId = 'sundaya'
const keyFilename = 'credentials/sundaya-d75625d5dda7.json'

// Import the Google Cloud client library
const { BigQuery } = require('@google-cloud/bigquery');

// Create a client
// const bigqueryClient = new BigQuery({projectId, keyFilename});
const bigqueryClient = new BigQuery();                  // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190823-hse-bigquery\credentials\sundaya-d75625d5dda7.json"

// Queries a dataset.
async function queryTEST() {

    // The SQL query to run
    const sqlQuery = `SELECT id
            FROM \`sundaya.monitoring.TEST\`
            WHERE time_local >= @start_time
            ORDER BY id DESC`;

    const options = {
        query: sqlQuery,
        location: 'asia-east1',                             // Location must match that of the dataset(s) referenced in the query.
        params: { start_time: '2019-02-08' },
    };

    // Run the query
    const [rows] = await bigqueryClient.query(options);

    console.log('Rows:');
    rows.forEach(row => console.log(row));
}

async function insertTEST() {
    // Inserts the JSON objects into my_dataset:my_table.

    const datasetId = 'monitoring';
    const tableId = 'TEST';
    const rows = [{ id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0200' },
    { id: 'PMS-55-002', time_local: '2019-09-09 02:00:17.0201' }];

    // Insert data into a table
    await bigqueryClient
        .dataset(datasetId)
        .table(tableId)
        .insert(rows);
    console.log(`Inserted ${rows.length} rows`);
}

insertTEST();
// queryTEST();

