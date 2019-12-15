//@ts-check
'use strict';
/**
 * ./producers/index.js
 * 
 * producers 
 */

const env = require('../environment');
const enums = require('../environment/enums');

// kafka or pubsub - depending on active configs
module.exports.ActiveMessageProducer = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.kafka ? './KafkaProducer' : './PubSubProducer'}`);

module.exports.MessageProducer = require('./MessageProducer');
module.exports.KafkaProducer = require('./KafkaProducer');

module.exports.BqProducer = require('./BqProducer');
module.exports.DatasetProducer = require('./DatasetProducer');
