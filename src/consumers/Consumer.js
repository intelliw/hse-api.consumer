//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 *  the Consumer supertype calls its subtype to transform messages (retrieveMessages() eachMessage:
 *      the subtype contains a Producer object and implements methods to transform and produce output 
 *      - the Consumer supertype calls the subtype's transform method, which returns a transformed kafka message
 *      - the Consumer supertype then performs generic transforms to the message, if any 
 *      - it then calls the subtype's produce method with the transformed message
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const { Kafka } = require('kafkajs');

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

const CLIENT_ID = consts.kafkajs.consumer.clientId;         // unique client id for this instance, created at startup 

class Consumer {
    /**9
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
        this.readTopic = readTopic;

     constructor arguments 
    * @param {*} groupId                                    //  enums.messageBroker.consumers.groupId
    * @param {*} readTopic                                  //  the topic to read from enums.messageBroker.topics.monitoring
    */
    constructor(groupId, readTopic) {

        // store params
        this.readTopic = readTopic;

        // create the kafka consumer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,
            clientId: CLIENT_ID,
        })
        this.kafkaConsumer = kafka.consumer({
            groupId: groupId,
            sessionTimeout: consts.kafkajs.consumer.sessionTimeout,
            heartbeatInterval: consts.kafkajs.consumer.heartbeatInterval,
            rebalanceTimeout: consts.kafkajs.consumer.rebalanceTimeout,
            metadataMaxAge: consts.kafkajs.consumer.metadataMaxAge,
            allowAutoTopicCreation: consts.kafkajs.consumer.allowAutoTopicCreation,
            maxBytesPerPartition: consts.kafkajs.consumer.maxBytesPerPartition,
            minBytes: consts.kafkajs.consumer.minBytes,
            maxBytes: consts.kafkajs.consumer.maxBytes,
            maxWaitTimeInMs: consts.kafkajs.consumer.maxWaitTimeInMs,
            retry: consts.kafkajs.consumer.retry,
            readUncommitted: consts.kafkajs.consumer.readUncommitted
        });

        // start the consumer    
        this.initialiseTraps();
        this.retrieveMessages().catch(e => console.error(`[${CLIENT_ID}] ${e.message}`, e))

    }

    // connect and listen for messages
    async retrieveMessages() {

        await this.kafkaConsumer.connect()
        await this.kafkaConsumer.subscribe({ topic: this.readTopic, fromBeginning: consts.kafkajs.consumer.consumeFromBeginning })
        await this.kafkaConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {

                // extract data
                let newMessage = this.transformMonitoringDataset(message);

                // write to bq and kafka topic
                this.produce(newMessage);

            }
        })
    }

    /**
     * transforms and returns a kafka message for this dataset 
     * the returned message contains an array of modified data items which can be:
     *      written to bq with bqClient insertRows(data), 
     *      and sent to this producers writeTopic - sendToTopic(data)
     * this function requires the datasets in the message to:
     *      contain an object array of items in the 'data' attribute.  e.g. { "pms": { "id": "PMS-01-001" },  "data": [ .. ]
     * @param {*} consumedMessage                                                   a kafka message
     * @param {*} dataItemTransformer                                               callback function to transform a dataitem in the message
    */
    transformMonitoringDataset(consumedMessage, dataItemTransformer) {
        let newMessage = [];
        let key, dataset, newDataItem;
        let dataItems = [];

        // get kafka message attributes
        dataset = JSON.parse(consumedMessage.value);
        key = consumedMessage.key.toString();

        // add each data item in the dataset has an individual message
        dataset.data.forEach(dataItem => {                                          // e.g. "data": [ { "time_local": "2

            // transform and add data to the dataitems array
            newDataItem = this.transformDataItem(key, dataItem);                       // make a new dataitem with dataset-specific attributes
            dataItems.push(newDataItem);

        });

        // create a kafka message containing the transformed dataitems as its value
        newMessage.push(this.producer.createMessage(key, dataItems));
        return newMessage;
    }


    // initialise error and signal traps
    async initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    console.error(e)
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


module.exports = Consumer;