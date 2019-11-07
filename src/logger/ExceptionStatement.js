//@ts-check
"use strict";
/**
 * ./environment/ExceptionStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

class ExceptionStatement extends Statement {

    // constructor
    constructor(logWriter, serviceId, errorReporter) {

        super(logWriter, serviceId);
        this.statementName = enums.logging.statements.exception;
        this.errorReporter = errorReporter;

        this.initialise();
    }

    // entrypoint for clients to call. errEvent is a ErrorEvent object created with log.ERR.event()
    write(label, errMessage, errEvent) {
        
        // setup the error function, message, and service context 
        errEvent.setFunctionName(label)
            .setMessage(errMessage)
            .serviceContext = {
                service: env.active.api.host,
                version: env.active.api.versions.current,
                resourceType: env.active.stackdriver.logging.resource                      // e.g. gce_instance
            }

        this._writeConsoleInfo(label, errMessage, errEvent);
        this._writeConsoleDebug(label, errMessage, errEvent);
        this._writeStackdriverInfo(label, errMessage, errEvent);
        this._writeStackdriverDebug(label, errMessage, errEvent);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(label, errMessage, errEvent) {
        let payload = `[${label}] ${errMessage}`;
        super._writeConsole(this.statementName, Statement.Severity.WARNING, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(label, errMessage, errEvent) {
        let payload = {
            event: errEvent, label: label, message: errMessage
        }
        super._writeConsole(this.statementName, Statement.Severity.WARNING, enums.logging.verbosity.debug, payload);
    }

    // exceptions write the same content once only for info or debug, not both.
    _writeStackdriverInfo(label, errMessage, errEvent) {
        let payload = {
            event: errEvent, label: label, message: errMessage, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.WARNING, payload);
        this.errorReporter.report(errEvent);

    };
    _writeStackdriverDebug(label, errMessage, errEvent) {
        let payload = {
            event: errEvent, label: label, message: errMessage, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.WARNING, payload);
        this.errorReporter.report(errEvent);
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isException()) {
            this.write = function (label, errMessage, errEvent) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (label, errMessage, errEvent) { };
            this._writeStackdriverDebug = function (label, errMessage, errEvent) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (label, errMessage, errEvent) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (label, errMessage, errEvent) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (label, errMessage, errEvent) { };
            this._writeConsoleDebug = function (label, errMessage, errEvent) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (label, errMessage, errEvent) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (label, errMessage, errEvent) { };
            }
        }
    }

}

module.exports = ExceptionStatement;
