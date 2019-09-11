'use strict';
/**
 * monitor ALL topics and write to bq
 */

const Consumer = require('./src/consumers'); 

// pms
const pms = new Consumer.BqPms();       
const mppt = new Consumer.BqMppt();      
const inverter = new Consumer.BqInverter();      

