//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for Kafka message producers  
 *  subclass producer objects are responsible for transforming a consumed message and if requested, sending it to a new topic
 */
const { Kafka } = require('kafkajs');

const enums = require('../host/enums');
const consts = require('../host/constants');

const configc = require('../host/configCommon');

const moment = require('moment');

class KafkaProducer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     writeTopic:  configc.env[configc.env.active].topics.dataset                              // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {
        
        // create a kafka producer
        const kafka = new Kafka({
            brokers: configc.env[configc.env.active].kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: configc.kafkajs.producer.clientId,
            retry: configc.kafkajs.producer.retry,                                            // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: configc.kafkajs.producer.connectionTimeout,                    // milliseconds to wait for a successful connection   
            requestTimeout: configc.kafkajs.producer.requestTimeout                           // milliseconds to wait for a successful request.     
        })

        // setup instance variables
        this.producerObj = kafka.producer();
        this.writeTopic = writeTopic;
    }

    /* creates messages for each item in the data array and sends the message array to the broker
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
     */
    async sendToTopic(transformResults) {
        // send the message to the topics
        try {

            // send the message to the topic
            await this.producerObj.connect();
            
            let result = await this.producerObj.send({
                topic: this.writeTopic,
                messages: transformResults.messages,
                acks: enums.messageBroker.ack.default,                                  // default is 'leader'
                timeout: configc.kafkajs.producer.timeout
            })
                .catch(e => console.error(`[${configc.kafkajs.producer.clientId}] ${e.message}`, e));

            // log output               e.g. 2019-09-10 05:04:44.6630 [monitoring.mppt:2-3] 2 messages, 4 items 
            console.log(`[${this.writeTopic}:${result[0].baseOffset}-${Number(result[0].baseOffset) + (transformResults.messages.length - 1)}] ${transformResults.messages.length} messages, ${transformResults.itemCount} items`)
            if (configc.env[configc.env.active].log.verbose) console.log(transformResults.messages);        // if verbose logging on..  e.g. [ { key: '025', value: '[{"pms_id" .... 

            // disconnect
            await this.producerObj.disconnect();

        } catch (e) {
            console.error(`>>>>>> CONNECT ERROR: [${configc.kafkajs.producer.clientId}] ${e.message}`, e)
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
