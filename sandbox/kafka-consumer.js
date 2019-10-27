//@ts-check
"use strict";

const enums = require('../src/host/enums');

const { Kafka } = require('kafkajs');

// const kafkaBrokerHost = '10.140.0.6';             // 10.140.0.6 / 35.201.177.2     192.168.1.106 
const KAFKA_CONSUME_FROM_BEGINNING = true;

const topicName = env.active.topics.monitoring.pms;
const consumerGroupId = enums.messageBroker.consumers.groupId.pms;      // group name convention = <target system>.<target dataset>.<target table>

const consumerClientId = `${consumerGroupId}.001`;      // 

const kafka = new Kafka({
  brokers: env.active.kafka.brokers,
  clientId: consumerClientId,
})

const consumer = kafka.consumer({ groupId: consumerGroupId })

const retrieve = async () => {

  await consumer.connect()
  await consumer.subscribe({ topic: topicName, fromBeginning: KAFKA_CONSUME_FROM_BEGINNING })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`${topic} | P:${partition} | O:${message.offset} | TS:${message.timestamp} | Key:${message.key} | Value: >>>> ${message.value} <<<<<`);
    },

  })
}

retrieve().catch(e => console.error(`[${consumerClientId}] ${e.message}`, e))

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

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
