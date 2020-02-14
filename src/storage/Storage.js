//@ts-check
"use strict";
/**
 * ./publishers/Storage.js
 */

class Storage {
    /**
     */
    constructor(storageObj) {

        // setup instance variables
        this.storageObj = storageObj;

    }


    /* insert rows into the storage adapter
     * the sharedId is common to all rows in the array, and is needed for logging
     */
    async write(sharedId, rowArray) {
    }

}

module.exports = Storage;
