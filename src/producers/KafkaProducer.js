//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for Kafka message producers  
 *  subclass producer objects are responsible for transforming a consumed message and if requested, sending it to a new topic
 */
const { Kafka } = require('kafkajs');

const enums = require('../environment/enums');
const env = require('../environment/env');
const log = require('../logger').log;

const moment = require('moment');

class KafkaProducer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     writeTopic:  env.active.topics.dataset                              // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: env.active.kafkajs.producer.clientId,
            retry: env.active.kafkajs.producer.retry,                                            // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: env.active.kafkajs.producer.connectionTimeout,                    // milliseconds to wait for a successful connection   
            requestTimeout: env.active.kafkajs.producer.requestTimeout                           // milliseconds to wait for a successful request.     
        })

        // setup instance variables
        this.producerObj = kafka.producer();
        this.writeTopic = writeTopic;
    }

    /* creates messages for each item in the data array and sends the message array to the broker
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
     */
    async sendToTopic(sharedId, transformResults) {
        // send the message to the topics
        try {

            // send the message to the topic
            await this.producerObj.connect();

            let result = await this.producerObj.send({
                topic: this.writeTopic,
                messages: transformResults.messages,
                acks: enums.messageBroker.ack.default,                                  // default is 'leader'
                timeout: env.active.kafkajs.producer.timeout
            })
                .catch(e => log.error(`[${env.active.kafkajs.producer.clientId}] Kafka producer send Error`, e));

            // log output               e.g. 2019-09-10 05:04:44.6630 [monitoring.mppt:2-3] 2 messages, 4 items 
            log.messaging(this.writeTopic, result[0].baseOffset, transformResults.messages, transformResults.itemCount, env.active.kafkajs.consumer.clientId);         // info = (topic, offset, msgqty, itemqty, sender) {

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            log.error(`${this.writeTopic} Kafka producer connect Error`, e);
        }

    }

    /* creates and returns a kafka message
    * key - is a string
    * data - contains the message value 
    * headers - a json object (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    *   e.g. { 'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    * this function prepends the id, processing time, utc time, local time, and data source - to the data object
    */
    createMessage(key, data, headers) {

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };

        if (headers) {
            message.headers = JSON.stringify(headers);
        }

        return message;
    }

}

module.exports = KafkaProducer;
