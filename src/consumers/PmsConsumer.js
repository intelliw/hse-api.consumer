//@ts-check
'use strict';
/**
 * ./consumers/PmsConsumer.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const MonitoringProducer = require('../producers/MonitoringProducer');
const Consumer = require('./Consumer');

// instance parameters
const READ_TOPIC = env.active.messagebroker.topics.monitoring.pms;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.monitoring.pms;

/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class PmsConsumer extends Consumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        const writeTopic = env.active.messagebroker.topics.dataset.pms;
        const bqDataset = env.active.datawarehouse.datasets.monitoring;
        const bqTable = env.active.datawarehouse.tables.pms;

        // construct consumer and its producer
        super(
            SUBSCRIPTION_OR_GROUPID,
            READ_TOPIC,
            new MonitoringProducer(writeTopic, bqDataset, bqTable)
        );

    }


    /* transforms and produces the retrieved messages
    */
    consume(retrievedMsgObj) {

        let transformedMsgObj = this.producer.transform(retrievedMsgObj);
        this.producer.produce(transformedMsgObj);                                           // async produce() ok as by now we have connected to kafka/pubsub, and the dataset should have been validated and the only outcome is a 200 response

    }

}



module.exports = PmsConsumer;
