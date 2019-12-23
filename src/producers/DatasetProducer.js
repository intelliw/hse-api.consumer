//@ts-check
"use strict";
/**
 * ./producers/Dataset.js
 *  Kafka message producers for api devices.datasets.post 
 */
const env = require('../environment/env');
const log = require('../logger').log;

const BqProducer = require('./BqProducer');
const ActiveProducer = require('../producers').ActiveProducer;

const KAFKA_WRITE_TOPIC = env.active.messagebroker.topics.dataset.inverter;
const BQ_DATASET = env.active.datawarehouse.datasets.monitoring;
const BQ_TABLE = env.active.datawarehouse.tables.inverter;

/**
 */
class DatasetProducer extends ActiveProducer {
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

    /** extracts and modifies data items if needed, and sends these as messages to the broker 
    * @param {*} msgObj                                                             
    */
    async sendToTopic(msgObj) {
        try {
            super.sendToTopic(msgObj);
        } catch (e) {
            log.error(`${log.enums.methods.mbSendToTopic}`, e);
        }
    }
    
}



module.exports = DatasetProducer;