//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 */
const consts = require('../host/constants');
const enums = require('../host/enums');

const { Kafka } = require('kafkajs');
const { BigQuery } = require('@google-cloud/bigquery');

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
     topicName
     dataset
     table

     constructor arguments 
    * @param {*} clientId               //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} groupId                //  enums.messageBroker.consumers.groupId
    * @param {*} topicName              //  enums.messageBroker.topics.monitoring
    */
    constructor(clientId, groupId, topicName, dataset, table) {

        // create the kafka consumer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,
            clientId: clientId,
        })
        this.kafkaConsumer = kafka.consumer({ groupId: groupId });
        this.clientId = clientId;
        this.topicName = topicName;

        // bigquery parameters
        this.bqClient = new BigQuery();                  // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hse-api-consumer\credentials\sundaya-d75625d5dda7.json"
        this.dataset = dataset;
        this.table = table;

        // error and signal traps    
        errorTypes.map(type => {
            process.on(type, async e => {
                try {
                    console.log(`errorTypes: process.on ${type}`)
                    console.error(e)
                    await this.kafkaConsumer.disconnect()
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
                    await this.kafkaConsumer.disconnect()
                } finally {
                    process.kill(process.pid, type)
                }
            })
        })
    }

    // called by subtype / client
    processMessages() {
        // get message from the broker
        retrieveMessages(this.kafkaConsumer, this.topicName, this.bqClient, this.dataset, this.table).catch(e => console.error(`[${this.clientId}] ${e.message}`, e));

    }

}

const retrieveMessages = async (kafkaConsumer, topicName, bqClient, dataset, table) => {
    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe({ topic: topicName, fromBeginning: consts.kafkajs.consumeFromBeginning });
    await kafkaConsumer.run({
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
            for (let message of batch.messages) {
                if (!isRunning() || isStale()) break
                await processMessage(message)
                await resolveOffset(message.offset)
                await heartbeat()
            }
        },
    });
}

const processMessage = async (bqClient, dataset, table, message) => {
    await bqClient
        .dataset(dataset)
        .table(table)
        .insert([message]);
}


const XretrieveMessages = async (kafkaConsumer, topicName, bqClient, dataset, table) => {
    let messages = [];

    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe({ topic: topicName, fromBeginning: consts.kafkajs.consumeFromBeginning });
    await kafkaConsumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            //console.log(`${topic} | P:${partition} | O:${message.offset} | Ts:${message.timestamp} | Key:${message.key} | Value: >>>> ${message.value} <<<<<`);
            // messages.push(message.value);
            // console.log('Retrieving');
            // console.log(`THIS: ${JSON.stringify(messages)}`);
            // const rows = [{ "pms_id": "PMS-01-002", "pack": { "id": "0248", "dock": 4, "volts": 51.262, "amps": -0.625, "watts": -32.039, "temp": [35, 33, 34] }, "cell": { "open": [1, 6], "volts": [3.661, 3.666, 3.654, 3.676, 3.658, 3.662, 3.66, 3.659, 3.658, 3.657, 3.656, 3.665, 3.669, 3.661], "vcl": 3.654, "vch": 3.676, "dvcl": [7, 12, 0, 22, 4, 8, 6, 5, 4, 3, 2, 11, 15, 7] }, "fet": { "open": [1, 2], "temp": [34.1, 32.2, 33.5] }, "sys": { "source": "S000" }, "time_utc": "2019-02-09 08:00:17.0200", "time_local": "2019-02-09 15:00:17.0200", "time_processing": "2019-09-08 05:19:26.1940" }]
            /*
            await bqClient
                .dataset(dataset)
                .table(table)
                .insert([message]);
            console.log(`Inserted ${message.length} rows`);
            */
        }
    });

}


module.exports = Consumer;