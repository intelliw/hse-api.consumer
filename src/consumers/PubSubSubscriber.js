//@ts-check
"use strict";
/**
 * ./consumers/PubSubSubscriber.js
 */
const { PubSub } = require('@google-cloud/pubsub');
const Consumer = require('./Consumer');

const env = require('../environment/env');
const utils = require('../environment/utils');
const log = require('../logger').log;

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

const FLOWCONTROL_MAX_MESSAGES = 100;                                       // allows processing this numbe of messages at the same time (default is 100) 

class PubSubSubscriber extends Consumer {
    /**
     * superclass - 
     * 
    instance attributes:  
        this.KafkaSubscriber
        this.readTopic = readTopic;

     constructor arguments 
    * @param {*} subscriptionId                                             //  env.active.messagebroker.subscriptions.monitoring
    * @param {*} readTopic                                                  //  the topic to read from env.active.messagebroker.topics.monitoring
    */
    constructor(subscriptionId, readTopic) {

        // store params
        super(subscriptionId, readTopic);

        // setup pull client 
        const pubsub = new PubSub();
        this.subscriberObj = pubsub.subscription(subscriptionId, {           // subscriberObj is a subscription
            flowControl: env.active.pubsub.flowControl,
            ackDeadline: env.active.pubsub.ackDeadline
        });

        // listen for messages
        this._retrieveMessages();

        // set signal traps 
        this._initialiseTraps();

    }

    // registered listener for the subscription
    async _retrieveMessages() {

        const MESSAGE_PREFIX = 'PUBSUB CONSUMER';

        // start subscription listener
        this.subscriberObj.on(`error`, e => { log.error(`${MESSAGE_PREFIX} _retrieveMessages() Error [${this.readTopic}]`, e) });
        this.subscriberObj.on('message', message => {

            // transform message if required                                                                
            const consumedMsgObj = { key: message.attributes.key, value: message.data }                  // normalise the message - pubsub messages are sent in the data attribute but the standard format is based on kafka which stores message data in the .value property
            let transformedMsgObj = this.transform(consumedMsgObj);                                       // transform dataItems - implemented by subtype 
            
            // write to bq and writetopic
            this.produce(transformedMsgObj);                                                                 // produce is implemented by subtype 
                
            message.ack();                                                                                  // acknowledge receipt of the message    
        });

    }


    // initialise error and signal traps
    async _initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    log.error(`errorTypes: process.on ${type}`, e)
                    await this.subscriberObj.close().then(process.exit(0));
                } catch (_) {
                    process.exit(1)
                }
            })
        })

        // keyboard signal traps for terminal interrupts
        signalTraps.map(type => {
            process.once(type, async () => {
                try {
                    console.log(`signalTraps: process.once ${type}`)
                    await this.subscriberObj.removeListener('message', this._retrieveMessages)
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

}


module.exports = PubSubSubscriber;