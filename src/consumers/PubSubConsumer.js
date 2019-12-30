//@ts-check
"use strict";
/**
 * ./consumers/PubSubConsumer.js
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

class PubSubConsumer extends Consumer {
    /**
     * superclass - 
     * 
    instance attributes:  
        this.kafkaConsumer
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
        this.consumerObj = pubsub.subscription(subscriptionId, {           // consumerObj is a subscription
            flowControl: {
                maxMessages: FLOWCONTROL_MAX_MESSAGES,                     // max messages to process at the same time (to allow in memory) before pausing the message stream. allowExcessMessages should be set to false 
                allowExcessMessages: false                                 // this tells the client to manage and lock any excess messages 
            }
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
        this.consumerObj.on(`error`, e => { log.error(`${MESSAGE_PREFIX} _retrieveMessages() Error [${this.readTopic}]`, e) });
        this.consumerObj.on('message', message => {

            // write to bq and write topic
            const normalisedMessage = { key: message.attributes.key, value: message.data }                                          // normalise the message - pubsub messages are sent in the data attribute but the standard format is based on kafka which stores message data in the .value property
            let results = super.isMonitoringDataset() ? super.transformMonitoringDataset(normalisedMessage) : normalisedMessage;    // transform dataItems  e.g. results: { itemCount: 9, messages: [. . .] } .. transformMonitoringDataset is implemented by super, it calls transformDataItem in subtype 
            this.produce(results);                                                                                                  // produce is implemented by subtype        
            // console.log(`results: ${results.messages[0].value}`);

            // acknowledge receipt of the message
            message.ack();
        });

    }

    // this is for debug use only
    async _listSubscriptions(pubsub) {

        // Lists all subscriptions in the current project
        const [subscriptions] = await pubsub.getSubscriptions();
        subscriptions.forEach(subscription => log.trace(log.enums.labels.watchEnv, 'Subscription', subscription.name));
        
    }

    // initialise error and signal traps
    async _initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    log.error(`errorTypes: process.on ${type}`, e)
                    await this.consumerObj.close().then(process.exit(0));
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
                    await this.consumerObj.removeListener('message', this._retrieveMessages)
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

}


module.exports = PubSubConsumer;