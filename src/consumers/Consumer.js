//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for message consumers  
 */
const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../logger').log;

const Subscriber = require('../subscribers');

class Consumer {
    /**
    * @param {*} subscriptionId                             //  env.active.messagebroker.subscriptions.monitoring.analytics
    * @param {*} readTopic                                  //  the topic to read from env.active.messagebroker.topics.monitoring
    */
    constructor(subscriptionId, readTopic, producerObj) {

        // create subscriber and pass this consumer to callback the consume() method
        let subcriber = new Subscriber.Active(subscriptionId, readTopic);
        subcriber.listen(this);                             // start the listener - it will callback the consume() method

        // strore reference to producer
        this.producer = producerObj;

    }

    /* 
    */
    consume(retrievedMsgObj) {
    }

    /*
    */
    validate(retrievedMsgObj) {
    }

    /*
    */
    analyse(retrievedMsgObj) {
}

}


module.exports = Consumer;