'use strict';
/**
 * consumers and bq clients to retrieve and write: monitoring data into bigquery  
 */

const Consumer = require('./src/consumers'); 

// enums
const enums = require('./src/host/enums');
const topics = enums.messageBroker.topics.monitoring;
const groupIds = enums.messageBroker.consumers.groupId;
const datasets = enums.dataWarehouse.datasets;
const tables = enums.dataWarehouse.tables;

// pms
const pmsBq = new Consumer.Bq(datasets.monitoring, tables.pms);         // bigquery client
const pmsMonitor = new Consumer(groupIds.pms, topics.pms, pmsBq);       // kafka - start consumer

