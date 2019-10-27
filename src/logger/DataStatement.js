//@ts-check
"use strict";
/**
 * ./environment/DataStatement.js
 *  logs statements about data transaction events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

class DataStatement extends Statement {

    // constructor
    constructor(logWriter) {
        super(logWriter);
        this.statementName = enums.logging.statements.data;
        
        this.initialise();

    }

    // entrypoint for clients to call
    write(dataset, table, id, rowArray) {

        this._writeConsoleInfo(dataset, table, id, rowArray);
        this._writeConsoleDebug(dataset, table, id, rowArray);
        this._writeStackdriverInfo(dataset, table, id, rowArray);
        this._writeStackdriverDebug(dataset, table, id, rowArray);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(dataset, table, id, rowArray) {
        let payload = `[${dataset}.${table}}] id: ${id}, ${rowArray.length} rows`;
        super._writeConsole(this.statementName, Statement.Severity.INFO, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(dataset, table, id, rowArray) {
        let payload = {
            rows: rowArray, rowqty: rowArray.length,
            dataset: dataset, table: table, id: id
        }
        super._writeConsole(this.statementName, Statement.Severity.DEBUG, enums.logging.verbosity.debug, payload);
    }
    _writeStackdriverInfo(dataset, table, id, rowArray) {
        let payload = {
            rowqty: rowArray.length, dataset: dataset, table: table, 
            id: id, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.INFO, payload);
    };
    _writeStackdriverDebug(dataset, table, id, rowArray) {
        let payload = {
            rows: rowArray, rowqty: rowArray.length, 
            dataset: dataset, table: table, id: id, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.DEBUG, payload);
    };

    // annul write methods based on current configs
    initialise() {                                          // called by conmstructor

        // messaging
        if (!super._isData()) {
            this.write = function (dataset, table, id, rowArray) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (dataset, table, id, rowArray) { };
            this._writeStackdriverDebug = function (dataset, table, id, rowArray) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (dataset, table, id, rowArray) { }; 
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (dataset, table, id, rowArray) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (dataset, table, id, rowArray) { };
            this._writeConsoleDebug = function (dataset, table, id, rowArray) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (dataset, table, id, rowArray) { };
            }
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (dataset, table, id, rowArray) { };
            }
        }
    }

}

module.exports = DataStatement;
