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

    /**
    */
    transformMonitoringDataset(consumedMessage) {
        
        let key, dataItem, newDataItem;
        
        const ITEMS_PER_MESSAGE = 1;

        let results = { itemCount: 0, messages: [] };

        // get message attributes
        dataItem = JSON.parse(consumedMessage.value);                                    // e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
        key = consumedMessage.key.toString();

        // transform message
        newDataItem = this.transformDataItem(key, dataItem);               // subtype implements this. makes a new dataitem with dataset-specific attributes

        // create and return message containing transformed dataitem 
        results.itemCount = ITEMS_PER_MESSAGE;
        results.messages.push(this.producer.createMessage(key, newDataItem));
        
        return results;

    }


    // returns whether this instance (readtopic) produces for a monitoring dataset 
    isMonitoringDataset() { return utils.valueExistsInObject(env.active.messagebroker.topics.monitoring, this.readTopic); }
}


module.exports = Consumer;