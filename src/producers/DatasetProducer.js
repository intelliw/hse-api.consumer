//@ts-check
"use strict";
/**
 * ./producers/Dataset.js
 *  Kafka message producers for api devices.datasets.post 
 */
const env = require('../environment/env');

const BqProducer = require('./BqProducer');
const ActiveMessageProducer = require('../producers').ActiveMessageProducer;

const KAFKA_WRITE_TOPIC = env.active.messagebroker.topics.dataset.inverter;
const BQ_DATASET = env.active.datawarehouse.datasets.monitoring;
const BQ_TABLE = env.active.datawarehouse.tables.inverter;

/**
 */
class DatasetProducer extends ActiveMessageProducer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} writeTopic                                         //  kafka producer topic to write to
    * @param {*} dataset                                            //  bq dataset name
    * @param {*} table                                              //  bq dataset table name
    */
    constructor(writeTopic, dataset, table) {

        // construct super
        super(writeTopic);

        // instance attributes
        this.bqClient = new BqProducer(dataset, table);             // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"      

    }

}



module.exports = DatasetProducer;