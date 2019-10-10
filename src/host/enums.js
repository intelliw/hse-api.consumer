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

// equipment status - for non-binary statuses based on a tuple of multiple bits e.g if the 2 'mppt.input' bits have a value tuple of '00' the statis is 'normal'
module.exports.equStatus = {
    mppt: {
        input: {                                            // bit 1,2              "input": "normal"
            tuple_00: 'normal',
            tuple_01: 'no-power',
            tuple_10: 'high-volt-input',
            tuple_11: 'input-volt-error'
        },
        load: {                                             // bit 7,8              "load": "ok",     
            tuple_00: 'ok',
            tuple_01: 'overcurrent',
            tuple_10: 'short',
            tuple_11: 'not-applicable'
        },
        charging: {                                         // bit 10,11            "charging": "not-charging",         
            tuple_00: 'not-charging',
            tuple_01: 'float',
            tuple_10: 'boost',
            tuple_11: 'equalisation'
        }
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
    }
}
