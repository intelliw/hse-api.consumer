//@ts-check
'use strict';
/**
 * ./host/enum.js
 * global enumerations
 */


module.exports.api = {                                      // api enums
    datasets: {                                             // kafka topics are based on enums.datasets. preferred convention is <message type>_<api base/db name>_<dataset /table name> 
        pms: 'pms',                                         // corresponds to messageBroker.consumers.pms
        mppt: 'mppt',                                       // corresponds to messageBroker.consumers.mppt
        inverter: 'inverter'                                // corresponds to messageBroker.consumers.inverter
    }
}


module.exports.messageBroker = {                            // kafka message broker. topics are based on enums.datasets. 
    consumers: {                                            // consumer group ids
        groupId: {
            pms: 'group.monitoring.pms',                    // group id convention = <target system>.<target dataset>.<target table>
            mppt: 'group.monitoring.mppt',
            inverter: 'group.monitoring.inverter'
        }
    },
    ack: {
        all: -1,                                    // -1 = all replicas must acknowledge (default) 
        none: 0,                                    //  0 = no acknowledgments 
        leader: 1                                   //  1 = only waits for the leader to acknowledge 
    },
    topics: {                                               //  topic names 
        monitoring: {                                       //  topics for monitoring data received from api host
            pms: 'monitoring.pms',
            mppt: 'monitoring.mppt',
            inverter: 'monitoring.inverter'
        },
        dataset: {                                          //  topics for monitoring datasets for bq update, created by consumer at 1st stage of monitoring
            pms: 'monitoring.pms.dataset',
            mppt: 'monitoring.mppt.dataset',
            inverter: 'monitoring.inverter.dataset'
        }
    }
}

module.exports.dataWarehouse = {                            // bigquery
    datasets: {
        monitoring: 'monitoring'
    },
    tables: {
        pms: 'pms',
        mppt: 'mppt',
        inverter: 'inverter',
        TEST: 'TEST'
    }
}