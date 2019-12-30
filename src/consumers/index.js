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
module.exports.ActiveMsgConsumer = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ?  './PubSubConsumer' : './KafkaConsumer' }`);

module.exports.Consumer = require('./Consumer');

module.exports.KafkaConsumer = require('./KafkaConsumer');
module.exports.PubSubConsumer = require('./PubSubConsumer');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');

module.exports.Feature = require('./Feature');