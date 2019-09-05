'use strict';

const sandbox = require('./sandbox'); 

const projectId = 'sundaya'
const keyFilename = 'credentials/sundaya-d75625d5dda7.json'

// Create a client
const { BigQuery } = require('@google-cloud/bigquery');
const bqClient = new BigQuery();                  // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
// const bqClient = new BigQuery({projectId, keyFilename});         // use this if not setting an env variable

// carry out write and read operations on the dataset table
sandbox.TEST.insert(bqClient);
sandbox.TEST.query(bqClient);

