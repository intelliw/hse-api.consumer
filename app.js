//@ts-check
'use strict';
/**
 * monitor ALL topics and write to bq
 */
const consts = require('./src/host/constants');
const Consumer = require('./src/consumers'); 

const clientId = consts.kafkajs.consumer.clientId; 

// create consuemrs for each topic, they all share the same client id
const pms = new Consumer.BqPms(clientId);       
const mppt = new Consumer.BqMppt(clientId);      
const inverter = new Consumer.BqInverter(clientId);      

