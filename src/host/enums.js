//@ts-check
'use strict';
/**
 * ./host/enum.js
 * global enumerations
 */

module.exports.messageBroker = {                            // kafka message broker. topics are based on enums.datasets. 
    consumers: {                                            // consumer group ids
        groupId: {
            pms: 'group.monitoring.pms',                    // group id convention = <target system>.<target dataset>.<target table>
            mppt: 'group.monitoring.mppt',
            inverter: 'group.monitoring.inverter'
        }
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