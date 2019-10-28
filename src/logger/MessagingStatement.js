//@ts-check
"use strict";
/**
 * ./environment/MessagingStatement.js
 *  logs statements about message broker events 
 */
const enums = require('../environment/enums');
const env = require('../environment/env');

const Statement = require('./Statement');

class MessagingStatement extends Statement {
    
    // constructor
    constructor(logWriter) {
        super(logWriter);
        this.statementName = enums.logging.statements.messaging;
        this.initialise();
    }

    // entrypoint for clients to call
    write(topic, offset, msgsArray, itemQty, sender) {

        this._writeConsoleInfo(topic, offset, msgsArray, itemQty, sender);
        this._writeConsoleDebug(topic, offset, msgsArray, itemQty, sender);
        this._writeStackdriverInfo(topic, offset, msgsArray, itemQty, sender);
        this._writeStackdriverDebug(topic, offset, msgsArray, itemQty, sender);

    }

    // calls to super - these are annulled by initialise function based on configs  
    _writeConsoleInfo(topic, offset, msgsArray, itemQty, sender) {
        let payload = `[${topic}:${offset}-${Number(offset) + (msgsArray.length - 1)}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`;
        super._writeConsole(this.statementName, Statement.Severity.INFO, enums.logging.verbosity.info, payload);
    }
    _writeConsoleDebug(topic, offset, msgsArray, itemQty, sender) {
        let payload = {
            messages: msgsArray, msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
            sender: sender
        }
        super._writeConsole(this.statementName, Statement.Severity.DEBUG, enums.logging.verbosity.debug, payload);
    }
    _writeStackdriverInfo(topic, offset, msgsArray, itemQty, sender) {
        let payload = {
            msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
            sender: sender, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.INFO, payload);
    };
    _writeStackdriverDebug(topic, offset, msgsArray, itemQty, sender) {
        let payload = {
            messages: msgsArray, msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, offset: `${offset}-${Number(offset) + (msgsArray.length - 1)}`,             // e.g. 225-229
            sender: sender, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.DEBUG, payload);
    };

    // annul write methods based on current configs
    initialise() {                                          // called by conmstructor

        // messaging
        if (!super._isMessaging()) {
            this.write = function (topic, offset, msgsArray, itemQty, sender) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (topic, offset, msgsArray, itemQty, sender) { };
            this._writeStackdriverDebug = function (topic, offset, msgsArray, itemQty, sender) { }; 
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (topic, offset, msgsArray, itemQty, sender) { }; 
            }                
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (topic, offset, msgsArray, itemQty, sender) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (topic, offset, msgsArray, itemQty, sender) { };
            this._writeConsoleDebug = function (topic, offset, msgsArray, itemQty, sender) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (topic, offset, msgsArray, itemQty, sender) { };
            }                
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (topic, offset, msgsArray, itemQty, sender) { };
            } 
        }
    }


}

module.exports = MessagingStatement;
