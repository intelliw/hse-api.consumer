//@ts-check
'use strict';
/**
 * monitor ALL topics and write to bq
 */
const Consumer = require('./src/consumers'); 

// create consuemrs for each topic, they all share the same client id
const pms = new Consumer.BqPms();       
const mppt = new Consumer.BqMppt();      
const inverter = new Consumer.BqInverter();      

