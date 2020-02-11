//@ts-check
"use strict";
/**
 * ./consumers/MonitoringMppt.js
 *  
 */

const enums = require('../environment/enums');
const consts = require('../host/constants');
const utils = require('../environment/utils');
const env = require('../environment/env');

const DatasetProducer = require('../producers/DatasetProducer');
const ActiveMsgSubscriber = require('../consumers').ActiveMsgSubscriber;

// instance parameters
const MESSAGEBROKER_READ_TOPIC = env.active.messagebroker.topics.monitoring.mppt;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.monitoring.mppt;


/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringMppt extends ActiveMsgSubscriber {
    /**
    instance attributes, constructor arguments  - see super
    */
    constructor() {

        const writeTopic = env.active.messagebroker.topics.dataset.mppt;
        const bqDataset = env.active.datawarehouse.datasets.monitoring;
        const bqTable = env.active.datawarehouse.tables.mppt;

        // start kafka consumer with a bq client
        super(
            SUBSCRIPTION_OR_GROUPID,
            MESSAGEBROKER_READ_TOPIC
        );

        // instance attributes
        this.producer = new DatasetProducer(writeTopic, bqDataset, bqTable)

    }


    /* writes to bq and to the datasets kafka topic 
     * the transformResults object contains an array of kafka messages with modified data items
     *      e.g. transformResults: { itemCount: 9, messages: [. . .] }
    */
    produce(transformedMsgObj) {
        let rowArray;
        let id;

        // produce 
        transformedMsgObj.messages.forEach(message => {

            // parse message
            rowArray = JSON.parse(message.value);                       // rowArray = [{"pms_id":"PMS-01-002","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.039,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[{"volts":3.661,"dvcl":7,"open":false},{"volts":3.666,"dvcl":12,"open":false},{"volts":3.654,"dvcl":0,"open":false},{"volts":3.676,"dvcl":22,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.662,"dvcl":8,"open":false},{"volts":3.66,"dvcl":6,"open":false},{"volts":3.659,"dvcl":5,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.657,"dvcl":3,"open":false},{"volts":3.656,"dvcl":2,"open":false},{"volts":3.665,"dvcl":11,"open":true},{"volts":3.669,"dvcl":15,"open":false},{"volts":3.661,"dvcl":7,"open":false}],"fet_in":{"open":true,"temp":34.1},"fet_out":{"open":false,"temp":32.2},"status":{"bus_connect":true},"sys":{"source":"S000"},"time_event":"2019-02-09 08:00:17.0200","time_zone":"+07:00","time_processing":"2019-09-08 05:00:48.9830"}]
            id = rowArray.mppt_id;                             // each element in the message value array will have the same id

            // bq
            this.producer.bqClient.insertRows(id, rowArray);      // message.value: [{"pms_id":"TEST-01","pack_id":"0241","pms":{"temp":48.1},"pack":{"volts":54.87,"amps":     

        });

        // write to secondary messagebroker topic                       // remove comment if this is needed
        this.producer.sendToTopic(transformedMsgObj);


    }



    /**
    */
    transform(consumedMsgObj) {

        let msgKey, msgValue, transformedMsg;

        const ITEMS_PER_MESSAGE = 1;
        let transformedMsgObj = { itemCount: ITEMS_PER_MESSAGE, messages: [] }

        // transform msg if required 
        msgValue = JSON.parse(consumedMsgObj.value);                //  ..no transform required
        msgKey = consumedMsgObj.key.toString();

        // add message to transformed results
        transformedMsgObj.messages.push(
            this.producer.createMessage(msgKey, msgValue));

        return transformedMsgObj;

    }

}


module.exports = MonitoringMppt;
