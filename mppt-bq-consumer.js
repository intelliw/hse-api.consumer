'use strict';
/**
 * a consumer to retrieve and write: pms monitoring data to bigquery  
 */

const enums = require('./src/host/enums');
const Consumer = require('./src/consumers'); 

const topicName = enums.messageBroker.topics.monitoring.mppt;
const groupId = enums.messageBroker.consumers.groupId.mppt;      // group name convention = <target system>.<target dataset>.<target table>
const clientId = `${groupId}.001`;      // 

// carry out write and read operations on the dataset table
let consumer = new Consumer(clientId, groupId, topicName); 
consumer.retrieveMessages();

