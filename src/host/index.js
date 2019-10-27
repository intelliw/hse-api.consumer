//@ts-check
'use strict';
/**
 * PACKAGE: ./host/index.js
 * *per project* configurations, constants, enums, and utiltiies
 */

module.exports.configs = require('./configs');
module.exports.consts = require('./constants');

// Logger instance - construct with this host's id 
module.exports.log = new (require('../logger/Logger'));

