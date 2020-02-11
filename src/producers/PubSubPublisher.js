//@ts-check
"use strict";
/**
 * ./producers/PubSubProducer.js
 */
const { PubSub } = require('@google-cloud/pubsub');
const Producer = require('./Producer');

const enums = require('../environment/enums');
const env = require('../environment/env');
const log = require('../logger').log;

const moment = require('moment');


class PubSubProducer extends Producer {
    /**
     * superclass - 
     * clients of subtypes must first call extractData(), then sendToTopic()
     *  subtypes implement extractData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     publisherObj": kafka.producer()
     writeTopic:  env.active.messagebroker.topics.dataset                                                       // this is the topic to which the subclassed producer writes, in sendTopic()  
    */
    constructor(writeTopic) {

        super(writeTopic);

        // create a pubsub producer
        const pubsub = new PubSub();

        // setup instance variables specific to PubSubProducer 
        this.publisherObj = pubsub;

    }

    /**
     * @param {*} msgObj
     */
    async sendToTopic(msgObj) {

        const LOG_SENDER = 'PUBSUB PRODUCER';

        let dataBuffer, dataAttributes;

        // [start trace] -------------------------------    
        const sp = log.SPAN.createChildSpan({ name: `${log.enums.methods.mbSendToTopic}` });                   // 2do  - consumer tracing does not have a root span ..


        // create microbatching publisher                                                                       //note:  miocrobatch settings apply only for large msgObj.messages[] where you call batchPub.publish multiple times. The microbatch prevents client libs from sending messages to pubsub.             
        const BATCH_OPTIONS = env.active.pubsub.batching;
        BATCH_OPTIONS.maxMessages = msgObj.messages.length;                                                     // number of message to include in a batch before client library sends to topic. If batch size is msobj.messages.length batch will go to server after all are published 

        const batchPub = this.publisherObj.topic(this.writeTopic, { batching: BATCH_OPTIONS });
        let messageIds = [];

        // send each message to the topic - pubsub will batch and send to server after all are published
        for (let i = 0; i < msgObj.messages.length; i++) {
            (async () => {
                
                dataBuffer = Buffer.from(msgObj.messages[i].value);                                             // value attribute if kafka 
                dataAttributes = {
                    key: msgObj.messages[i].key                                                                                 
                };

                await batchPub.publish(dataBuffer, dataAttributes, (e, messageId) => {
                    // log errors
                    if (e) {
                        log.error(`${this.apiPathIdentifier} ${log.enums.methods.mbSendToTopic} Error [${this.writeTopic}]`, e);

                    // log messaging once only, after all messages in this loop have been published 
                    } else {
                        messageIds.push(messageId);
                        if (i == (msgObj.messages.length - 1)) {
                            log.messaging(this.writeTopic, messageId, msgObj.messages, msgObj.itemCount, LOG_SENDER)    // info = (topic, id, msgqty, itemqty, sender) 
                        };
                    };

                });

            })().catch(e => log.error(`${this.apiPathIdentifier} ${log.enums.methods.mbSendToTopic} Error (async) [${this.writeTopic}]`, e));
        }


        // [end trace] ---------------------------------    
        sp.endSpan();

    }

}

module.exports = PubSubProducer;
