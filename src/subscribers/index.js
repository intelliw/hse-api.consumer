//@ts-check
'use strict';
/**
 * ./consumers/index.js
 * 
 * consumers 
 */

const env = require('../environment');
const enums = require('../environment/enums');

module.exports = require('./Subscriber');
module.exports.KafkaSubscriber = require('./KafkaSubscriber');
module.exports.PubSubSubscriber = require('./PubSubSubscriber');

// Active subscriber -  kafka or pubsub depending on active env configs 
module.exports.Active = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ?  
    './PubSubSubscriber' : './KafkaSubscriber' }`);
