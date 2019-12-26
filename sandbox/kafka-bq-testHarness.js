//@ts-check
"use strict";


const enums = require('../src/environment/enums');

const env = require('../src/environment/env');

const { Kafka } = require('kafkajs');
const { BigQuery } = require('@google-cloud/bigquery');

// const kafkaBrokerHost = '10.140.0.6';             // 10.140.0.6 / 35.201.177.2     192.168.1.106 
const KAFKA_CONSUME_FROM_BEGINNING = true;

const topicName = env.active.messagebroker.topics.monitoring.pms;
const consumerGroupId = env.active.messagebroker.subscriptions.monitoring.pms;      // group name convention = <target system>.<target dataset>.<target table>

const consumerClientId = `${consumerGroupId}.001`;      // 

const kafka = new Kafka({
  brokers: env.active.kafka.brokers,
  clientId: consumerClientId,
})

const consumer = kafka.consumer({
  groupId: consumerGroupId,
  sessionTimeout: env.active.kafkajs.consumer.sessionTimeout,
  heartbeatInterval: env.active.kafkajs.consumer.heartbeatInterval,
  rebalanceTimeout: env.active.kafkajs.consumer.rebalanceTimeout,
  metadataMaxAge: env.active.kafkajs.consumer.metadataMaxAge,
  allowAutoTopicCreation:env.active.kafkajs.consumer.allowAutoTopicCreation,
  maxBytesPerPartition: env.active.kafkajs.consumer.maxBytesPerPartition,
  minBytes: env.active.kafkajs.consumer.minBytes,
  maxBytes: env.active.kafkajs.consumer.maxBytes,
  maxWaitTimeInMs: env.active.kafkajs.consumer.maxWaitTimeInMs,
  retry: env.active.kafkajs.consumer.retry,
  readUncommitted: env.active.kafkajs.consumer.readUncommitted
})
const bqClient = new BigQuery();                  // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hsy-api-consumer\credentials\sundaya-d75625d5dda7.json"

const retrieve = async () => {

  await consumer.connect()
  await consumer.subscribe({ topic: topicName, fromBeginning: KAFKA_CONSUME_FROM_BEGINNING })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      insertRows(message)
      // console.log(`${topic} | P:${partition} | O:${message.offset} | Ts:${message.timestamp} | Key:${message.key} | Value: >>>> ${message.value} <<<<<`);
    }
  })
}

async function insertRows(message) {
  //let rows = [{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-02-09 08:00:17.0200","time_local":"2019-02-09 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"},{"pms_id":"PMS-01-002","pack":{"id":"0248","dock":4,"volts":51.262,"amps":-0.625,"watts":-32.039,"temp":[35,33,34]},"cell":{"open":[1,6],"volts":[3.661,3.666,3.654,3.676,3.658,3.662,3.66,3.659,3.658,3.657,3.656,3.665,3.669,3.661],"vcl":3.654,"vch":3.676,"dvcl":[7,12,0,22,4,8,6,5,4,3,2,11,15,7]},"fet":{"open":[1,2],"temp":[34.1,32.2,33.5]},"sys":{"source":"S000"},"time_utc":"2019-02-09 08:00:17.0200","time_local":"2019-02-09 15:00:17.0200","time_processing":"2019-09-08 05:19:26.1940"}]
  let rows = JSON.parse(message.value)

  await bqClient
    .dataset('monitoring')
    .table('pms')
    .insert(rows);
  console.log(`Inserted ${rows.length} rows`);
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
