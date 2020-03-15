//@ts-check
"use strict";
/**
 * ./publishers/PubSubPublisher.js
 *  base type for Kafka message producers  
 */
const { PubSub } = require('@google-cloud/pubsub');

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

const Publisher = require('./Publisher');

class PubSubPublisher extends Publisher{
    /**
     */
    constructor() {

        // create a pubsub producer
        const publisherObj = new PubSub();

        // setup instance variables specific to PubSubPublisher 
        super(publisherObj);
    }

    /** implemented by subtype
    * @param {*} msgObj               
    * @param {*} writeTopic 
    * @param {*} senderId                                                                                     // is based on the api key and identifies the source of the data. this value is added to 'sender' attribute 
    */
    async publish(msgObj, writeTopic, senderId) {

        let dataBuffer, dataAttributes;

        // [start trace] -------------------------------    
        const sp = log.SPAN.createChildSpan({ name: `${log.enums.methods.mbProduce}` });                    // 2do  - consumer tracing does not have a root span ..

        // send the message to the topics
        try {
            
            // create microbatching publisher                                                               //note:  miocrobatch settings apply only for large msgObj.messages[] where you call batchPub.publish multiple times. The microbatch prevents client libs from sending messages to pubsub.             
            const BATCH_OPTIONS = env.active.pubsub.batching;
            BATCH_OPTIONS.maxMessages = msgObj.messages.length;                                             // number of message to include in a batch before client library sends to topic. If batch size is msobj.messages.length batch will go to server after all are published 

            const batchPub = this.publisherObj.topic(writeTopic, { batching: BATCH_OPTIONS });
            let messageIds = [];

            // send each message to the topic - pubsub will batch and send to server after all are published
            for (let i = 0; i < msgObj.messages.length; i++) {

                (async () => {

                    dataBuffer = Buffer.from(msgObj.messages[i].value);                                     // value attribute if kafka 
                    dataAttributes = {
                        key: msgObj.messages[i].key
                    };

                    // publish message 
                    await batchPub.publish(dataBuffer, dataAttributes, (e, messageId) => {
                        // log errors
                        if (e) {
                            log.error(`${writeTopic} ${log.enums.methods.mbProduce} Error [${writeTopic}]`, e);

                        // log messaging once only, after all messages in this batch/loop have been published 
                        } else {
                            messageIds.push(messageId);
                            if (i == (msgObj.messages.length - 1)) {
                                log.messaging(writeTopic, messageIds, msgObj.messages, msgObj.itemCount, senderId)     // info = (topic, id, msgqty, itemqty, sender) {;
                            };
                        };

                    });

                })().catch(e => log.error(`${senderId} ${log.enums.methods.mbProduce} Error (async) [${writeTopic}]`, e));
            }

        } catch (e) {
            log.error(`${writeTopic} ${log.enums.methods.mbProduce}`, e);
        }

        // [end trace] ---------------------------------    
        sp.endSpan();

    }

}

module.exports = PubSubPublisher;
