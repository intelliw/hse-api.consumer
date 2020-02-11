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
module.exports.ActiveMsgSubscriber = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ?  './PubSubSubscriber' : './KafkaSubscriber' }`);

module.exports.Consumer = require('./Consumer');

module.exports.KafkaSubscriber = require('./KafkaSubscriber');
module.exports.PubSubSubscriber = require('./PubSubSubscriber');

module.exports.MonitoringPms = require('./MonitoringPms');
module.exports.MonitoringMppt = require('./MonitoringMppt');
module.exports.MonitoringInverter = require('./MonitoringInverter');

module.exports.Feature = require('./Feature');