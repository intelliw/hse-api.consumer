//@ts-check
"use strict";
/**
 * ./consumers/PmsBq.js
 *  
 */

const enums = require('../host/enums');

const Consumer = require('./Consumer');

// instance parameters
const KAFKA_TOPIC = enums.messageBroker.topics.monitoring.mppt;
const KAFKA_GROUPID = enums.messageBroker.consumers.groupId.mppt;
const BQ_DATASET = enums.dataWarehouse.datasets.monitoring;
const BQ_TABLE = enums.dataWarehouse.tables.mppt;

/**
 */
class MpptBq extends Consumer {
    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        // start kafka consumer with a bq client
        super(
            KAFKA_GROUPID,
            KAFKA_TOPIC,
            new Consumer.Bq(BQ_DATASET, BQ_TABLE)
        );

    }
}

module.exports = MpptBq;
