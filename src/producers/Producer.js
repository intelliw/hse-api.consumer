//@ts-check
"use strict";
/**
 * ./producers/Producer.js
 *  base type for all message producers 
 * this class deleagates to Kafka or PubSub depending on env.active.messagebroker
 */

const env = require('../environment');
const enums = require('../environment/enums');
const log = require('../logger').log;

class Producer {
    /**
     * superclass - 
     * clients must call sendToTopic() 
     * 
     * instance attributes:  
     * constructor arguments 
     * @param {*} writeTopic                                                 // enums.params.datasets              - e.g. pms       
     */
    constructor(writeTopic) {

        this.writeTopic = writeTopic;

    }

    /** implemented by subtype
    * @param {*} msgObj                                                             // e.g. msgObj = { itemCount: 0, messages: [] };
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async sendToTopic(msgObj) {
    }

    /** creates and returns a formatted message object 
    * this method is for subtypes to call while extracting data from a request body
    * the returned object contains stringified JSON and includes
    *   { key: '..', value: '..', headers: '..'} 
    * 
    * @param {*} key - is a string
    * @param {*} data - contains the message value 
    * @param {*} headers - a json object e.g. { 'corsrelation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    *        (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    */
    createMessage(key, data, headers) {

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };

        if (headers) {
            message.headers = JSON.stringify(headers);
        }

        return message;
    }


    _isKafka() { return env.active.messagebroker.provider == enums.messageBroker.providers.kafka; }
    _isPubSub() { return env.active.messagebroker.provider == enums.messageBroker.providers.pubSub; }


}

module.exports = Producer;
