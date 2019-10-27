//@ts-check
"use strict";
/**
 * ./environment/TraceStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');
const consts = require('../host/constants');

const Statement = require('./Statement');

const moment = require('moment');

class TraceStatement extends Statement {

    // constructor
    constructor(logWriter) {

        super(logWriter);
        this.statementName = enums.logging.statements.trace;

        this.initialise();
    }

    // entrypoint for clients to call. errEvent is a ErrorEvent object created with log.ERR.event()
    write(label, object) {

        this._writeConsoleInfo(label, object);
        this._writeConsoleDebug(label, object);
        this._writeStackdriverInfo(label, object);
        this._writeStackdriverDebug(label, object);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(label, object) {
        let payload = `[${moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat)}] ${label}`;
        super._writeConsole(this.statementName, Statement.Severity.INFO, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(label, object) {
        let payload = {
            object: object, time: moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat), label: label
        }
        super._writeConsole(this.statementName, Statement.Severity.DEBUG, enums.logging.verbosity.debug, payload);
    }

    // traces write the same content once only for info or debug, not both.
    _writeStackdriverInfo(label, object) {
        let payload = {
            time: moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat), label: label, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.NONE, payload);
    };
    _writeStackdriverDebug(label, object) {
        let payload = {
            object: object, time: moment.utc().format(consts.dateTime.bigqueryZonelessTimestampFormat), label: label, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.NONE, payload);
    }


    // annul write methods based on current configs
    initialise() {                                                                                      // called by conmstructor

        // messaging
        if (!super._isTrace()) {
            this.write = function (label, object) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (label, object) { };
            this._writeStackdriverDebug = function (label, object) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (label, object) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (label, object) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (label, object) { };
            this._writeConsoleDebug = function (label, object) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (label, object) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (label, object) { };
            }
        }
    }

}

module.exports = TraceStatement;
