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
    * @param {*} readTopic                                  //  the topic to read from consts.environments[consts.env].topics.monitoring
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
        try {
            await this.kafkaConsumer.connect();
            await this.kafkaConsumer.subscribe({ topic: this.readTopic, fromBeginning: consts.kafkajs.consumer.consumeFromBeginning });
            await this.kafkaConsumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                                                
                    // extract dataItems                                            // transformMonitoringDataset implemented by supertype which calls transformDataItem in subtype
                    let results = this.transformMonitoringDataset(message);         // e.g. results: { itemCount: 9, messages: [. . .] }
                    
                    // write to bq and kafka topic
                    this.produce(results);

                }
            });

        } catch (e) {
            console.error(`>>>>>> RETRIEVE ERROR: [${consts.kafkajs.consumer.clientId}] ${e.message}`, e)
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
     *      converted to kafka messages and sent to this producer's writeTopic - sendToTopic(data)
     * @param {*} consumedMessage                                                   a kafka message
     * @param {*} dataItemTransformer                                               callback function to transform a dataitem in the message
    */
    transformMonitoringDataset(consumedMessage, dataItemTransformer) {

        let key, dataset, newDataItem;
        let dataItems = [];
        let results = { itemCount: 0, messages: [] };

        // get kafka message attributes
        dataset = JSON.parse(consumedMessage.value);
        key = consumedMessage.key.toString();

        // add each data item in the dataset as an individual message
        dataset.data.forEach(dataItem => {                                          // e.g. "data": [ { "time_local": "2
        
            // transform and add data to the dataitems array
            newDataItem = this.transformDataItem(key, dataItem);                       // make a new dataitem with dataset-specific attributes
            dataItems.push(newDataItem);

        });

        // create a kafka message containing the transformed dataitems as its value
        results.itemCount = dataset.data.length;
        results.messages.push(this.producer.createMessage(key, dataItems));

        return results;
        
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