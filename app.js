'use strict';
/**
 * monitor ALL topics and write to bq
 */

const Consumer = require('./src/consumers'); 

// pms
const pms = new Consumer.PmsBq();       
const mppt = new Consumer.MpptBq();      
const inverter = new Consumer.InverterBq();      

