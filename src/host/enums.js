//@ts-check
/**
 * ./host/enum.js
 * global enumerations
 */

module.exports.messageBroker = {                    // kafka message broker. topics are based on enums.datasets. 
    consumers: {                                    // consumer group ids
        groupId: {
            pms: 'bq.monitoring.pms'                // group id convention = <target system>.<target dataset>.<target table>
        }
    },
    topics: {                                       //  topic names 
        monitoring: {                               //  topics for monitoring datasets
            pms: 'monitoring.pms',     
            mppt: 'monitoring.mppt',        
            inverter: 'monitoring.inverter'
        }
    }
}

