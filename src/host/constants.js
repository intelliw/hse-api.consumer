//@ts-check
/**
 * ./svc/constant.js
 * global constants
 */
const enums = require('./enums');


// kafkajs client configuration options
module.exports.kafkajs = {
    consumeFromBeginning: true                                            //    
}

// system constants for the environment
module.exports.environments = {
    local: {
        kafka: {
            brokers: ['192.168.1.106:9092']                                     // localhost   | 192.168.1.106        
        }
    },
    devcloudtest: {                                                             // single node kafka, or Kafka Std - 1 master, N workers
        kafka: {
            brokers: ['kafka-1-vm:9092']                                   // array of kafka message brokers         // kafka-1-vm  | 10.140.0.11
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
module.exports.env = 'local';                                               // local or devcloud or prodcloud
// module.exports.env = 'devcloudtest';                                  
// module.exports.env = 'devcloud';                                      
// module.exports.env = 'prodcloud';                                     

// system constants
module.exports.NONE = global.undefined;
