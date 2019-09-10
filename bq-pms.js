'use strict';
/**
 * consumers and bq clients to retrieve and write: monitoring data into bigquery  
 */

const Consumer = require('./src/consumers'); 

// pms
const pms = new Consumer.PmsBq();       

