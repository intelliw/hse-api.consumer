//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const { Kafka } = require('kafkajs');
const CLIENT_ID_SUFFIX = '.000'                            // this suffix is appended to the group id and used as the client id  

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

class Consumer {
    /**
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
        this.clientId = clientId;                           // consts.messaging.clientid   - e.g. devices.datasets            
        this.topicName = topicName;
        this.bqClient = new BigQuery();                     // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"

     constructor arguments 
    * @param {*} clientId                                   //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} groupId                                    //  enums.messageBroker.consumers.groupId
    * @param {*} topicName                                  //  enums.messageBroker.topics.monitoring
    * @param {*} bqClient              
    */
    constructor(groupId, topicName, bqClient) {

        // store params
        this.clientId = `${groupId}${CLIENT_ID_SUFFIX}`;    // this suffix is appended to the group id and used as the client id 
        this.topicName = topicName;
        this.bqClient = bqClient;                           // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
        
        // create the kafka consumer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,
            clientId: this.clientId,
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
        this.retrieveMessages().catch(e => console.error(`[${this.clientId}] ${e.message}`, e))

    }

    // connect and listen for messages
    async retrieveMessages() {

        await this.kafkaConsumer.connect()
        await this.kafkaConsumer.subscribe({ topic: this.topicName, fromBeginning: consts.kafkajs.consumeFromBeginning })
        await this.kafkaConsumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                this.bqClient.insertRows(message)
                // console.log(`${topic} | P:${partition} | O:${message.offset} | Ts:${message.timestamp} | Key:${message.key} | Value: >>>> ${message.value} <<<<<`);
            }
        })
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