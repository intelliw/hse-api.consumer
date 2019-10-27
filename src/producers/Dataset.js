//@ts-check
"use strict";
/**
 * ./producers/Dataset.js
 *  Kafka inverter message producers for api devices.datasets.post 
 */
const env = require('../xenvironment/env');

const BqProducer = require('./BqProducer');
const KafkaProducer = require('../producers/KafkaProducer');

const KAFKA_WRITE_TOPIC = env.active.topics.dataset.inverter;
const BQ_DATASET = env.active.datawarehouse.datasets.monitoring;
const BQ_TABLE = env.active.datawarehouse.tables.inverter;

/**
 */
class Dataset extends KafkaProducer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} topic                                      //  kafka producer topic to write to
    * @param {*} dataset                                    //  bq dataset name
    * @param {*} table                                      //  bq dataset table name
    */
    constructor(topic, dataset, table) {

        // construct super
        super(topic);

        // instance attributes
        this.bqClient = new BqProducer(dataset, table);                         // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"      

    }

}



module.exports = Dataset;