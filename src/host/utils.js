//@ts-check
'use strict';
/**
 * PACKAGE: ./host/index.js
 * schemas and constants
 * utils.js is from api host - any changes should be mastered in api host utils.js -----------------------------------------
 */
const enums = require('./enums');
const consts = require('../host/constants');

const moment = require('moment');


//returns whether the findValue exists at least once in the findInArray
module.exports.valueExistsInArray = (findInArray, findValue) => {

    const EXITFOR = findInArray.length;

    let n;
    let exists = false;
    for (n = 0; n < findInArray.length; n++) {
        if (findInArray[n] === findValue) {
            exists = true;
            n = EXITFOR;
        }
    }

    return exists;
}

// returns a random number between min and max with decimal places based on precision 
module.exports.randomFloat = (min, max, decimalPlaces) => {

    const precision = 1 * Math.pow(10, decimalPlaces);                      // e.g. 3 decimals = 1000000
    min = min * precision;                                                  // adjust before dividing for decimal place
    max = max * precision;

    let random = (Math.floor(Math.random() * max) + min) / precision;       //generate a random number with the required precision
    let randomFixed = random.toFixed(decimalPlaces);                        // fix the decimal places including trailing zeros which may be missing in 'random'

    return randomFixed;

}

// returns a fixed length string from a random integer between min and max, paded with leading zeros if the number has less digits than the number of digits in max.
// calls randomFloat() 
module.exports.randomIntegerString = (min, max) => {

    const ZERO_DECIMAL_PLACES = 0;
    
    // get a random number 
    let minLength = max.toString().length;               
    let randomInt = this.randomFloat(min, max, ZERO_DECIMAL_PLACES);
    let randomIntStr = randomInt.toString().substring(0,minLength);

    // pad zeros if shorter than max 
    return randomIntStr.padStart(minLength, '0');

}


// converts a hex value to an array of reversed bits, the least-significant-bit (rightmost bit) is in element zero       
module.exports.hex2bitArray = (hexValue, minLength) => {
    const hexBase = 16;
    const binaryBase = 2;
    
    // convert hex to binary - e.g. 1A79 --> 0001 1010 0111 1001
    let binaryValue = parseInt(hexValue, hexBase).toString(binaryBase).padStart(minLength, '0');
    
    // make a reversed array - e.g  bitArray[0] = 1, bitArray[1] = 0
    let bitArray = binaryValue.split('').reverse();  
    return bitArray;
}



// test... node src/host/utils
// console.log(this.randomIntegerString(1,999));