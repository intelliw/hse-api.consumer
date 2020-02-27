//@ts-check
"use strict";
/**
 * ./environment/Statement.js
 *  Stackdriver logging and error reporting appender  
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

// stackdriver severities
const SEVERITY = {
    INFO: "INFO",
    DEBUG: "DEBUG",
    WARNING: "WARNING",
    ERROR: "ERROR",
    NONE: global.undefined
}

class Statement {

    // constructor
    constructor(logWriter, serviceId) {

        // store logwriter instance variables 
        this.logWriter = logWriter;
        this.resourceType = env.active.stackdriver.logging.resourceType;
        this.serviceId = serviceId;
    }
    
    // Stackdriver ----------------------

    // Stackdriver write operatation
    async _writeStackdriver(statement, severity, payload) {

        // append to active environment's stackdriver log
        try {

            // create metadata to describe logs from this resource (compute instance, INFO)
            const metadata = {                                                          // the metadata associated with a log entry
                resource: {
                    type: this.resourceType,
                    labels: { 
                        instance_id: this.serviceId }                                     // label name should be 'instance_id' if resourceType is 'gce_instance'
                },
                severity: severity                                                      // LogSeverity      https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity    
            };

            // write  log entry
            this.logWriter.write([
                this.logWriter.entry(                                                   // construct the log message
                    metadata, payload)
            ]);

        } catch (e) {
            console.error(`_writeStackdriver: ${e.message}`, e)
        }

    }
    
    // Console --------------------------

    // Console write operatation
    async _writeConsole(statement, severity, verbosity, payload) {

        console.log(`${statement.toUpperCase()}.${verbosity}`, payload)
    }


    // check VERBOSITY configs  ----------------------------------------------------------------------------------
    _isInfo() { return env.active.logging.verbosity.includes(enums.logging.verbosity.info); }
    _isDebug() { return env.active.logging.verbosity.includes(enums.logging.verbosity.debug); }

    // check STATEMENTS configs ----------------------------------------------------------------------------------
    _isData() { return env.active.logging.statements.includes(enums.logging.statements.data); }
    _isMessaging() { return env.active.logging.statements.includes(enums.logging.statements.messaging); }
    _isError() { return env.active.logging.statements.includes(enums.logging.statements.error); }
    _isException() { return env.active.logging.statements.includes(enums.logging.statements.exception); }
    _isTrace() { return env.active.logging.statements.includes(enums.logging.statements.trace); }

    // check APPENDERS configs ----------------------------------------------------------------------------------
    _isStackdriver() { return env.active.logging.appenders.includes(enums.logging.appenders.stackdriver); }
    _isConsole() { return env.active.logging.appenders.includes(enums.logging.appenders.console); }

}

module.exports = Statement;

// static constants for subtypes to use
module.exports.Severity = SEVERITY;
