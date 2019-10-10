//@ts-check
'use strict';
/**
 * ./host/configCommon.js
 * shared constants for environment configuration 
 * these configs are shared between host anmd consumer 
 */

const utilsc = require('./utilsCommon');

// generate a unique client id for this container instance - if this consumer is clustered each instance will have a unique id
const CONSUMER_CLIENTID = `consumer.${utilsc.randomIntegerString(1, 9999)}`
const PRODUCER_CLIENTID = `producer.${utilsc.randomIntegerString(1, 9999)}`

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
        connectionTimeout: 3000,                                            // milliseconds to wait for a successful connection (3000)  
        requestTimeout: 25000,                                              // milliseconds to wait for a successful request. (25000)   
        timeout: 30000,
        retry: {                                                            // retry options  https://kafka.js.org/docs/configuration
            maxRetryTime: 10000,                                            // max milliseconds wait for a retry (30000) (10000)
            initialRetryTime: 100,                                          // initial value in milliseconds (300), randomized after first time 
            factor: 0.2,                                                    // Randomization factor	(0.2)   
            multiplier: 2,                                                  // Exponential factor (2)
            retries: 8,                                                     // max number of retries per call (5)
            maxInFlightRequests: 100                                        // max num requests in progress at any time (200). If falsey then no limit (null)
        }
    }    
}


 /* constants for the environment 
   module.exports.env is mastered in hse-api-host project and shared by hse-api-consumers 
   it should be edited in hse-api-host and copied across into hse-api-consumers project after any changes are made 
*/
module.exports.env = {
    local: {
        api: { host: '192.168.1.108:8080', scheme: 'http' },
        kafka: { brokers: ['192.168.1.108:9092'] },                             // localhost   | 192.168.1.108            
        topics: { monitoring: { pms: 'monitoring.dev_pms', mppt: 'monitoring.dev_mppt', inverter: 'monitoring.dev_inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.dev_pms.dataset', mppt: 'monitoring.dev_mppt.dataset', inverter: 'monitoring.dev_inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' }, 
            tables: { pms: 'dev_pms', mppt: 'dev_mppt', inverter: 'dev_inverter', TEST: 'TEST' } },
        log: { verbose: false }
    },
    testcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'test.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: { brokers: ['kafka-1-vm:9092'] },                                // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
        topics: { monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' },
            tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' } },
        log: { verbose: false }
    },
    devcloud: {                                                                 // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'dev.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: { brokers: ['kafka-1-vm:9092'] },                                // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
        topics: { monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' },
            tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' } },
        log: { verbose: false }
    },
    devcloud_HA: {                                                              // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'dev.api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: { brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092'] },       // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        topics: { monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' },
            tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' } },
        log: { verbose: false }
    },
    prodcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: { brokers: ['kafka-1-vm:9092'] },                                // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11   
        topics: { monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' },
            tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' } },
        log: { verbose: false }
    },
    prodcloud_HA: {                                                             // Kafka HA - 3 masters, N workers
        api: { host: 'api.sundaya.monitored.equipment', scheme: 'https' },
        kafka: { brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092'] },       // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        topics: { monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                      //  topics for monitoring data received from api host
            dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' } },     //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
        datawarehouse: { datasets: { monitoring: 'monitoring' },
            tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' } },
        log: { verbose: false }
    }
}

// env sets the active environment - change this to one of the environments in consts.environments -0 eg. change to 'devcloud' before release
module.exports.env.active = 'local';                                               // local or devcloud or prodcloud
