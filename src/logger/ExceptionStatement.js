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
    constructor(logWriter, errorReporter) {

        super(logWriter, errorReporter);
        this.statementName = enums.logging.statements.exception;
        this.errorReporter = errorReporter;

        this.initialise();
    }

    // entrypoint for clients to call. errEvent is a ErrorEvent object created with log.ERR.event()
    write(functionName, errMessage, errEvent) {
        
        // setup the error function, message, and service context 
        errEvent.setFunctionName(functionName)
            .setMessage(errMessage)
            .serviceContext = {
                service: env.active.api.host,
                version: env.active.api.versions.current,
                resourceType: env.active.stackdriver.logging.resource                      // e.g. gce_instance
            }

        this._writeConsoleInfo(functionName, errMessage, errEvent);
        this._writeConsoleDebug(functionName, errMessage, errEvent);
        this._writeStackdriverInfo(functionName, errMessage, errEvent);
        this._writeStackdriverDebug(functionName, errMessage, errEvent);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(functionName, errMessage, errEvent) {
        let payload = `[${functionName}] ${errMessage}`;
        super._writeConsole(this.statementName, Statement.Severity.WARNING, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(functionName, errMessage, errEvent) {
        let payload = {
            event: errEvent, function: functionName, message: errMessage
        }
        super._writeConsole(this.statementName, Statement.Severity.WARNING, enums.logging.verbosity.debug, payload);
    }

    // exceptions write the same content once only for info or debug, not both.
    _writeStackdriverInfo(functionName, errMessage, errEvent) {
        let payload = {
            event: errEvent, function: functionName, message: errMessage, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.WARNING, payload);
        this.errorReporter.report(errEvent);

    };
    _writeStackdriverDebug(functionName, errMessage, errEvent) {
        let payload = {
            event: errEvent, function: functionName, message: errMessage, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.WARNING, payload);
        this.errorReporter.report(errEvent);
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isException()) {
            this.write = function (functionName, errMessage, errEvent) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (functionName, errMessage, errEvent) { };
            this._writeStackdriverDebug = function (functionName, errMessage, errEvent) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (functionName, errMessage, errEvent) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (functionName, errMessage, errEvent) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (functionName, errMessage, errEvent) { };
            this._writeConsoleDebug = function (functionName, errMessage, errEvent) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (functionName, errMessage, errEvent) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (functionName, errMessage, errEvent) { };
            }
        }
    }

}

module.exports = ExceptionStatement;
