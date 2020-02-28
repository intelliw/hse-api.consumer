//@ts-check
"use strict";
/**
 * ./producers/Dataset.js
 *  Kafka message producers for api devices.datasets.post 
 */
const env = require('../environment/env');
const log = require('../logger').log;

const Producer = require('./Producer');
const BqStorage = require('../storage/BqStorage');

const pub = require('../publishers').pub;

/**
 */
class MonitoringProducer extends Producer {
    /**
    instance attributes:  

     constructor arguments  
    * @param {*} writeTopic                                         //  kafka producer topic to write to
    * @param {*} dataset                                            //  bq dataset name
    * @param {*} table                                              //  bq dataset table name
    */
    constructor(writeTopic, dataset, table) {

        // create the storage object
        let storage = new BqStorage(dataset, table);                // $env:GOOGLE_APPLICATION_CREDENTIALS="C:\_frg\_proj\190905-hsy-api-consumer\credentials\sundaya-d75625d5dda7.json"      

        // construct super
        let sender = env.active.api.instanceId;
        super(writeTopic, sender, storage);

    }

    /* 
    */
    transform(retrievedMsgObj) {

        let msgKey, msgValue, transformedMsg;

        const ITEMS_PER_MESSAGE = 1;
        let transformedMsgObj = { itemCount: ITEMS_PER_MESSAGE, messages: [] }

        // transform msg if required 
        msgValue = JSON.parse(retrievedMsgObj.value);               //  ..no transform required
        msgKey = retrievedMsgObj.key.toString();

        // add message to transformed results
        transformedMsgObj.messages.push(
            super._createMessage(msgKey, msgValue));

        return transformedMsgObj;

    }

    /** sends messages to the broker  
     * !!! NOTE: this method assumes that the JSON dataitem *id* attribute (e.g. pms_id:) is prefixed with the table name (e.g. pms) 
     * if the dataitem id format is changed this fucntion must be modified 
    * @param {*} transformedMsgObj                                  // e.g. msgObj = { itemCount: 0, messages: [] };
    */
    async produce(transformedMsgObj) {

        let rowArray = [];
        let sharedId;

        try {
    
            // storage
            transformedMsgObj.messages.forEach(message => {
    
                // write to bq
                rowArray.push(JSON.parse(message.value));                               // rowArray = [{"pms_id":"PMS-01-002","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.039,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[{"volts":3.661,"dvcl":7,"open":false},{"volts":3.666,"dvcl":12,"open":false},{"volts":3.654,"dvcl":0,"open":false},{"volts":3.676,"dvcl":22,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.662,"dvcl":8,"open":false},{"volts":3.66,"dvcl":6,"open":false},{"volts":3.659,"dvcl":5,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.657,"dvcl":3,"open":false},{"volts":3.656,"dvcl":2,"open":false},{"volts":3.665,"dvcl":11,"open":true},{"volts":3.669,"dvcl":15,"open":false},{"volts":3.661,"dvcl":7,"open":false}],"fet_in":{"open":true,"temp":34.1},"fet_out":{"open":false,"temp":32.2},"status":{"bus_connect":true},"sys":{"source":"S000"},"time_event":"2019-02-09 08:00:17.0200","time_zone":"+07:00","time_processing":"2019-09-08 05:00:48.9830"}]

            });
            sharedId = rowArray[0][`${this.storage.table}_id`];                         // if is common to all rows and is used only for logging. e.g. rowArray.pms_id. If the JSON element name is not based on the table name this line must be modified
            this.storage.write(sharedId, rowArray);                                     // message.value: [{"pms_id":"TEST-01","pack_id":"0241","pack":{"volts":54.87,"amps"... 

    
            // publish 

            /*  publish the transformed messages, to the 'monitoring.<xxx>.dataset' topic 
             *  UNCOMMENT FOLLOWING LINE IF NEEDED **************************************************************************************
             *  currently there are no subscribers for the 'monitoring.<xxx>.dataset' write topic, content is unchanged from source 'monitoring.<xxxx>' topic
             */ 

            // pub.publish(transformedMsgObj, this.writeTopic, this.sender);           
            
    
        } catch (e) {
            log.error(`${log.enums.methods.mbProduce}`, e);
        }
    }

}



module.exports = MonitoringProducer;