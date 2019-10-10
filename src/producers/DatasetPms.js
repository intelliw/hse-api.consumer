//@ts-check
"use strict";
/**
 * ./producers/MonitoringPms.js
 *  Kafka pms message producer for api devices.datasets.post  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const configc = require('../host/configCommon');

const Bq = require('./Bq');
const Producer = require('../producers');

const KAFKA_WRITE_TOPIC = configc.env[configc.env.active].topics.dataset.pms;
const BQ_DATASET = configc.env[configc.env.active].datawarehouse.datasets.monitoring;
const BQ_TABLE = configc.env[configc.env.active].datawarehouse.tables.pms;

/**
 * instance attributes
 * bqClient                                   // Bq                   
  */
class DatasetPms extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    */
    constructor() {

        // construct super
        super(KAFKA_WRITE_TOPIC);

        // instance attributes
        this.bqClient = new Bq(BQ_DATASET, BQ_TABLE);                         // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"      

    }

}



module.exports = DatasetPms;