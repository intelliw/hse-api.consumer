//@ts-check
'use strict';
/**
 * PACKAGE: ./host/index.js
 * schemas and constants
 */
const enums = require('./enums');
const consts = require('../host/constants');


/* utils below this line are from api host - any changes should be mastered in api host utils.js -----------------------------------------*/


// returns a fixed length string from a random integer between min and max, paded with leading zeros if the number has less digits than the number of digits in max.
// calls randomFloat() and padZer()
module.exports.randomIntegerString = (min, max) => {

    const ZERO_DECIMAL_PLACES = 0;
    
    // get a random number 
    let maxLength = max.toString().length;               
    let randomInt = this.randomFloat(min, max, ZERO_DECIMAL_PLACES);
    let randomIntStr = randomInt.toString().substring(0,maxLength);

    // pad zeros if shorter than max 
    return this.padZero(randomIntStr, maxLength);

}

// pads leading zeros if the number is less than the width
module.exports.padZero = (n, width) => {
    let z = '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
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

// test... node src/host/utils
// console.log(this.randomIntegerString(1,999));