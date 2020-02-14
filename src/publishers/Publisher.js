//@ts-check
"use strict";
/**
 * ./publishers/Publisher.js
 */

class Publisher {
    /**
     */
    constructor(publisherObj) {

        // setup instance variables
        this.publisherObj = publisherObj;

    }

    /** implemented by subtype
    * @param {*} msgObj               
    * @param {*} writeTopic 
    * @param {*} sender                                                             // is based on the api key and identifies the source of the data. this value is added to sys.source attribute 
    */
    async publish(msgObj, writeTopic, sender) {
    }

}

module.exports = Publisher;
