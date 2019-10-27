//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 *  the Consumer supertype calls its subtype to transform messages (retrieveMessages() eachMessage:
 *      the subtype contains a Consumer object and implements methods to transform and produce output 
 *      - the Consumer supertype calls the subtype's transform method, which returns a transformed kafka message
 *      - the Consumer supertype then performs generic transforms to the message, if any 
 *      - it then calls the subtype's produce method with the transformed message
 */
const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../host').log;

const { Kafka } = require('kafkajs');

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

const CLIENT_ID = env.active.kafkajs.consumer.clientId;         // unique client id for this instance, created at startup 

class KafkaConsumer {
    /**9
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
        this.readTopic = readTopic;

     constructor arguments 
    * @param {*} groupId                                    //  enums.messageBroker.consumersGroups.monitoring
    * @param {*} readTopic                                  //  the topic to read from env.active.topics.monitoring
    */
    constructor(groupId, readTopic) {

        // store params
        this.readTopic = readTopic;

        // create the kafka consumer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers,
            clientId: CLIENT_ID,
        })
        this.kafkaConsumer = kafka.consumer({
            groupId: groupId,
            sessionTimeout: env.active.kafkajs.consumer.sessionTimeout,
            heartbeatInterval: env.active.kafkajs.consumer.heartbeatInterval,
            rebalanceTimeout: env.active.kafkajs.consumer.rebalanceTimeout,
            metadataMaxAge: env.active.kafkajs.consumer.metadataMaxAge,
            allowAutoTopicCreation: env.active.kafkajs.consumer.allowAutoTopicCreation,
            maxBytesPerPartition: env.active.kafkajs.consumer.maxBytesPerPartition,
            minBytes: env.active.kafkajs.consumer.minBytes,
            maxBytes: env.active.kafkajs.consumer.maxBytes,
            maxWaitTimeInMs: env.active.kafkajs.consumer.maxWaitTimeInMs,
            retry: env.active.kafkajs.consumer.retry,
            readUncommitted: env.active.kafkajs.consumer.readUncommitted
        });

        // start the consumer    
        this.initialiseTraps();
        this.retrieveMessages().catch(e => log.error(`[${CLIENT_ID}] ${e.message}`, e))

    }

    // connect and listen for messages
    async retrieveMessages() {
        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe({ topic: this.readTopic, fromBeginning: env.active.kafkajs.consumer.consumeFromBeginning });
            await this.kafkaConsumer.run({
                eachMessage: async ({ topic, partition, message }) => {

                    let results = message;

                    // extract monitoring dataItems                                 // transformMonitoringDataset implemented by this supertype which calls transformDataItem in subtype
                    if (utils.valueExistsInObject(env.active.topics.monitoring, this.readTopic) {
                        results = this.transformMonitoringDataset(message);         // e.g. results: { itemCount: 9, messages: [. . .] }
                    }

                    // write to bq and kafka topic
                    this.produce(results);                                          // produce is implemented by subtype        

                }
            });

        } catch (e) {
            log.error(`[${env.active.kafkajs.consumer.clientId}] retrieve Error`, e)
        }

    }

    /**
     * transforms the dataset inside the kafka consumedMessage 
     * and returns a results object containing an array of kafka messages with modified data items 
     *  consumedMessage - a kafka message whose message.value contains a monitoring api dataset  
     *  dataItemTransformer - a transform callback function implemented by the consumer subclass
     * the returned results object contains these properties
     *  itemCount  - a count of the total number of dataitems in all datasets / message
     *  messages[] - array of kafka messages, each message.value contains a dataset with modified data items
     *      e.g. { itemCount: 9, messages: [. . .] }
     * the returned results.messages[] array can be:
     *      written to bq with bqClient insertRows(data), 
     *      converted to kafka messages and sent to this producer's writeTopic - producer.sendToTopic(data)
     * @param {*} consumedMessage                                                   a kafka message
     * @param {*} dataItemTransformer                                               callback function to transform a dataitem in the message
    */
    transformMonitoringDataset(consumedMessage, dataItemTransformer) {

        let key, dataSet, newDataItem;
        let dataItems = [];
        let results = { itemCount: 0, messages: [] };

        // get kafka message attributes
        dataSet = JSON.parse(consumedMessage.value);                                    // e.g. { "pms": { "id": "PMS-01-001", "temp": 48.3 },     
        key = consumedMessage.key.toString();

        // add each data item in the dataset as an individual message
        dataSet.data.forEach(dataItem => {                                              // e.g. "data": [ { "time_local": "2

            // transform and add data to the dataitems array
            newDataItem = this.transformDataItem(key, dataSet, dataItem);               // subtyupe implements this. makes a new dataitem with dataset-specific attributes
            dataItems.push(newDataItem);

        });

        // create and return a kafka message containing the transformed dataitems as its value
        results.itemCount = dataSet.data.length;
        results.messages.push(this.producer.createMessage(key, dataItems));

        return results;

    }


    // initialise error and signal traps
    async initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    log.error(`errorTypes: process.on ${type}`, e)
                    await this.kafkaConsumer.disconnect()
                    process.exit(0)
                } catch (_) {
                    process.exit(1)
                }
            })
        })

        // keyboard signal traps for terminal interrupts
        signalTraps.map(type => {
            process.once(type, async () => {
                try {
                    console.log(`signalTraps: process.once ${type}`)
                    await this.kafkaConsumer.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }


}


module.exports = KafkaConsumer;