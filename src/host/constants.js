//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const enums = require('./enums');
const utilsc = require('./utilsCommon');

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',            // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// equipment status constants
module.exports.equStatus = {
    BIT_LENGTH: 16,                                                  // how many digits int he cell number e.g 02
    ENUM_PREFIX: 'tuple_'                                            // prefix used on enums.equStatus to support string lookup   
}

// system configuration constants
module.exports.system = {
    MONITORING_PRECISION: 4                                                 // decimal places for float values in monitoring dataset
}

// system constants
module.exports.NONE = global.undefined;
