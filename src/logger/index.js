//@ts-check
'use strict';
/**
 * ./logger/index.js
 * *shared* logger.. 
 *      this module is mastered in hsy-host
 *      it is part of the shared environment comprising:
 *          ./environment/index.js
 *          ./logger/index.js
 */

module.exports = require('./Logger');
module.exports.Statement = require('./Statement');
// Statement subtypes - none of these are directly instanced outside of the logger module
// module.exports.MessagingStatement = require('./MessagingStatement');
// module.exports.DataStatement = require('./DataStatement');
// module.exports.ErrorStatement = require('./ErrorStatement');
// module.exports.ExceptionStatement = require('./ExceptionStatement');
// module.exports.TraceStatement = require('./TraceStatement');


// Logger instance 
const log = new (require('../logger/Logger'));
module.exports.log = log;                       

