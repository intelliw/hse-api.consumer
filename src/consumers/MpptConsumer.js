//@ts-check
"use strict";
/**
 * ./consumers/MpptConsumer.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');
const env = require('../environment/env');

const MonitoringProducer = require('../producers/MonitoringProducer');
const Consumer = require('./Consumer');

// instance parameters
const READ_TOPIC = env.active.messagebroker.topics.monitoring.mppt;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.monitoring.analytics.mppt;


/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MpptConsumer extends Consumer {
    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        const writeTopic = consts.NONE;
        const datasetParam = enums.params.datasets.mppt;
        const bqDataset = env.active.datawarehouse.datasets.analytics;
        const bqTable = env.active.datawarehouse.tables.analytics.mppt;

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
        this.producer.produce(transformedMsgObj);                                           // async produce() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    }

}


module.exports = MpptConsumer;
