//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for message consumers  
 */
const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../logger').log;


class Consumer {
    /**9
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
        this.readTopic = readTopic;

     constructor arguments 
    * @param {*} subscriptionId                             //  env.active.messagebroker.subscriptions.monitoring
    * @param {*} readTopic                                  //  the topic to read from env.active.messagebroker.topics.monitoring
    */
    constructor(subscriptionId, readTopic) {

        // store params
        this.subscriptionId = subscriptionId;
        this.readTopic = readTopic;

    }

}


module.exports = Consumer;