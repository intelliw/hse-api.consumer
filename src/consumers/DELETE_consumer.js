const consts = require('../host/constants');
const enums = require('../host/enums');

// const kafkaBrokerHost = '10.140.0.6';             // 10.140.0.6 / 35.201.177.2     192.168.1.106 
const kafkaConsumerGroup = 'bq.monitoring.pms';                 // group name convention = <target system>.<target dataset>.<target table>
const kafkaConsumerClientId = `${kafkaConsumerGroup}.001`;      // 
const KAFKA_CONSUME_FROM_BEGINNING = true;

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  brokers: consts.environments[consts.env].kafka.brokers,
  clientId: kafkaConsumerClientId,
})
const consumer = kafka.consumer({ groupId: kafkaConsumerGroup })

const retrieve = async () => {

  let topicName = enums.messageBroker.topics.monitoring.pms;
  let consumerGroupId = enums.messageBroker.consumers.groupId.pms;

  await consumer.connect()
  await consumer.subscribe({ topic: topicName, fromBeginning: KAFKA_CONSUME_FROM_BEGINNING })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`${topic} | P:${partition} | O:${message.offset} | TS:${message.timestamp} | Key:${message.key} | Value: ...`);
      console.log(`>>>> ${message.value} <<<<<`);
    },

  })
}

retrieve().catch(e => console.error(`[${kafkaConsumerClientId}] ${e.message}`, e))

// exits for errors and terminal keyboard inputs  
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
    process.on(type, async () => {
        try {
            console.log(`exiting on error: ${type}`)
            await producer.disconnect()
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps.map(type => {
    process.once(type, async () => {
        try {
            console.log(`exiting on signal: ${type}`)
            await producer.disconnect()
        } finally {
            process.kill(process.pid, type)
        }
    })
})
