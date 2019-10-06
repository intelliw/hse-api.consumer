//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const enums = require('./enums');
const utils = require('./utils');

// generate a unique client id for this container instance - if this consumer is clustered each instance will have a unique id
const CONSUMER_CLIENTID = `consumer.${utils.randomIntegerString(1, 9999)}`
const PRODUCER_CLIENTID = `producer.${utils.randomIntegerString(1, 9999)}`

// kafkajs client configuration options
module.exports.kafkajs = {
    consumer: {
        clientId: CONSUMER_CLIENTID,                                          // producer client id prefix - preferred convention = <api path>.<api path>
        consumeFromBeginning: true,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        rebalanceTimeout: 60000,
        metadataMaxAge: 300000,
        allowAutoTopicCreation: true,
        maxBytesPerPartition: 1048576,
        minBytes: 1,
        maxBytes: 10485760,
        maxWaitTimeInMs: 5000,
        retry: 10,
        readUncommitted: false
    },
    producer: {                                                             // https://kafka.js.org/docs/producing   
        clientId: PRODUCER_CLIENTID,                                        // producer client id prefix - preferred convention = <api path>.<api path>
        connectionTimeout: 3000,                                            // milliseconds to wait for a successful connection   
        requestTimeout: 25000,                                              // milliseconds to wait for a successful request.    
        timeout: 30000,
        retry: {                                                            // retry options  https://kafka.js.org/docs/configuration
            maxRetryTime: 10000,                                            // max milliseconds wait for a retry (30000)
            initialRetryTime: 100,                                          // initial value in milliseconds, randomized after first time (300)
            factor: 0.2,                                                    // Randomization factor	   
            multiplier: 2,                                                  // Exponential factor
            retries: 8,                                                     // max number of retries per call (5)
            maxInFlightRequests: 200                                        // max num requestsin progress at any time. If falsey then no limit (null)
        }
    }
}

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',            // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4                                                 // decimal places for float values in monitoring dataset
}

/* constants for the environment 
   module.exports.environments is mastered in hse-api-host project and shared by hse-api-consumers 
   it should be edited in hse-api-host and copied across into hse-api-consumers project after any changes are made 
*/
module.exports.environments = {
    local: {
        api: { host: '192.168.1.106:8080', scheme: 'http' },
        kafka: {
            brokers: ['192.168.1.106:9092']                                 // localhost   | 192.168.1.106        
        },
        log: { verbose: false }
    },
    testcloud: {                                                         // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'test.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: {
            brokers: ['kafka-1-vm:9092']                                    // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        },
        log: { verbose: false }
    },
    devcloud: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'dev.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: {
            brokers: ['kafka-1-vm:9092']                                    // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        },
        log: { verbose: false }
    },
    devcloud_HA: {                                                           // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'dev.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        },
        log: { verbose: false }
    },
    prodcloud: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: {
            brokers: ['kafka-1-vm:9092']                                    // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        },
        log: { verbose: false }
    },
    prodcloud_HA: {                                                            // Kafka HA - 3 masters, N workers
        api: { host: 'api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        },
        log: { verbose: false }
    }
}

// env sets the active environment - change this to one of the environments in consts.environments -0 eg. change to 'devcloud' before release
module.exports.env = 'local';                                        // local or devcloud or prodcloud or devcloudtest

// system constants
module.exports.NONE = global.undefined;
