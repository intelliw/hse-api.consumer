//@ts-check
"use strict";
/**
 * ./consumers/Consumer.js
 *  base type for Kafka message consumers  
 */
const { Kafka } = require('kafkajs');

const consts = require('../host/constants');
const enums = require('../host/enums');

const moment = require('moment');

const KAFKA_DEFAULT_ACK = enums.messageBroker.ack.leader;

class Consumer {
    /**
     * superclass - 
     * clients of subtypes must call retrieve()
     * subtypes implement extactData by calling this superclass's addMessage() for each dataitem 
     * 
    instance attributes:  
     "producerObj": kafka.producer()
     "_messages": []
     "clientId":  'devices.datasets'
     "ack":        enums.messageBroker.ack.. 

     constructor arguments 
    * @param {*} clientId           //  consts.messaging.clientid   - e.g. devices.datasets
    * @param {*} ack                //  enums.messageBroker.ack        
    */
    constructor(clientId, ack) {
        
        // create the producer
        const kafka = new Kafka({
            brokers: consts.environments[consts.env].kafka.brokers,              //  e.g. [`${this.KAFKA_HOST}:9092`, `${this.KAFKA_HOST}:9094`]
            clientId: clientId,
            retry: consts.kafkajs.retry,                                         // retry options  https://kafka.js.org/docs/configuration   
            connectionTimeout: consts.kafkajs.connectionTimeout,                 // milliseconds to wait for a successful connection   
            requestTimeout: consts.kafkajs.requestTimeout                        // milliseconds to wait for a successful request.     
        })
        this.producerObj = kafka.producer();

        // setup instance variables
        this.messages = [];                            // start with an empty array and later call addMessage() 
        this.clientId = clientId;
        this.ack = ack ? ack : KAFKA_DEFAULT_ACK;
    }

    // implemented by subtype: extracts data and calls super's (this) addMessage with the key, dataItem and optional header
    extractData(datasetName, datasets) {
    }

    /* adds a message to the message array
    * key - is a string
    * dataItem - contains the message value 
    * headers - a json object (note: kafkajs produces a byte array for headers unlike messages which are a string buffer
    *   e.g. { 'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67', system-id': 'my-system' }  
    * this function prepends the id, processing time, utc time, local time - to the data object
    */
    addMessage(key, data, eventTime, headers) {
        
        /*
         prepare time values - note that we use a timeformat without trailing offset hours (bigqueryZonelessTimestampFormat)
            to force bigquery to store local time without converting to utc
         */
        let processingTime = moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat);
        let eventTimeUtc = utils.datetimeToUTC(eventTime, consts.dateTime.bigqueryZonelessTimestampFormat);
        let eventTimeLocal = utils.datetimeToLocal(eventTime, consts.dateTime.bigqueryZonelessTimestampFormat);
        
        // console.log(`${eventTime} | UTC:${eventTimeUtc} | Local:${eventTimeLocal}`);

        // prepend processing time, event utc time, event local time, and id to the dataitem to the data item
        data = { 
                id: key,
                time_utc: eventTimeUtc,
                time_local: eventTimeLocal,
                time_processing: processingTime,                      
               ...data };                                                       // append the data last
        
        // console.log(JSON.stringify(data)); 

        // create the message
        let message = {
            key: key,
            value: JSON.stringify(data)
        };
        
        if (headers) {
            message.headers = JSON.stringify(headers);
        }
        this.messages.push(message);                                           // add to the message array
    }

    /* sends the message to the broker
        "topic":      enums.messageBroker.topics..
    */
    async sendToTopic(topic) {

        await this.producerObj.connect();

        let result = await this.producerObj.send({
            topic: topic,
            messages: this.messages,
            acks: this.ack,
        })
            .catch(e => console.error(`[${this.clientId}] ${e.message}`, e));

        console.log(`${this.messages.length} messages [${topic}, offset: ${result[0].baseOffset}-${Number(result[0].baseOffset) + (this.messages.length - 1)}]`)

        await this.producerObj.disconnect();

    }


}

module.exports = Consumer;