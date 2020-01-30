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
const ActiveMsgConsumer = require('../consumers').ActiveMsgConsumer;

// instance parameters
const MESSAGEBROKER_READ_TOPIC = env.active.messagebroker.topics.monitoring.mppt;
const SUBSCRIPTION_OR_GROUPID = env.active.messagebroker.subscriptions.monitoring.mppt;


/**
 * instance attributes
 * producer                                                             //  e.g. Dataset - producer object responsible for transforming a consumed message and if requested, sending it to a new topic  
 constructor arguments 
 */
class MonitoringMppt extends ActiveMsgConsumer {
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
    produce(transformResults) {
        let rowArray;
        let sharedId;

        // produce 
        transformResults.messages.forEach(message => {

            // parse message
            rowArray = JSON.parse(message.value);                       // rowArray = [{"pms_id":"PMS-01-002","pack_id":"0248","pack":{"volts":51.262,"amps":-0.625,"watts":-32.039,"vcl":3.654,"vch":3.676,"dock":4,"temp_top":35,"temp_mid":33,"temp_bottom":34},"cell":[{"volts":3.661,"dvcl":7,"open":false},{"volts":3.666,"dvcl":12,"open":false},{"volts":3.654,"dvcl":0,"open":false},{"volts":3.676,"dvcl":22,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.662,"dvcl":8,"open":false},{"volts":3.66,"dvcl":6,"open":false},{"volts":3.659,"dvcl":5,"open":false},{"volts":3.658,"dvcl":4,"open":false},{"volts":3.657,"dvcl":3,"open":false},{"volts":3.656,"dvcl":2,"open":false},{"volts":3.665,"dvcl":11,"open":true},{"volts":3.669,"dvcl":15,"open":false},{"volts":3.661,"dvcl":7,"open":false}],"fet_in":{"open":true,"temp":34.1},"fet_out":{"open":false,"temp":32.2},"status":{"bus_connect":true},"sys":{"source":"S000"},"time_event":"2019-02-09 08:00:17.0200","time_zone":"+07:00","time_processing":"2019-09-08 05:00:48.9830"}]
            sharedId = rowArray[0].mppt_id;                             // each element in the message value array will have the same id

            // bq
            this.producer.bqClient.insertRows(sharedId, rowArray);      // message.value: [{"pms_id":"TEST-01","pack_id":"0241","pms":{"temp":48.1},"pack":{"volts":54.87,"amps":     

        });

        // write to secondary messagebroker topic                       // remove comment if this is needed
        this.producer.sendToTopic(transformResults);


    }


