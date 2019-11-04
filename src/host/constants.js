//@ts-check
'use strict';
/**
 * ./host/constants.js
 * global constants
 */

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                 // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',             // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4,                                                 // decimal places for float values in monitoring dataset
    INSTANCE_ID: 'api_consumer'                                              // or api_host for logging - resource: {  labels: { instance_id:    
}

// equipment status constants - for non-binary statuses based on a tuple of multiple bits e.g if the 2 'mppt.input' bits have a value tuple of '00' the statis is 'normal'
module.exports.equStatus = {
    BIT_LENGTH: 16,                                         // how many digits int he cell number e.g 02
    ENUM_PREFIX: 'tuple_',                                  // prefix used on consts.equStatus to support string lookup   
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

// system constants
module.exports.NONE = global.undefined;
