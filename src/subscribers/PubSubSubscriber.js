//@ts-check
"use strict";
/**
 * ./subscribers/PubSubSubscriber.js
 */
const { PubSub } = require('@google-cloud/pubsub');

const Subscriber = require('./Subscriber');

const env = require('../environment/env');
const log = require('../logger').log;


const FLOWCONTROL_MAX_MESSAGES = 100;                                       // allows processing this numbe of messages at the same time (default is 100) 

class PubSubSubscriber extends Subscriber {
    /**
     constructor arguments 
    * @param {*} subscriptionId                                             //  env.active.messagebroker.subscriptions.monitoring.analytics
    * @param {*} readTopic                                                  //  this is not needed for pubsub
    */
    constructor(subscriptionId, readTopic) {

        // setup pull client 
        const pubsub = new PubSub();
        let subscriberObj = pubsub.subscription(subscriptionId, {           // subscriberObj is a subscription
            flowControl: env.active.pubsub.flowControl,
            ackDeadline: env.active.pubsub.ackDeadline
        });

        // super
        super(subscriberObj, readTopic);

    }

    // connect and listen for messages and callback the consumerObj
    async listen(consumerObj) {

        try {
            // start subscription listener
            this.subscriberObj.on(`error`, e => { log.error(`PubSub listen() Error [${this.readTopic}]`, e) });
            this.subscriberObj.on('message', message => {

                // transform message if required                                                                
                const retrievedMsgObj = { key: message.attributes.key, value: message.data }                  // normalise the message - pubsub messages are sent in the data attribute but the standard format is based on kafka which stores message data in the .value property
                
                // call consumer 
                consumerObj.consume(retrievedMsgObj);                                                                 // produce is implemented by subtype 
                    
                message.ack();                                                                                  // acknowledge receipt of the message    
            });

        } catch (e) {
            
            log.error(`[${env.active.pubsub.subscriber.clientId}] PubSub subscriber Error`, e);
        }

    }

    // disconnects the subscriber - implemented by subtype, called by super
    async _disconnect() {
        await this.subscriberObj.close().then(process.exit(0));
    }

    // remove the listener or disconnect - implemented by subtype
    async _removeListener() {
        await this.subscriberObj.removeListener('message', this.listen)
    }

}


module.exports = PubSubSubscriber;