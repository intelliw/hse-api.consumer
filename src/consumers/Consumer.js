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
     * transforms the dataset inside the consumedMessage 
     * and returns a results object containing an array of kafka messages with modified data items 
     *  consumedMessage - a kafka message whose message.value contains a monitoring api dataset  
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, each message.value contains a dataset with modified data items
     *      e.g. { itemCount: 9, messages: [. . .] }
     * the returned results.messages[] array can be:
     *      - written to bq with bqClient insertRows(data), 
     *      - converted to kafka messages and sent to this producer's writeTopic - producer.sendToTopic(data)
     * e.g. consumedMessage ---------------------------------------------------------------
     *       { magicByte: 2,
     *       attributes: 0,
     *       timestamp: '1577606387161',
     *       offset: '2',
     *       key: <Buffer 54 45 53 54 2d 32 31>,
     *       value:
     *       <Buffer 7b 22 70 6d 73 22 3a 7b 22 69 64 22 3a 22 54 45 53 54 2d 32 31 22 2c 22 74 65 6d 70 22 3a 34 38 2e 33 7d 2c 22 64 61 74 61 22 3a 5b 7b 22 70 61 63 6b ... >,
     *       headers: {},
     *       isControlRecord: false,
     *       batchContext:
     *       { firstOffset: '2',
     *           firstTimestamp: '1577606387161',
     *           partitionLeaderEpoch: 0,
     *           inTransaction: false,
     *           isControlBatch: false,
     *           lastOffsetDelta: 0,
     *           producerId: '-1',
     *           producerEpoch: 0,
     *           firstSequence: 0,
     *           maxTimestamp: '1577606387161',
     *           magicByte: 2 } }
     * e.g. JSON parsed consumedMessage.key ---------------------------------------------------------------
     *      TEST-21
    *  e.g. JSON parsed consumedMessage.value ---------------------------------------------------------------
        { pms: { id: 'TEST-21', temp: 48.3 },
          data: [ { pack: [Object], sys: [Object],
            time_event: '2019-09-09 08:00:06.0320',
            time_zone: '+07:00',
            time_processing: '2019-12-29 07:59:47.1450' } ] 
        }
     * e.g. returned results ---------------------------------------------------------------
     *  { itemCount: 1, messages:[ 
            { key: 'TEST-21',
              value: '[{"pms_id":"TEST-21","pack_id":"0241","pms":{"temp":48.3},"pack":{"volts":54.87,"amps":-1.601,"watts":-87.8469,"vcl":3.91,"vch":3.92,"dock":1,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[..]' 
            } ] 
        }
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

        // create and return a kafka-esque message containing the transformed dataitems as its value
        results.itemCount = dataSet.data.length;
        results.messages.push(this.producer.createMessage(key, dataItems));

        return results;

    }


    // returns whether this instance (readtopic) produces for a monitoring dataset 
    isMonitoringDataset() { return utils.valueExistsInObject(env.active.messagebroker.topics.monitoring, this.readTopic); }
}


module.exports = Consumer;