//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */
module.exports.KafkaProducer = require('./KafkaProducer');

module.exports.BqProducer = require('./BqProducer');
module.exports.DatasetPms = require('./DatasetPms');
module.exports.DatasetMppt = require('./DatasetMppt');
module.exports.DatasetInverter = require('./DatasetInverter');
