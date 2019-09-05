//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
const enums = require('./enums');


// kafkajs client configuration options
module.exports.kafkajs = {
    retry: {                                                             // retry options  https://kafka.js.org/docs/configuration
        maxRetryTime: 10000,                                             // max milliseconds wait for a retry (30000)
        initialRetryTime: 100,                                           // initial value in milliseconds, randomized after first time (300)
        factor: 0.2,                                                     // Randomization factor	   
        multiplier: 2,                                                   // Exponential factor
        retries: 8,                                                      // max number of retries per call (5)
        maxInFlightRequests: 200                                         // max num requestsin progress at any time. If falsey then no limit (null)
    },
    connectionTimeout: 3000,                                             // milliseconds to wait for a successful connection   
    requestTimeout: 25000                                                // milliseconds to wait for a successful request.    
}

// system constants for the environment
module.exports.environments = {
    local: {
        api: { host: 'localhost:8080' },
        kafka: {
            brokers: ['localhost:9092']                                     // localhost   | 192.168.1.106        
        }
    },
    devcloudtest: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog' },
        kafka: {
            brokers: ['kafka-1-vm:9092']                                   // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
        }
    },
    devcloud: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        }
    },
    prodcloud: {                                                            // Kafka HA - 3 masters, N workers
        api: { host: 'api.endpoints.sundaya.cloud.goog' },
        kafka: {
            brokers: ['kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']           // array of kafka message brokers         '[kafka-c-1-w-0:9092', 'kafka-c-1-w-1:9092']
        }
    }
}

// env sets the active environment - change this to one of the environments in consts.environments -0 eg. change to 'devcloud' before release
module.exports.env = 'local';                                               // local or devcloud or prodcloud
// module.exports.env = 'devcloudtest';                                  
// module.exports.env = 'devcloud';                                      
// module.exports.env = 'prodcloud';                                     

// system constants
module.exports.NONE = global.undefined;
