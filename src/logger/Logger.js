//@ts-check
"use strict";
/**
 * ./logger/Logger.js
 *  Stackdriver logging and error reporting appender  
 */
const { ErrorReporting } = require('@google-cloud/error-reporting');
const { Logging } = require('@google-cloud/logging');               // google cloud logging client library

const env = require('../environment');
const consts = require('../host/constants');

const MessagingStatement = require('./MessagingStatement');
const DataStatement = require('./DataStatement');
const ExceptionStatement = require('./ExceptionStatement');
const ErrorStatement = require('./ErrorStatement');
const TraceStatement = require('./TraceStatement');

let logWriter, errorReporter;
let messagingStatement, dataStatement, exceptionStatement, errorStatement, traceStatement;

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
        logWriter = new Logging({                                     
            projectId: project,
        }).log(logname);                                                        // select the log to write to        

        // create a Stackdriver error reporter        
        errorReporter = new ErrorReporting({                                    // all configuration options are optional.
            projectId: project,
            reportMode: env.active.stackdriver.errors.reportMode,               // 'production' (default), 'always', 'never' - production will not log unless NODE-ENV=production. Specifies when errors are reported to the Error Reporting Console. 
            logLevel: env.active.stackdriver.errors.logLevel,                   // 2 (warnings). 0 (no logs) 5 (all logs) 
            serviceContext: {
                service: serviceId,
                version: env.active.api.versions.current
            }            
        });
        this.ERR = errorReporter;

        // initialise configurations                                            // this gets called by api/logger as well
        this.initialise();

    }

    // toggle logging based on current configs
    initialise() {                                                              // called by constructor and by api/logging at runtim  
        
        const serviceId = consts.system.SERVICE_ID

        // (re)create an instance of each statement     
        messagingStatement = new MessagingStatement(logWriter, serviceId);
        dataStatement = new DataStatement(logWriter, serviceId);
        exceptionStatement = new ExceptionStatement(logWriter, serviceId, errorReporter);
        errorStatement = new ErrorStatement(logWriter, serviceId, errorReporter);
        traceStatement = new TraceStatement(logWriter, serviceId);


        // create the public interface for this Logger, for clients to use 
        this.messaging = function (topic, offset, msgsArray, itemQty, sender) { 
            messagingStatement.write(topic, offset, msgsArray, itemQty, sender);
        }
        this.data = function (dataset, table, id, rowArray) {
            dataStatement.write(dataset, table, id, rowArray);
        }
        this.exception = function(label, errMessage, errEvent) {         // errEvent is a ErrorEvent object created with log.ERR.event()
            exceptionStatement.write(label, errMessage, errEvent);
        }
        this.error = function(label, errObject) {            // errObject is a Error object created with 'new Error(message)'
            errorStatement.write(label, errObject);
        }
        this.trace = function(label, value, payload) {
            traceStatement.write(label, value, payload);
        }

        
        // runtime enums for log statements
        this.enums = {
            labels: {                                                               // lables used in trace statements
                requestStatus: "Request",
                responseStatus: "Response",
                configChange: "Configs",
                watchVar: "Variable",                                                // use for watch variables - this can be combined with an release or experiment feature, to watch a variable in a new feature
                unexpected: "Unexpected"
            }
        }

    }

}

module.exports = Logger;
