//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for message consumers  
 */
const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../logger').log;


class MessageConsumer {
    /**9
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
        this.readTopic = readTopic;

     constructor arguments 
    * @param {*} groupId                                    //  enums.messageBroker.consumersGroups.monitoring
    * @param {*} readTopic                                  //  the topic to read from env.active.messagebroker.topics.monitoring
    */
    constructor(groupId, readTopic) {

        // store params
        this.readTopic = readTopic;

    }

    /**
     * transforms the dataset inside the consumedMessage 
     * and returns a results object containing an array of kafka messages with modified data items 
     *  consumedMessage - a kafka message whose message.value contains a monitoring api dataset  
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, each message.value contains a dataset with modified data items
     *      e.g. { itemCount: 9, messages: [. . .] }
     * the returned results.messages[] array can be:
     *      written to bq with bqClient insertRows(data), 
     *      converted to kafka messages and sent to this producer's writeTopic - producer.sendToTopic(data)
     * @param {*} consumedMessage                                                   a kafka message
    */
    transformMonitoringDataset(consumedMessage) {

        let key, dataSet, newDataItem;
        let dataItems = [];
        let results = { itemCount: 0, messages: [] };

        // get kafka message attributes
        dataSet = JSON.parse(consumedMessage.value);                                    // e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
        key = consumedMessage.key.toString();

        // add each data item in the dataset as an individual message
        dataSet.data.forEach(dataItem => {                                              // e.g. "data": [ { "time_local": "2

            // transform and add data to the dataitems array
            newDataItem = this.transformDataItem(key, dataSet, dataItem);               // subtype implements this. makes a new dataitem with dataset-specific attributes
            dataItems.push(newDataItem);

        });

        // create and return a kafka message containing the transformed dataitems as its value
        results.itemCount = dataSet.data.length;
        results.messages.push(this.producer.createMessage(key, dataItems));

        return results;

    }



    // returns whether this instance (readtopic) produces for a monitoring dataset 
    isMonitoringDataset() { return utils.valueExistsInObject(env.active.messagebroker.topics.monitoring, this.readTopic); }
}


module.exports = MessageConsumer;