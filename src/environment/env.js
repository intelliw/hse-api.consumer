//@ts-check
'use strict';
/**
 * ./common/environments.js
 * shared constants for environment configuration 
 * these configs are shared between host anmd consumer 
 */

const utils = require('./utils');
const enums = require('./enums');


/* environment configurables  
    env.js is mastered in hse-api-host project and shared by hse-api-consumers etc.
        it should be edited in hse-api-host and copied across to hse-api-consumers project if any changes are made 
    logging verbosity and appenders provide startup configuration for logger.logs  - at runtime it canb e changed through GET: api/logging?verbosity=info,debug&appenders=console,stackdriver;
    - verbosity determines the loglevel (none, info, or debug)
    - appenders determines the output destination (console, or stackdriver)
*/

// referenced configs - these configs are reused in the ENVIRONMENT section -----------------------------------------------------------------------------------------------------------------

// API 
const _API = {

    // API host for dev, prod, and test
    HOST: {
        DEV: 'dev.api.sundaya.monitored.equipment',
        TEST: 'test.api.sundaya.monitored.equipment',
        PROD: 'api.sundaya.monitored.equipment'
    },

    // API versions 
    VERSIONS: {
        supported: '0.2 0.3',
        current: '0.3.12.10'
    }
}

// feature toggles - a feature is 'on' if it is present in the list    
const _FEATURES = {
    DEV: {
        release: [],
        operational: [
            enums.features.operational.logging,
            enums.features.operational.validation],
        experiment: [],
        permission: []
    },
    TEST: {
        release: [],
        operational: [
            enums.features.operational.logging],
        experiment: [],
        permission: []
    },
    PROD: {
        release: [],
        operational: [
            enums.features.operational.logging],
        experiment: [],
        permission: []
    }
}


// standard configurations for logging 
const _LOGGING = {
    DEV: {
        statements: [
            enums.logging.statements.messaging,
            enums.logging.statements.data,
            enums.logging.statements.exception,
            enums.logging.statements.error,
            enums.logging.statements.trace],
        verbosity: [
            enums.logging.verbosity.debug],
        appenders: [
            enums.logging.appenders.stackdriver,
            enums.logging.appenders.console]
    },
    TEST: {
        statements: [
            enums.logging.statements.messaging,
            enums.logging.statements.data,
            enums.logging.statements.exception,
            enums.logging.statements.error],
        verbosity: [
            enums.logging.verbosity.info],
        appenders: [
            enums.logging.appenders.stackdriver]
    },
    PROD: {
        statements: [
            enums.logging.statements.messaging,
            enums.logging.statements.data,
            enums.logging.statements.exception,
            enums.logging.statements.error],
        verbosity: [
            enums.logging.verbosity.info],
        appenders: [
            enums.logging.appenders.stackdriver]
    }
}


// kafka broker definitions for clustered and non-clustered environments 
const _KAFKA = {
    BROKERS: {
        SINGLE: ['kafka-1-vm:9092'],                                            // single broker instance
        HA: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']                        // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
    }
}


