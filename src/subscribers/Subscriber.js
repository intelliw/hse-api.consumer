//@ts-check
"use strict";
/**
 * ./subscribers/Subscriber.js
 */

 const log = require('../logger').log;

 // exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
/**
 * @param {*} subscriberObj                                             // kafka or pubsub depending n whiuch is actvive in the configs
 * @param {*} readTopic                                                 // read topic is stored for display in logs
 * @param {*} consumerObj                                               // consumer callback for listener to invoke when  a message is received
 */
class Subscriber {
    /**
     */
    constructor(subscriberObj, readTopic) {

        // setup instance variables
        this.subscriberObj = subscriberObj;
        this.readTopic = readTopic;

        // set signal traps 
        this._initialiseTraps();

    }

    // connect and listen for messages and callback the consumer - this is implemented by subtype and called by consumer
    async listen(consumerObj) {
    }

    // disconnects the subscriber - implemented by subtype
    async _disconnect() {
    }

    // remove the listener or disconnect - implemented by subtype
    async _removeListener() {
    }

    // initialise error and signal traps
    async _initialiseTraps() {

        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    log.error(`errorTypes: process.on ${type}`, e)
                    await this._disconnect();
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
                    await this._removeListener();
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }


}

module.exports = Subscriber;
