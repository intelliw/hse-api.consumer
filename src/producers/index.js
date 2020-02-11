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
module.exports.ActiveMsgPublisher = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.kafka ? './KafkaPublisher' : './PubSubPublisher'}`);

module.exports.Producer = require('./Producer');
module.exports.KafkaPublisher = require('./KafkaPublisher');

module.exports.BqProducer = require('./BqProducer');
module.exports.DatasetProducer = require('./DatasetProducer');
