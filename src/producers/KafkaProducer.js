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

const MESSAGE_PREFIX = 'KAFKA PRODUCER';

class KafkaProducer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     writeTopic:  env.active.topics.dataset                                         // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers                                       //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });

        // setup instance variables
        this.producerObj = kafka.producer(env.active.kafkajs.producer);
        this.writeTopic = writeTopic;
    }

    /* creates messages for each item in the data array and sends the message array to the broker
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
     */
    async sendToTopic(sharedId, msgObj) {

        // send the message to the topic
        await this.producerObj.connect()
            .catch(e => log.error(`${MESSAGE_PREFIX} connect Error [${this.writeTopic}]`, e));

        let result = await this.producerObj.send({
            topic: this.writeTopic,
            messages: msgObj.messages,
            acks: enums.messageBroker.ack.all,                                  // default is 'all'
            timeout: env.active.kafkajs.send.timeout                            // milliseconds    
        })
            // log output               e.g. 2019-09-10 05:04:44.6630 [monitoring.mppt:2-3] 2 messages, 4 items 
            .then(r => log.messaging(this.writeTopic, r[0].baseOffset, msgObj.messages, msgObj.itemCount, env.active.kafkajs.consumer.clientId))         // info = (topic, offset, msgqty, itemqty, sender) {
            .catch(e => log.error(`${MESSAGE_PREFIX} send Error [${this.writeTopic}]`, e));
    
        // disconnect
        await this.producerObj.disconnect()
            .catch(e => log.error(`${MESSAGE_PREFIX} disconnect Error [${this.writeTopic}]`, e));
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
