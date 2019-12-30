//@ts-check
"use strict";
/**
 * ./consumers/KafkaConsumer.js
 *  base type for Kafka message consumers  
 *  the Consumer supertype calls its subtype to transform messages (retrieveMessages() eachMessage:
 *      the subtype contains a Consumer object and implements methods to transform and produce output 
 *      - the Consumer supertype calls the subtype's transform method, which returns a transformed kafka message
 *      - the Consumer supertype then performs generic transforms to the message, if any 
 *      - it then calls the subtype's produce method with the transformed message
 */
const { Kafka } = require('kafkajs');
const Consumer = require('./Consumer');

const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../logger').log;

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

class KafkaConsumer extends Consumer{
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
        super(subscriptionId, readTopic);
        
        // create the kafka consumer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers               //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });
        this.consumerObj = kafka.consumer({ ...env.active.kafkajs.consumer, groupId: subscriptionId });

        // start the consumer    
        this._initialiseTraps();
        this._retrieveMessages().catch(e => log.error(`[${env.active.kafkajs.consumer.clientId}] Kafka consumer retrieve Error`, e))

    }

    // connect and listen for messages
    async _retrieveMessages() {

        const MESSAGE_PREFIX = 'KAFKA CONSUMER';

        await this.consumerObj.connect()
            .then(this.consumerObj.subscribe({ topic: this.readTopic, fromBeginning: env.active.kafkajs.consumer.consumeFromBeginning }))
            .then(this.consumerObj.run({
                eachMessage: async ({ topic, partition, message }) => {

                    // transform dataItems if required                                                                  // transformMonitoringDataset implemented by this super, it calls transformDataItem in subtype 
                    let results = super.isMonitoringDataset() ? super.transformMonitoringDataset(message) : message;    // e.g. results: { itemCount: 9, messages: [. . .] }

                    // write to bq and kafka topic
                    this.produce(results);                                                                              // produce is implemented by subtype        

                }
            }))
            .catch(e => log.error(`${MESSAGE_PREFIX} _retrieveMessages() Error [${this.readTopic}]`, e));

    }


    // initialise error and signal traps
    async _initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    log.error(`errorTypes: process.on ${type}`, e)
                    await this.consumerObj.disconnect()
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
                    await this.consumerObj.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

}


module.exports = KafkaConsumer;