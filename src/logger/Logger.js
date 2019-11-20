//@ts-check
"use strict";
/**
 * ./logger/Logger.js
 *  Stackdriver logging and error reporting appender  
 */
const env = require('../environment');
const consts = require('../host/constants');

const { ErrorReporting } = require('@google-cloud/error-reporting');
const { Logging } = require('@google-cloud/logging');               // google cloud logging client library
const traceAgent = require('@google-cloud/trace-agent');

const MessagingStatement = require('./MessagingStatement');
const DataStatement = require('./DataStatement');
const ExceptionStatement = require('./ExceptionStatement');
const ErrorStatement = require('./ErrorStatement');
const TraceStatement = require('./TraceStatement');

let LOG_WRITER;
let STMT_MESSAGING, STMT_DATA, STMT_EXCEPTION, STMT_ERROR, STMT_TRACE;

class Logger {
    /**
     * instance variables
     * this.messaging, this.data, this.error, this.exception, this.trace
     * this.ERR
     */
    constructor() {

        const project = env.active.gcp.project;
        const logname = env.active.stackdriver.logging.logName;
        const serviceId = consts.system.SERVICE_ID

        // create a Stackdriver log writer 
        LOG_WRITER = new Logging({                                     
            projectId: project,
        }).log(logname);                                                        // select the log to write to        

        // create a Stackdriver error reporter        
        this.ERR = new ErrorReporting({                                         // all configuration options are optional.
            projectId: project,
            reportMode: env.active.stackdriver.errors.reportMode,               // 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. 
            logLevel: env.active.stackdriver.errors.logLevel,                   // 2 (warnings). 0 (no logs) 5 (all logs) 
            serviceContext: {
                service: serviceId,
                version: env.active.api.versions.current
            }            
        });

        // start the Stackdriver tracing agent 
        this.TRACE = traceAgent.start({                                         // use log.TRACE for creating custom spans
            projectId: env.active.gcp.project,
            samplingRate: env.active.stackdriver.trace.samplingRate,            // 5 means sample 5 traces per second or at most 1 every 200 ms. if 500, Sample one trace every half-second.
            enabled: env.active.stackdriver.trace.enabled,                                                      // tracing is disabled if the trace statments are off     
            ignoreUrls: env.active.stackdriver.trace.ignoreUrls,                // ignore /static path
            ignoreMethods: env.active.stackdriver.trace.ignoreMethods,          // ignore requests with OPTIONS & PUT methods (case-insensitive)
            serviceContext: {
                service: env.active.api.host,
                version: env.active.api.versions.current,
                resourceType: env.active.stackdriver.logging.resource                      // e.g. gce_instance
            }            
        });
        
        // initialise configurations                                            // this gets called by api/logger as well
        this.initialise();

    }

    // toggle logging based on current configs
    initialise() {                                                              // called by constructor and by api/logging at runtim  
        
        const serviceId = consts.system.SERVICE_ID

        // (re)create an instance of each statement     
        STMT_MESSAGING = new MessagingStatement(LOG_WRITER, serviceId);
        STMT_DATA = new DataStatement(LOG_WRITER, serviceId);
        STMT_EXCEPTION = new ExceptionStatement(LOG_WRITER, serviceId, this.ERR);
        STMT_ERROR = new ErrorStatement(LOG_WRITER, serviceId, this.ERR);
        STMT_TRACE = new TraceStatement(LOG_WRITER, serviceId);


        // create the public interface for this Logger, for clients to use 
        this.messaging = function (topic, offset, msgsArray, itemQty, sender) { 
            STMT_MESSAGING.write(topic, offset, msgsArray, itemQty, sender);
        }
        this.data = function (dataset, table, id, rowArray) {
            STMT_DATA.write(dataset, table, id, rowArray);
        }
        this.exception = function(label, errMessage, errEvent) {                    // errEvent is a ErrorEvent object created with log.ERR.event()
            STMT_EXCEPTION.write(label, errMessage, errEvent);
        }
        this.error = function(label, errObject) {                                   // errObject is a Error object created with 'new Error(message)'
            STMT_ERROR.write(label, errObject);
        }
        this.trace = function(label, value, payload) {
            STMT_TRACE.write(label, value, payload);
        }

        
        // runtime enums for log statements
        this.enums = {
            labels: {                                                               // lables used in error and trace statements
                requestStatus: 'Request',
                responseStatus: 'Response',
                configChange: 'Configs',
                watchVar: 'Variable',                                                // use for watch variables - this can be combined with an release or experiment feature, to watch a variable in a new feature
                unexpected: 'Unexpected'
            }, 
            methods: {                                                               // methods used in trace agent child spans, and trace statements
                kafkaSendToTopic: 'kafka: sendToTopic',
                bqInsertRows: 'bq: insertRows',
                energyExecuteGet: 'energy: executeGet',
            }
        }

    }

}

module.exports = Logger;
