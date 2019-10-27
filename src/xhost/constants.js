//@ts-check
'use strict';
/**
 * ./svc/constant.js
 * global constants
 */
const path = require('path');                   // this is a node package not the '../paths' applicaiton module
const enums = require('../xenvironment/enums');

const utils = require('../xenvironment/utils');

const NONE = global.undefined;

// constants for dates and timestamps
module.exports.dateTime = {
    bigqueryUtcTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSSZ',                 // "2019-02-09T16:00:17.0200+08:00"
    bigqueryZonelessTimestampFormat: 'YYYY-MM-DD HH:mm:ss.SSSS',             // "2019-02-09T16:00:17.0200"          use this format to force bigquery to store local time without converting to utc          
}

// system configuration constants
module.exports.system = {
    INSTANCE_ID: 'api-consumer'                                              // or api-consumer for logging - resource: {  labels: { instance_id:    
}