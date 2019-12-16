//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for Kafka message producers  
 *  subclass producer objects are responsible for transforming a consumed message and if requested, sending it to a new topic
 */
const { Kafka } = require('kafkajs');
const Producer = require('./Producer');

const enums = require('../environment/enums');
const env = require('../environment/env');
const log = require('../logger').log;

const moment = require('moment');


class KafkaProducer extends Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     producerObj": kafka.producer()
     writeTopic:  env.active.messagebroker.topics.dataset                                         // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {

        super(writeTopic);

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers                                       //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });

        // setup instance variables specific to KafkaProducer 
        this.producerObj = kafka.producer(env.active.kafkajs.producer);
        
    }

    /* creates messages for each item in the data array and sends the message array to the broker
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
     */
    async sendToTopic(sharedId, msgObj) {

        // [start trace] -------------------------------
        const sp = log.TRACE.createChildSpan({ name: `${log.enums.methods.kafkaSendToTopic}` });


        // send the message to the topic
        await this.producerObj.connect()
            .then(() => this.producerObj.send({
                topic: this.writeTopic,
                messages: msgObj.messages,
                acks: enums.messageBroker.ack.all,                                  // default is 'all'
                timeout: env.active.kafkajs.send.timeout                            // milliseconds    
            }))
            .then(r => log.messaging(this.writeTopic, r[0].baseOffset, msgObj.messages, msgObj.itemCount, env.active.kafkajs.consumer.clientId))         // info = (topic, offset, msgqty, itemqty, sender) {
            .then(this.producerObj.disconnect())
            .catch(e => log.error(`${log.enums.methods.kafkaSendToTopic} Error [${this.writeTopic}]`, e));


        // [end trace] -------------------------------
        sp.endSpan();

    }

}

module.exports = KafkaProducer;