// kafkajs client configuration options
const _KAFKAJS = {
    consumer: {
        clientId: `consumer.${utils.randomIntegerString(1, 9999)}`,                                        // producer client id prefix - preferred convention = <api path>.<api path>
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
        clientId: `producer.${utils.randomIntegerString(1, 9999)}`,         // generate a unique client id for this container instance - if this consumer is clustered each instance will have a unique id                               // producer client id prefix - preferred convention = <api path>.<api path> 
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


// standard kafka topics for each environment type 
const _TOPICS = {
    DEV: {                                                                  // kafka topics for DEV environments 
        monitoring: { pms: 'monitoring.dev_pms', mppt: 'monitoring.dev_mppt', inverter: 'monitoring.dev_inverter' },
        system: { feature: 'system.dev_feature' },
        dataset: { pms: 'monitoring.dev_pms.dataset', mppt: 'monitoring.dev_mppt.dataset', inverter: 'monitoring.dev_inverter.dataset' }
    },
    TEST: {                                                                  // kafka topics for TEST environments 
        monitoring: { pms: 'monitoring.test_pms', mppt: 'monitoring.test_mppt', inverter: 'monitoring.test_inverter' },
        system: { feature: 'system.test_feature' },
        dataset: { pms: 'monitoring.test_pms.dataset', mppt: 'monitoring.test_mppt.dataset', inverter: 'monitoring.test_inverter.dataset' }
    },
    PROD: {                                                                 // kafka topics for PROD environments 
        monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },                            //  topics for monitoring data received from api host
        system: { feature: 'system.feature' },
        dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' }        //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
    }
}



// GCP project configs per environment 
const _GCP = {
    DEV: { project: "sundaya" },
    TEST: { project: "sundaya" },
    PROD: { project: "sundaya" }
}


// stackdriver client configuration options
const _STACKDRIVER = {
    DEV: {
        logging: { logName: 'monitoring_dev', resource: 'gce_instance' },       // appears in logs as jsonPayload.logName: "projects/sundaya/logs/monitoring"  the format is "projects/[PROJECT_ID]/logs/[LOG_ID]"
        errors: { reportMode: 'always', logLevel: 5 }                           // 'production' (default), 'always', or 'never' - 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. // 2 (warnings). 0 (no logs) 5 (all logs)      
    },
    TEST: {
        logging: { logName: 'monitoring_test', resource: 'gce_instance' },
        errors: { reportMode: 'always', logLevel: 5 }
    },
    PROD: {
        logging: { logName: 'monitoring_prod', resource: 'gce_instance' },
        errors: { reportMode: 'always', logLevel: 5 }
    }
}



// bq datasets for each environment type 
const _DATAWAREHOUSE = {
    DEV: {                                                                  // bq datasets for DEV environments 
        datasets: { monitoring: 'monitoring' },
        tables: { pms: 'dev_pms', mppt: 'dev_mppt', inverter: 'dev_inverter', TEST: 'TEST' }
    },
    TEST: {                                                                  // bq datasets for TEST environments 
        datasets: { monitoring: 'monitoring' },
        tables: { pms: 'test_pms', mppt: 'test_mppt', inverter: 'test_inverter', TEST: 'TEST' }
    },
    PROD: {                                                                 // bq datasets for PROD environments 
        datasets: { monitoring: 'monitoring' },
        tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter', TEST: 'TEST' }
    }
}



/* // list of environments  and their configs -----------------------------------------------------------------------------------------------------------------
    environment definitions - these share fixed configs per environemtn type (PROD, DEV, CLOUD) as defined in above constants, 
    or the constants can be overridden and defined individually for each environment if needed 
*/
module.exports.CONFIGS = {
    local: {
        api: { host: '192.168.1.108:8080', scheme: 'http', versions: _API.VERSIONS },
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        kafka: { brokers: ['192.168.1.108:9092'] },                             // localhost   | 192.168.1.108            
        kafkajs: _KAFKAJS,
        topics: _TOPICS.DEV,
        gcp: _GCP.DEV,
        stackdriver: _STACKDRIVER.DEV,
        datawarehouse: _DATAWAREHOUSE.DEV
    },
    testcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: _API.HOST.TEST, scheme: 'https', versions: _API.VERSIONS },
        features: _FEATURES.TEST,
        logging: _LOGGING.TEST,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },
        kafkajs: _KAFKAJS,
        topics: _TOPICS.TEST,
        gcp: _GCP.TEST,
        stackdriver: _STACKDRIVER.TEST,
        datawarehouse: _DATAWAREHOUSE.TEST
    },
    devcloud: {                                                                 // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: _API.HOST.DEV, scheme: 'https', versions: _API.VERSIONS },
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },                                     // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
        kafkajs: _KAFKAJS,
        topics: _TOPICS.DEV,
        gcp: _GCP.DEV,
        stackdriver: _STACKDRIVER.DEV,
        datawarehouse: _DATAWAREHOUSE.DEV
    },
    devcloud_HA: {                                                              // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: _API.HOST.DEV, scheme: 'https', versions: _API.VERSIONS },
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        kafka: { brokers: _KAFKA.BROKERS.HA },                                         // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        kafkajs: _KAFKAJS,
        topics: _TOPICS.DEV,
        gcp: _GCP.DEV,
        stackdriver: _STACKDRIVER.DEV,
        datawarehouse: _DATAWAREHOUSE.DEV
    },
    prodcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: _API.HOST.PROD, scheme: 'https', versions: _API.VERSIONS },
        features: _FEATURES.PROD,
        logging: _LOGGING.PROD,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },                                     // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11   
        kafkajs: _KAFKAJS,
        topics: _TOPICS.PROD,
        gcp: _GCP.PROD,
        stackdriver: _STACKDRIVER.PROD,
        datawarehouse: _DATAWAREHOUSE.PROD
    },
    prodcloud_HA: {                                                             // Kafka HA - 3 masters, N workers
        api: { host: _API.HOST.PROD, scheme: 'https', versions: _API.VERSIONS },
        features: _FEATURES.PROD,
        logging: _LOGGING.PROD,
        kafka: { brokers: _KAFKA.BROKERS.HA },                                         // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        kafkajs: _KAFKAJS,
        topics: _TOPICS.PROD,
        gcp: _GCP.PROD,
        stackdriver: _STACKDRIVER.PROD,
        datawarehouse: _DATAWAREHOUSE.PROD
    }
}

// env.active returns the active environment 
module.exports.active = this.CONFIGS.local;      // change enums.environments to 'local' to develop locally or to 'devcloud' to develop online                               
