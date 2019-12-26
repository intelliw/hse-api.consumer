//@ts-check
'use strict';
/**
 * PACKAGE: ./environment/index.js
 * *shared* services, tools, constants.. for the shared environment
 *      this module is mastered in hsy-host
 *      it is part of the shared environment comprising:
 *          ./environment/index.js
 *          ./logger/index.js
 */

module.exports = require('./env');
module.exports.utils = require('./utils');
module.exports.enums = require('./enums');


