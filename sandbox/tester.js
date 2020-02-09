//@ts-check
'use strict';

const moment = require('moment');

// converts a hex value to an array of reversed bits, the least-significant-bit (rightmost bit) is in element zero       
function hex2bitArray(hexValue, minLength){
    const hexBase = 16;
    const binaryBase = 2;
    
    // convert hex to binary - e.g. 1A79 --> 0001 1010 0111 1001
    let binaryValue = parseInt(hexValue, hexBase).toString(binaryBase).padStart(minLength, '0');
    
    // make a reversed array - e.g  bitArray[0] = 1, bitArray[1] = 0
    let bitArray = binaryValue.split('').reverse();  
    return bitArray;
}

// test... 
// node sandbox/tester
c@onsole.log(hex2bitArray("1A79", 16)[0] == 1);

