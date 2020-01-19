//@ts-check
'use strict';

/**
 * monitor ALL topics and write to bq
 */
const Consumer = require('./src/consumers'); 


// create consuemrs for each topic, they all share the same client id
const pms = new Consumer.MonitoringPms();       
const mppt = new Consumer.MonitoringMppt();      
const inverter = new Consumer.MonitoringInverter();      


// feature toggle consumers
const featureToggle = new Consumer.Feature();      