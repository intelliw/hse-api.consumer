//@ts-check
"use strict";
/**
 * ./publishers/KafkaPublisher.js
 *  base type for Kafka message producers  
 */
const { Kafka } = require('kafkajs');

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

const Publisher = require('./Publisher');

class KafkaPublisher extends Publisher {
    /**
     */
    constructor() {

        // create a kafka producer
        const kafka = new Kafka({
            brokers: env.active.kafka.brokers                                       //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]                                                       // https://kafka.js.org/docs/producing   
        });
        let publisherObj = kafka.producer(env.active.kafkajs.publisher);
         
        // setup instance variables specific to KafkaPublisher 
        super(publisherObj);

    }

    /** implemented by subtype
    * @param {*} msgObj
    * @param {*} writeTopic 
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async publish(msgObj, writeTopic, sender) {

        // [start trace] -------------------------------    
        const sp = log.SPAN.createChildSpan({ name: `${log.enums.methods.mbProduce}` });    // 2do  - consumer tracing does not have a root span ..

        // send the message to the topics
        try {
            
            // send the message to the topic
            await this.publisherObj.connect()                                                    // try connecting         
                .then(() => this.publisherObj.send({                                             //.. send    
                    topic: writeTopic,
                    messages: msgObj.messages,
                    acks: enums.messageBroker.ack.all,                                          //      default is 'all'
                    timeout: env.active.kafkajs.send.timeout                                    //      milliseconds    
                }))
                .then(r => log.messaging(writeTopic, `${r[0].baseOffset}-${parseInt(r[0].baseOffset) + (msgObj.messages.length - 1)}`, msgObj.messages, msgObj.itemCount, sender))         // info = (topic, id, msgqty, itemqty, sender) {
                .then(this.publisherObj.disconnect())                                    // disconnect    
                .catch(e => log.error(`${sender} ${log.enums.methods.mbProduce} Error [${writeTopic}]`, e));
            
        } catch (e) {
            log.error(`${writeTopic} ${log.enums.methods.mbProduce}`, e);
        }

        // [end trace] ---------------------------------    
        sp.endSpan();

    }

}

module.exports = KafkaPublisher;
