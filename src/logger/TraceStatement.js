//@ts-check
"use strict";
/**
 * ./environment/TraceStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

const moment = require('moment');

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSSS'             // "2019-02-09T16:00:17.0200"  same as consts.bigqueryZonelessTimestampFormat     

class TraceStatement extends Statement {

    // constructor
    constructor(logWriter, serviceId) {

        super(logWriter, serviceId);
        this.statementName = enums.logging.statements.trace;

        this.initialise();
    }

    // entrypoint for clients to call
    write(label, value, payload) {

        this._writeConsoleInfo(label, value, payload);
        this._writeConsoleDebug(label, value, payload);
        this._writeStackdriverInfo(label, value, payload);
        this._writeStackdriverDebug(label, value, payload);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(label, value, payload) {
        let payloadObj = `[${moment.utc().format(TIMESTAMP_FORMAT)}] ${label} ${value}`;
        super._writeConsole(this.statementName, Statement.Severity.INFO, enums.logging.verbosity.info, payloadObj);
    }
    _writeConsoleDebug(label, value, payload) {
        let payloadObj = {
            payload: payload, time: moment.utc().format(TIMESTAMP_FORMAT), label: label, value: value
        }
        super._writeConsole(this.statementName, Statement.Severity.DEBUG, enums.logging.verbosity.debug, payloadObj);
    }

    // traces write the same content once only for info or debug, not both.
    _writeStackdriverInfo(label, value, payload) {
        let payloadObj = {
            label: label, value: value, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.NONE, payloadObj);
    };
    _writeStackdriverDebug(label, value, payload) {
        let payloadObj = {
            payload: payload, label: label, value: value, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.NONE, payloadObj);
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isTrace()) {
            this.write = function (label, value, payload) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (label, value, payload) { };
            this._writeStackdriverDebug = function (label, value, payload) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (label, value, payload) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (label, value, payload) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (label, value, payload) { };
            this._writeConsoleDebug = function (label, value, payload) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (label, value, payload) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (label, value, payload) { };
            }
        }
    }

}

module.exports = TraceStatement;
