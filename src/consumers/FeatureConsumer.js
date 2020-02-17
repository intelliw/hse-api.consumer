//@ts-check
'use strict';
/**
 * ./consumers/Feature.js
 *  topic consumer for feature toggles - to apply configuration changes from host to consumer through message broker 
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const env = require('../environment/env');
const utils = require('../environment/utils');

const log = require('../logger').log;

const Consumer = require('./Consumer');

// instance parameters
const READ_TOPIC = env.active.messagebroker.topics.system.feature;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.system.feature;

/**
 * instance attributes
* producer                                                                          //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class FeatureConsumer extends Consumer {

    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        // start consumer
        super(
            SUBSCRIPTION_OR_GROUPID,
            READ_TOPIC, 
            consts.NONE
        );

    }

    /* this method receives a callback from the subscriber listener 
    */
    consume(retrievedMsgObj) {


        let feature = retrievedMsgObj.key.toString();
        let jsonValue = JSON.parse(retrievedMsgObj.value);

        // logging feature
        if (feature == enums.features.operational.logging) {
            env.active.logging = jsonValue;
            log.initialise(); 
        }
        
        // log the feature configurations
        log.trace(`${feature}`, READ_TOPIC, jsonValue);
    }

}



module.exports = FeatureConsumer;
