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
    env.js is mastered in hsy-api-host project and shared by hsy-api-consumers etc.
        it should be edited in hsy-api-host and copied across to hsy-api-consumers project if any changes are made 
    logging verbosity and appenders provide startup configuration for logger.logs  - at runtime it canb e changed through GET: api/logging?verbosity=info,debug&appenders=console,stackdriver;
    - verbosity determines the loglevel (none, info, or debug)
    - appenders determines the output destination (console, or stackdriver)
*/

// referenced configs - these configs are included by reference in the CONFIGS block below -----------------------------------------------------------------------------------------------------------------

// API 
const _API = {

    // API host and versions for dev, prod, and test            version = major.minor[.build[.revision]]   ..Odd-numbers for development even for stable
    LOCAL: { host: '192.168.1.108:8080', scheme: 'http', versions: { supported: '0.2 0.3', current: '0.3.12.10' } },
    DEV: { host: 'api.dev.sundaya.monitored.equipment', scheme: 'https', versions: { supported: '0.2 0.3', current: '0.3.12.21' } },
    STAGE: { host: 'api.stage.sundaya.monitored.equipment', scheme: 'https', versions: { supported: '0.2 0.3', current: '0.3.12.21' } },
    TEST: { host: 'api.test.sundaya.monitored.equipment', scheme: 'https', versions: { supported: '0.2 0.3', current: '0.3.12.10' } },
    PROD: { host: 'api.sundaya.monitored.equipment', scheme: 'https', versions: { supported: '0.2 0.3', current: '0.3.12.10' } }

}

// feature toggles - a feature is 'on' if it is present in the list    
const _FEATURES = {
    DEV: {
        release: [enums.features.release.none],
        operational: [
            enums.features.operational.logging,
            enums.features.operational.validation],
        experiment: [enums.features.experiment.none],
        permission: [enums.features.permission.none]
    },
    TEST: {
        release: [enums.features.release.none],
        operational: [
            enums.features.operational.logging,
            enums.features.operational.validation],
        experiment: [enums.features.experiment.none],
        permission: [enums.features.permission.none]
    },
    PROD: {
        release: [enums.features.release.none],
        operational: [
            enums.features.operational.logging,
            enums.features.operational.validation],
        experiment: [enums.features.experiment.none],
        permission: [enums.features.permission.none]
    }
}


// logging configurations - statements, verbosity, and appenders, for each environment
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


// topics for each environment type                          
const _MESSAGEBROKER = {
    provider: enums.messageBroker.providers.kafka,                      // kafka or pubsub        
    topics: {                                                           // kafka / pubsub topics for all environments 
        monitoring: { pms: 'monitoring.pms', mppt: 'monitoring.mppt', inverter: 'monitoring.inverter' },
        system: { feature: 'system.feature' },
        dataset: { pms: 'monitoring.pms.dataset', mppt: 'monitoring.mppt.dataset', inverter: 'monitoring.inverter.dataset' }
    }, 
    subscriptions: {                                                    // for kafka these are groupids 
        monitoring: { pms: 'sub-monitoring.pms', mppt: 'sub-monitoring.mppt', inverter: 'sub-monitoring.inverter' },
        system: { feature: 'sub-system.feature' }
    }
}

const _PUBSUB = {
    batching: { 
        maxMessages: 1,                                                 // number of message to include in a batch before client library sends to topic. If batch size is msobj.messages.length batch will go to server after all are published. if batch size is 1 batching is effectively off. 
        maxMilliseconds: 10000 }                                        // max number of millisecs to wait for MAX_MESSAGES_PER_BATCH before client lib sends all messages to the topic 
}


// kafka broker definitions for clustered and non-clustered environments 
const _KAFKA = {
    BROKERS: {
        SINGLE: ['kafka-1-vm:9092'],                                        // single broker instance
        HA: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']                    // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
    }
}



