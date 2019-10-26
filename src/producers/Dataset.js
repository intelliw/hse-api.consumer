//@ts-check
"use strict";
/**
 * ./producers/Dataset.js
 *  Kafka inverter message producers for api devices.datasets.post 
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const configc = require('../common/configc');

const BqProducer = require('./BqProducer');
const KafkaProducer = require('../producers/KafkaProducer');

const KAFKA_WRITE_TOPIC = configc.env[configc.env.active].topics.dataset.inverter;
const BQ_DATASET = configc.env[configc.env.active].datawarehouse.datasets.monitoring;
const BQ_TABLE = configc.env[configc.env.active].datawarehouse.tables.inverter;

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