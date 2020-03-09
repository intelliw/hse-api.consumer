//@ts-check
"use strict";
/**
 * ./consumers/InverterConsumer.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');
const env = require('../environment/env');

const MonitoringProducer = require('../producers/MonitoringProducer');
const Consumer = require('./Consumer');

// instance parameters
const READ_TOPIC = env.active.messagebroker.topics.monitoring.inverter;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.monitoring.analytics.inverter;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class InverterConsumer extends Consumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        const writeTopic = consts.NONE;                                 
        const datasetParam = enums.params.datasets.inverter;
        const bqDataset = env.active.datawarehouse.datasets.analytics;
        const bqTable = env.active.datawarehouse.tables.analytics.inverter;

        // construct consumer and its producer
        super(
            SUBSCRIPTION_OR_GROUPID,
            READ_TOPIC,
            new MonitoringProducer(writeTopic, datasetParam, bqDataset, bqTable)
        );

    }



    /* transforms and produces the retrieved messages
    */
    consume(retrievedMsgObj) {
        
        let transformedMsgObj = this.producer.transform(retrievedMsgObj);
        this.producer.produce(transformedMsgObj);                                           

    }

}


module.exports = InverterConsumer;
