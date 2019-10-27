//@ts-check
'use strict';
/**
 * ./logger/index.js
 */

module.exports = require('./Logger');
module.exports.Statement = require('./Statement');

// Statement subtypes - none of these are directly instanced outside of the logger module
// module.exports.MessagingStatement = require('./MessagingStatement');
// module.exports.DataStatement = require('./DataStatement');
// module.exports.ErrorStatement = require('./ErrorStatement');
// module.exports.ExceptionStatement = require('./ExceptionStatement');
// module.exports.TraceStatement = require('./TraceStatement');