    /* 
    e.g. ----monitoring.mppt message broker------------------------------------------------------------------
    {
        "mppt": { "id": "IT6415AD-01-002"  },
        "data": [
            { "pv": { "volts": [48, 48 ], "amps": [6, 6 ] },
            "battery": { "volts": 55.1, "amps": 0 },
            "load": { "volts": [ 48, 48 ], "amps": [ 1.2, 1.2 ] },
            "status": "0801",
            "sys": { "source": "S000" },
            "time_event": "2019-10-22 07:00:07.0320",
            "time_zone": "+07:00",
            "time_processing": "2019-11-12 08:01:54.3020"
            },
            { "pv": { "volts": [48, 48 ], "amps": [ 6, 6 ] },
            "battery": { "volts": 55.1, "amps": 0 },
            "load": { "volts": [ 48, 48 ], "amps": [ 1.2, 1.2 ] },
            "status": "0801",
            "sys": { "source": "S000" },
            "time_event": "2019-10-22 07:00:17.0220",
            "time_zone": "+07:00",
            "time_processing": "2019-11-12 08:01:54.3030"
            }
        ]
    }

    is transformed into ----monitoring.mppt.dataset message broker topic--------------------------------------

    {
        "mppt_id": "IT6415AD-01-002",
        "pv": [
            {"volts": 48, "amps": 6, "watts": 288 },
            {"volts": 48, "amps": 6, "watts": 288 } ],
        "battery": {"volts": 55.1, "amps": 0.0, "watts": 0 },
        "load": [ 
            { "volts": 48, "amps": 1.2, "watts": 57.6 },
            { "volts": 48, "amps": 1.2, "watts": 57.6 } ],
        "status": { "bus_connect": true, "input": "normal", 
        "chgfet": "ok", "chgfet_antirev": "ok", "fet_antirev": "ok", 
        "input_current": "ok", "load": "ok", "pv_input": "ok", "charging": "float", 
        "system": "ok", "standby": "standby" },
        "sys": {"source": "S000" },
        "time_event": "2019-02-09 08:00:07.0320",
        "time_zone": "+07:00",
        "time_processing": "2019-09-10 04:13:08.8780"
    },
        
    transforms and returns a data item specific to this dataset
    see example above:
    */
    transformDataItem(key, dataSet, dataItem) {

        let volts, amps, watts;
        let attrArray;

        const PRECISION = consts.system.MONITORING_PRECISION;

        //  reconstruct dataitem - add new attributes and flatten arrays 
        let dataObj = {
            mppt_id: key,
            time_local: dataItem.time_local                                                         // this gets replaced and deleted in addGenericAttributes()
        }

        // pv
        attrArray = [];
        for (let i = 1; i <= dataItem.pv.volts.length; i++) {
            volts = dataItem.pv.volts[i - 1];
            amps = dataItem.pv.amps[i - 1];
            watts = (volts * amps).toFixed(PRECISION);

            attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
        };
        dataObj.pv = attrArray;                                                                     // "pv": [ {"volts": 48, "amps": 6, "watts": 288 },

        // battery
        volts = dataItem.battery.volts;
        amps = dataItem.battery.amps;
        watts = (volts * amps).toFixed(PRECISION);

        dataObj.battery = {                                                                         //   "battery": {
            volts: volts, amps: amps, watts: parseFloat(watts)                                      //      "volts": 55.1, "amps": 0.0, "watts": 0 },
        }

        // load
        attrArray = [];
        for (let i = 1; i <= dataItem.load.volts.length; i++) {
            volts = dataItem.load.volts[i - 1];
            amps = dataItem.load.amps[i - 1];
            watts = (volts * amps).toFixed(PRECISION);

            attrArray.push({ volts: volts, amps: amps, watts: parseFloat(watts) });
        };
        dataObj.load = attrArray;                                                                   // "load": [ {"volts": 48, "amps": 6, "watts": 288 },

        // status
        let statusBits = utils.hex2bitArray(dataItem.status, consts.equStatus.BIT_LENGTH);                              // get a reversed array of bits (bit 0 is least significant bit)

        dataObj.status = {
            bus_connect: utils.tristateBoolean(statusBits[0], false, true),                                             // bit 0    "status": { "bus_connect": true }, 
            input: consts.equStatus.mppt.input[consts.equStatus.ENUM_PREFIX + statusBits[1] + statusBits[2]],           // bit 1,2              "input": "normal"
            chgfet: utils.tristateBoolean(statusBits[3], "ok", "short"),                                                              // bit 3                "chgfet": true, 
            chgfet_antirev: utils.tristateBoolean(statusBits[4], "ok", "short"),                                                      // bit 4                "chgfet_antirev": true, 
            fet_antirev: utils.tristateBoolean(statusBits[5], "ok", "short"),                                                         // bit 5                "fet_antirev": true,   
            input_current: utils.tristateBoolean(statusBits[6], "ok", "overcurrent"),                                                       // bit 6                "input_current": true, 
            load: consts.equStatus.mppt.load[consts.equStatus.ENUM_PREFIX + statusBits[7] + statusBits[8]],             // bit 7,8              "load": "ok", 
            pv_input: utils.tristateBoolean(statusBits[9], "ok", "short"),                                                            // bit 9                "pv_input": true, 
            charging: consts.equStatus.mppt.charging[consts.equStatus.ENUM_PREFIX + statusBits[10] + statusBits[11]],   // bit 10,11            "charging": "not-charging", 
            system: utils.tristateBoolean(statusBits[12], "ok", "fault"),                                                             // bit 12               "system": true,  
            standby: utils.tristateBoolean(statusBits[13], "standby", "running")                                                             // bit 13               "standby": true } 
        }

        // add generic attributes
        dataObj.sys = { source: dataItem.sys.source }
        dataObj.time_event = dataItem.time_event
        dataObj.time_zone = dataItem.time_zone
        dataObj.time_processing = dataItem.time_processing

        // @DEBUG   console.log(`equ status: ${Array.from(statusBits).reverse().join('')}`);         // put bits back in order to debug and compare with documentation in the portal 
        // @DEBUG   console.log(`dataObj: ${JSON.stringify(dataObj)}`)       // @@@@@@

        return dataObj;
    }
}


module.exports = MonitoringMppt;
