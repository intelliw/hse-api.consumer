//@ts-check
"use strict";
/**
 * ./subscribers/KafkaSubscriber.js
 *  base type for Kafka message consumers  
 *  the Consumer supertype calls its subtype to transform messages (listen() eachMessage:
 *      the subtype contains a Consumer object and implements methods to transform and produce output 
 *      - the Consumer supertype calls the subtype's transform method, which returns a transformed kafka message
 *      - the Consumer supertype then performs generic transforms to the message, if any 
 *      - it then calls the subtype's produce method with the transformed message
 */
const { Kafka } = require('kafkajs');

const Subscriber = require('./Subscriber');

const env = require('../environment/env');
const log = require('../logger').log;

class KafkaSubscriber extends Subscriber {
    /**
     constructor arguments 
    * @param {*} subscriptionId                             //  env.active.messagebroker.subscriptions.monitoring.analytics
    * @param {*} readTopic                                  //  the topic to read from env.active.messagebroker.topics.monitoring
    */
    constructor(subscriptionId, readTopic) {

        // create the kafka consumer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers               //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });
        let subscriberObj = kafka.consumer({ ...env.active.kafkajs.subscriber, groupId: subscriptionId });

        // super
        super(subscriberObj, readTopic);

    }

    // connect and listen for messages and callback the consumerObj
    async listen(consumerObj) {
        
        try {

            await this.subscriberObj.connect()
                .then(this.subscriberObj.subscribe({ topic: this.readTopic, fromBeginning: env.active.kafkajs.subscriber.consumeFromBeginning }))
                .then(this.subscriberObj.run({
                    eachMessage: async ({ topic, partition, message: retrievedMsgObj }) => {

                        // call consumer 
                        consumerObj.consume(retrievedMsgObj);                                                                 // produce is implemented by subtype 

                    }
                }))
                .catch(e => log.error(`Kafka listen() Error [${this.readTopic}]`, e));

        } catch (e) {
            
            log.error(`[${env.active.kafkajs.subscriber.clientId}] Kafka consumer Error`, e);
        }

    }

    // disconnects the subscriber - implemented by subtype, called by super
    async _disconnect() {
        await this.subscriberObj.disconnect()
    }

    // remove the listener or disconnect - implemented by subtype
    async _removeListener() {
        await this.subscriberObj.disconnect()               // for kafkajs there is no removeListener
    }

}


module.exports = KafkaSubscriber;