//@ts-check
'use strict';
/**
 * ./consumers/index.js
 * 
 * consumers 
 */

const env = require('../environment');
const enums = require('../environment/enums');

 // kafka or pubsub - depending on active configs
module.exports.ActiveMessageConsumer = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ?  './PubSubConsumer' : './KafkaConsumer' }`);

module.exports.MessageConsumer = require('./MessageConsumer');
module.exports.KafkaConsumer = require('./KafkaConsumer');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');

module.exports.Feature = require('./Feature');