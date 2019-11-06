//@ts-check
'use strict';
/**
 * ./consumers/Feature.js
 *  topic consumer for feature toggles - to apply configuration changes from host to consumer through message broker 
 *  
 */

const enums = require('../environment/enums');

const env = require('../environment/env');
const utils = require('../environment/utils');

const log = require('../logger').log;

const Producer = require('../producers');
const KafkaConsumer = require('../consumers/KafkaConsumer');

// instance parameters
const KAFKA_READ_TOPIC = env.active.topics.system.feature;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumerGroups.system.feature;

/**
 * instance attributes
* producer                                                                          //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class Feature extends KafkaConsumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        // start kafka consumer with a bq client
        super(
            KAFKA_CONSUMER_GROUPID,
            KAFKA_READ_TOPIC
        );

    }


    // subtype implements specific transforms or calls super 
    transform(consumedMessage) {
        return consumedMessage;                                                     // no transforms required 
    }

    /* writes to bq and to the datasets kafka topic 
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
    */
    produce(consumedMessage) {


        let feature = consumedMessage.key.toString();
        let jsonValue = JSON.parse(consumedMessage.value);

        // logging feature
        if (feature == enums.features.operational.logging) {
            env.active.logging = jsonValue;
            log.initialise(); 
        }
        
        // log the feature configurations
        log.trace(`${feature}`, KAFKA_READ_TOPIC, jsonValue);
    }

}



module.exports = Feature;
