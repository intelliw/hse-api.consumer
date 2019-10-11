//@ts-check
'use strict';
/**
 * monitor ALL topics and write to bq
 */
const Consumer = require('./src/consumers'); 

// create consuemrs for each topic, they all share the same client id
const mppt = new Consumer.MonitoringMppt();      

