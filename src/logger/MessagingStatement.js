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
    constructor(logWriter, serviceId) {
        super(logWriter, serviceId);
        this.statementName = enums.logging.statements.messaging;
        this.initialise();
    }

    // entrypoint for clients to call
    write(topic, id, msgsArray, itemQty, sender) {

        this._writeConsoleInfo(topic, id, msgsArray, itemQty, sender);
        this._writeConsoleDebug(topic, id, msgsArray, itemQty, sender);
        this._writeStackdriverInfo(topic, id, msgsArray, itemQty, sender);
        this._writeStackdriverDebug(topic, id, msgsArray, itemQty, sender);

    }

    // calls to super - these are annulled into no-ops by initialise function based on configs  
    _writeConsoleInfo(topic, id, msgsArray, itemQty, sender) {
        let payload = `[${topic}:${id}] ${msgsArray.length} msgs, ${itemQty} items, sender:${sender}`;
        super._writeConsole(this.statementName, Statement.Severity.INFO, enums.logging.verbosity.info, payload);
    }
    /** MESSAGING.debug, 
    *   e.g. 
    *   { messages: [ 
    *    { key: 'TEST-01',
    *      value: '{"pms":{"id":"TEST-01"},"data":[{"pack":{"id":"0241","dock":1,"amps":-1.601,"temp":[35,33,34],"cell":{"open":[],"volts":[3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.92,3.91]},"fet":{"open":[1,2],"temp":[34.1,32.2]},"status":"0001"},"sys":{"source":"STAGE001"},"time_event":"2019-09-09 08:00:06.0320","time_zone":"+07:00","time_processing":"2019-12-17 04:07:20.7790"}]}' 
    *      } ],
    *    msgsqty: 1,
    *    itemqty: 1,
    *    topic: 'monitoring.pms',
    *    id: '886302092013959',
    *    sender: 'STAGE001' }
    */
    _writeConsoleDebug(topic, id, msgsArray, itemQty, sender) {
        let payload = {
            messages: msgsArray, msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, id: `${id}`,             // e.g. 225-229
            sender: sender
        }
        super._writeConsole(this.statementName, Statement.Severity.DEBUG, enums.logging.verbosity.debug, payload);
    }
    _writeStackdriverInfo(topic, id, msgsArray, itemQty, sender) {
        let payload = {
            msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, id: `${id}`,             // e.g. 225-229
            sender: sender, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.INFO, payload);
    };
    _writeStackdriverDebug(topic, id, msgsArray, itemQty, sender) {
        let payload = {
            messages: msgsArray, msgsqty: msgsArray.length, itemqty: itemQty,
            topic: topic, id: `${id}`,             // e.g. 225-229
            sender: sender, statement: this.statementName
        }
        super._writeStackdriver(this.statementName, Statement.Severity.DEBUG, payload);
    };

    // annul write methods based on current configs
    initialise() {                                          // called by conmstructor

        // messaging
        if (!super._isMessaging()) {
            this.write = function (topic, id, msgsArray, itemQty, sender) { };
        }

        // Stackdriver
        if (!super._isStackdriver()) {
            this._writeStackdriverInfo = function (topic, id, msgsArray, itemQty, sender) { };
            this._writeStackdriverDebug = function (topic, id, msgsArray, itemQty, sender) { }; 
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeStackdriverDebug = function (topic, id, msgsArray, itemQty, sender) { }; 
            }                
            if (super._isDebug() || (!super._isInfo())) {
                this._writeStackdriverInfo = function (topic, id, msgsArray, itemQty, sender) { };
            }
        }

        // Console
        if (!super._isConsole()) {
            this._writeConsoleInfo = function (topic, id, msgsArray, itemQty, sender) { };
            this._writeConsoleDebug = function (topic, id, msgsArray, itemQty, sender) { };
        } else {
            // only 1 applies. if both info and debug are configured debug will take precedence
            if (!super._isDebug()) {
                this._writeConsoleDebug = function (topic, id, msgsArray, itemQty, sender) { };
            }                
            if (super._isDebug() || (!super._isInfo())) {
                this._writeConsoleInfo = function (topic, id, msgsArray, itemQty, sender) { };
            } 
        }
    }


}

module.exports = MessagingStatement;
