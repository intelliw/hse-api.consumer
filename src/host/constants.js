//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const enums = require('./enums');
const utils = require('./utils');

// generate a unique client id for this container instance - if this consumer is clustered each instance will have a unique id
const CONSUMER_CLIENTID = `consumer.${utils.randomIntegerString(1,9999)}`
const PRODUCER_CLIENTID = `producer.${utils.randomIntegerString(1,9999)}`

// kafkajs client configuration options
module.exports.kafkajs = {
    consumeFromBeginning: true,
    consumer: {
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
        readUncommitted: false,
        clientId: CONSUMER_CLIENTID                                          // producer client id prefix - preferred convention = <api path>.<api path>
    },
    producer: {                                                             // producer client Ids
        clientId: PRODUCER_CLIENTID                                         // producer client id prefix - preferred convention = <api path>.<api path>
    }    
}

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                 // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',             // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// system constants for the environment
module.exports.environments = {
    local: {
        kafka: {
            brokers: ['192.168.1.106:9092']                                 // localhost   | 192.168.1.106        
        }
    },
    devcloudtest: {                                                         // single node kafka- 1 master, N workers
        kafka: {
            brokers: ['kafka-1-vm:9092']                                    // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        }
    },
    devcloud: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        }
    },
    prodcloud: {                                                            // Kafka HA - 3 masters, N workers
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        }
    }
}

// env sets the active environment - change this to one of the environments in consts.environments -0 eg. change to 'devcloud' before release
module.exports.env = 'local';                                        // local or devcloud or prodcloud or devcloudtest

// system constants
module.exports.NONE = global.undefined;
