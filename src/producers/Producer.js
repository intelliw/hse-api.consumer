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
const utils = require('../host/utils');
const moment = require('moment');

class Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     writeTopic:  enums.messageBroker.topics.dataset                              // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {
        
        // create a kafka producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,                 //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: consts.kafkajs.producer.clientId,
            retry: consts.kafkajs.producer.retry,                                            // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.producer.connectionTimeout,                    // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.producer.requestTimeout                           // milliseconds to wait for a successful request.     
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

        // send the message to the topic
        await this.producerObj.connect();
        
        let result = await this.producerObj.send({
            topic: this.writeTopic,
            messages: transformResults.messages,
            acks: enums.messageBroker.ack.default,                                  // default is 'leader'
            timeout: consts.kafkajs.producer.timeout
        })
            .catch(e => console.error(`[${consts.kafkajs.producer.clientId}] ${e.message}`, e));

        // log output               e.g. 2019-09-10 05:04:44.6630, 2 messages, 4 items [monitoring.mppt:2-3]
        console.log(`${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}, ${transformResults.messages.length} messages, ${transformResults.itemCount} items [${this.writeTopic}:${result[0].baseOffset}-${Number(result[0].baseOffset) + (transformResults.messages.length - 1)}]`)

        // if verbose logging on..  e.g. [ { key: '025', value: '[{"pms_id" .... 
        if (consts.environments[consts.env].log.verbose) console.log(transformResults.messages);

        // disconnect
        await this.producerObj.disconnect();

    }

    /* creates and returns a message
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

module.exports = Producer;
