//@ts-check
"use strict";
/**
 * ./producers/MonitoringMppt.js
 *  Kafka mppt message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');
const utils = require('../host/utils');

const Bq = require('./Bq');
const Producer = require('../producers');

const KAFKA_WRITE_TOPIC = consts.environments[consts.env].topics.dataset.mppt;
const BQ_DATASET = consts.environments[consts.env].datawarehouse.datasets.monitoring;
const BQ_TABLE = consts.environments[consts.env].datawarehouse.tables.mppt;


/**
 */
class DatasetMppt extends Producer {
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



module.exports = DatasetMppt;