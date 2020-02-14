//@ts-check
'use strict';
/**
 * ./publishers/index.js
 * 
 */
const env = require('../environment');
const enums = require('../environment/enums');

 // kafka or pubsub - depending on active configs

module.exports.Publisher = require('./Publisher');
module.exports.KafkaPublisher = require('./KafkaPublisher');
module.exports.PubSubPublisher = require('./PubSubPublisher');

// Active publisher -  kafka or pubsub depending on active env configs 
module.exports.Active = require(`${env.active.messagebroker.provider == enums.messageBroker.providers.pubsub ? 
                        './PubSubPublisher' : './KafkaPublisher'}`);

// create a singleton instance of the active publisher, for all publishers to share
module.exports.pub = new (this.Active);