// kafkajs client configuration options
const _KAFKAJS = {
    consumer: {
        clientId: `consumer.${utils.randomIntegerString(1, 9999)}`,         // unique client id for this instance, created at startup - preferred convention = <api path>.<api path>
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
    producer: {
        clientId: `producer.${utils.randomIntegerString(1, 9999)}`,         // generate a unique client id for this container instance - if this consumer is clustered each instance will have a unique id                               // producer client id prefix - preferred convention = <api path>.<api path> 
        connectionTimeout: 3000,                                            // milliseconds to wait for a successful connection (3000)  
        requestTimeout: 25000,                                              // milliseconds to wait for a successful request. (25000)   
        retry: {                                                            // retry options  https://kafka.js.org/docs/configuration
            maxRetryTime: 30000,                                            // max milliseconds wait for a retry (30000) (10000)
            initialRetryTime: 300,                                          // initial value in milliseconds (300), randomized after first time 
            factor: 0.2,                                                    // Randomization factor	(0.2)   
            multiplier: 2,                                                  // Exponential factor (2)
            retries: 8,                                                     // max number of retries per call (5)
            maxInFlightRequests: 100                                        // max num requests in progress at any time (200). If falsey then no limit (null)
        },
        metadataMaxAge: 300000,                                             // milliseconds after which we force refresh of partition leadership changes to proactively discover new brokers or partitions
        allowAutoTopicCreation: true,
        transactionTimeout: 25000                                           // maximum ms that transaction coordinator will wait for a status update from producer before aborting
    },
    send: {
        timeout: 30000                                                      // time to await a response in ms
    }
}


// GCP project configs per environment 
const _GCP = {
    DEV: { project: enums.gcp.projects.sundayaDev },
    STAGE: { project: enums.gcp.projects.sundayaStage },
    TEST: { project: enums.gcp.projects.sundayaTest },
    PROD: { project: enums.gcp.projects.sundayaProd }
}

// stackdriver client configuration options
const _STACKDRIVER = {
    DEV: {
        logging: { logName: 'monitoring_dev', resourceType: 'gce_instance' },           // cloud run resourceType is "cloud_run_revision", for GCE VM Instance it is ''gce_instance' logName appears in logs as jsonPayload.logName: "projects/sundaya/logs/monitoring"  the format is "projects/[PROJECT_ID]/logs/[LOG_ID]". 
        errors: { reportMode: 'always', logLevel: 5 },                                  // 'production' (default), 'always', or 'never' - 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. // 2 (warnings). 0 (no logs) 5 (all logs)      
        trace: {
            samplingRate: 500, enabled: true, flushDelaySeconds: 1,                     // enabled=false to turn OFF tracing. samplingRate 500 means sample 1 trace every half-second, 5 means at most 1 every 200 ms. flushDelaySeconds = seconds to buffer traces before publishing to Stackdriver, keep short to allow cloud run to async trace immedatily after sync run
            ignoreUrls: [/^\/static/], ignoreMethods: ['OPTIONS', 'PUT']                // ignore /static path, ignore requests with OPTIONS & PUT methods (case-insensitive)
        }
    },
    TEST: {
        logging: { logName: 'monitoring_test', resourceType: 'gce_instance' },
        errors: { reportMode: 'always', logLevel: 5 },
        trace: {
            samplingRate: 500, enabled: true, flushDelaySeconds: 1,
            ignoreUrls: [/^\/static/], ignoreMethods: ['OPTIONS', 'PUT']
        }
    },
    PROD: {
        logging: { logName: 'monitoring_prod', resourceType: 'gce_instance' },
        errors: { reportMode: 'always', logLevel: 5 },
        trace: {
            samplingRate: 500, enabled: true, flushDelaySeconds: 1,
            ignoreUrls: [/^\/static/], ignoreMethods: ['OPTIONS', 'PUT']
        }
    }
}



// bq datasets for each environment type 
const _DATAWAREHOUSE = {                                                                // bq datasets for all environments 
    datasets: { monitoring: 'monitoring' },
    tables: { pms: 'pms', mppt: 'mppt', inverter: 'inverter' }
}



/* // list of environments  and their configs -----------------------------------------------------------------------------------------------------------------
    environment definitions - these share fixed configs per environemtn type (PROD, DEV, CLOUD) as defined in above constants, 
    or the constants can be overridden and defined individually for each environment if needed 
*/
module.exports.CONFIGS = {
    local: {
        api: _API.LOCAL,
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        stackdriver: _STACKDRIVER.DEV,
        messagebroker: _MESSAGEBROKER,                                          // kafka or pubsub
        pubsub: _PUBSUB,
        kafka: { brokers: ['192.168.1.108:9092'] },                             // localhost   | 192.168.1.108            
        kafkajs: _KAFKAJS,
        gcp: _GCP.DEV,                                          
        
        datawarehouse: _DATAWAREHOUSE
    },
    testcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: _API.TEST,
        features: _FEATURES.TEST,
        logging: _LOGGING.TEST,
        stackdriver: _STACKDRIVER.TEST,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },
        kafkajs: _KAFKAJS,
        gcp: _GCP.TEST,
        datawarehouse: _DATAWAREHOUSE
    },
    stagecloud: {                                                               // single node kafka, or Kafka Std - 1 master, N workers
        api: _API.STAGE,
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        stackdriver: _STACKDRIVER.DEV,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },                              // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
        kafkajs: _KAFKAJS,
        gcp: _GCP.STAGE,
        
        datawarehouse: _DATAWAREHOUSE
    },
    devcloud: {                                                                 // single node kafka, or Kafka Std - 1 master, N workers
        api: _API.DEV,
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        stackdriver: _STACKDRIVER.DEV,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },                              // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11
        kafkajs: _KAFKAJS,
        gcp: _GCP.DEV,
        
        datawarehouse: _DATAWAREHOUSE
    },
    devcloud_HA: {                                                              // single node kafka, or Kafka Std - 1 master, N workers
        api: _API.DEV,
        features: _FEATURES.DEV,
        logging: _LOGGING.DEV,
        stackdriver: _STACKDRIVER.DEV,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.HA },                                  // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        kafkajs: _KAFKAJS,
        gcp: _GCP.DEV,
        
        datawarehouse: _DATAWAREHOUSE
    },
    prodcloud: {                                                                // single node kafka, or Kafka Std - 1 master, N workers
        api: _API.PROD,
        features: _FEATURES.PROD,
        logging: _LOGGING.PROD,
        stackdriver: _STACKDRIVER.PROD,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.SINGLE },                              // array of kafka message brokers                       // kafka-1-vm  | 10.140.0.11   
        kafkajs: _KAFKAJS,
        gcp: _GCP.PROD,
        datawarehouse: _DATAWAREHOUSE
    },
    prodcloud_HA: {                                                             // Kafka HA - 3 masters, N workers
        api: _API.PROD,
        features: _FEATURES.PROD,
        logging: _LOGGING.PROD,
        stackdriver: _STACKDRIVER.PROD,
        messagebroker: _MESSAGEBROKER,
        pubsub: _PUBSUB,
        kafka: { brokers: _KAFKA.BROKERS.HA },                                  // array of kafka message brokers                       // [kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        kafkajs: _KAFKAJS,
        gcp: _GCP.PROD, 
        datawarehouse: _DATAWAREHOUSE
    }
}  

// env.active returns the active environment 
module.exports.active = this.CONFIGS.local;      // change enums.environments to 'local' to develop locally or to 'devcloud' to develop online                               
