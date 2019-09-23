//@ts-check
"use strict";
/**
 * ./consumers/BqPms.js
 *  
 */

const enums = require('../host/enums');

const Bq = require('./Bq');

const Producer = require('../producers');
const Consumer = require('../consumers');

// instance parameters
const KAFKA_READ_TOPIC = enums.messageBroker.topics.monitoring.mppt;
const KAFKA_CONSUMER_GROUPID = enums.messageBroker.consumers.groupId.mppt;
const BQ_DATASET = enums.dataWarehouse.datasets.monitoring;
const BQ_TABLE = enums.dataWarehouse.tables.mppt;

/**
 constructor arguments 
 */
class BqMppt extends Consumer {
    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        // start kafka consumer with a bq client
        super(
            KAFKA_CONSUMER_GROUPID,
            KAFKA_READ_TOPIC,
            new Bq(BQ_DATASET, BQ_TABLE)
        );

    }
}

module.exports = BqMppt;
