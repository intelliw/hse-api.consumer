//@ts-check
"use strict";
/**
 * ./environment/ErrorStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

class ErrorStatement extends Statement {

    // constructor
    constructor(logWriter, serviceId, errorReporter) {

        super(logWriter, serviceId);
        this.statementName = enums.logging.statements.error;
        this.errorReporter = errorReporter;

        this.initialise();
    }

    // entrypoint for clients to call. // errObject is a Error object created with 'new Error(message)'
    write(label, errObject) {

        this._writeConsoleInfo(label, errObject);
        this._writeConsoleDebug(label, errObject);
        this._writeStackdriverInfo(label, errObject);
        this._writeStackdriverDebug(label, errObject);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(label, errObject) {
        let payload = `[${label}] ${errObject.message}`;
        super._writeConsole(this.statementName, Statement.Severity.ERROR, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(label, errObject) {
        let payload = {
            stack: errObject.stack, label: label, message: errObject.message
        }
        super._writeConsole(this.statementName, Statement.Severity.ERROR, enums.logging.verbosity.debug, payload);
    }

    // errors write the same content once only for info or debug, not both.
    _writeStackdriverInfo(label, errObject) {
        let payload = {
            stack: errObject.stack, label: label, message: errObject.message, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.ERROR, payload);
        this.errorReporter.report(errObject);

    };
    _writeStackdriverDebug(label, errObject) {
        let payload = {
            stack: errObject.stack, label: label, message: errObject.message, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.ERROR, payload);
        this.errorReporter.report(errObject);       
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isError()) {
            this.write = function (label, errObject) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (label, errObject) { };
            this._writeStackdriverDebug = function (label, errObject) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (label, errObject) { }; 
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (label, errObject) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (label, errObject) { };
            this._writeConsoleDebug = function (label, errObject) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (label, errObject) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (label, errObject) { };
            }
        }
    }

}

module.exports = ErrorStatement;
