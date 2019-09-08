//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const { Kafka } = require('kafkajs');

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

class Consumer {
    /**
     * superclass - 
     * clients of subtypes must call retrieve()
     * 
    instance attributes:  
     "consumerObj": kafka.consumer()
     "clientId":  'devices.datasets'

     constructor arguments 
    * @param {*} clientId               //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} groupId                //  enums.messageBroker.consumers.groupId
    * @param {*} topicName              //  enums.messageBroker.topics.monitoring
    */
    constructor(clientId, groupId, topicName) {

        // create the consumer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,
            clientId: clientId,
        })
        this.consumerObj = kafka.consumer({ groupId: groupId });
        this.clientId = clientId;
        this.topicName = topicName;

        // error and signal traps    
        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    console.error(e)
                    await consumer.disconnect()
                    process.exit(0)
                } catch (_) {
                    process.exit(1)
                }
            })
        })
        signalTraps.map(type => {
            process.once(type, async () => {
                try {
                    console.log(`signalTraps: process.once ${type}`)
                    await consumer.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

    // called by subtype
    retrieveMessages() {
        retrieve(this.consumerObj, this.topicName).catch(e => console.error(`[${this.clientId}] ${e.message}`, e))
    }

}

const retrieve = async (consumerObj, topicName) => {

    await consumerObj.connect()
    await consumerObj.subscribe({ topic: topicName, fromBeginning: consts.kafkajs.consumeFromBeginning })
    await consumerObj.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`${topic} | P:${partition} | O:${message.offset} | TS:${message.timestamp} | Key:${message.key} | Value: >>>> ${message.value} <<<<<`);
        },

    })
}

module.exports = Consumer;