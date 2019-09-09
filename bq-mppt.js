'use strict';
/**
 * a consumer to retrieve and write: pms monitoring data to bigquery  
 */

const enums = require('./src/host/enums');
const Consumer = require('./src/consumers'); 

// kafka
const topicName = enums.messageBroker.topics.monitoring.mppt;
const groupId = enums.messageBroker.consumers.groupId.mppt;      // group name convention = <target system>.<target dataset>.<target table>
const clientId = `${groupId}.001`;      // 

// bigquery
const dataset = enums.dataWarehouse.datasets.monitoring;
const table = enums.dataWarehouse.tables.mppt;


// carry out write and read operations on the dataset table
let consumer = new Consumer(clientId, groupId, topicName, dataset, table); 
consumer.processMessages();

