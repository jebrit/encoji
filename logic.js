const utf8Encoder = new TextEncoder("utf-8");
const utf8Decoder = new TextDecoder("utf-8");
const textSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

const Mode = {
    ENCODE: 'encode',
    DECODE: 'decode'
}
let currentMode = Mode.ENCODE;

function encode(alphabet_input_str, plaintext_input_str) {
    if (plaintext_input_str.length == 0) {
        return "";
    }
    const alphabet = textToSegmented(alphabet_input_str);
    const base = alphabet.length;
    if (base < 2) {
        return "";
    }
    uniqueCharacters = (new Set(alphabet)).size;
    if (base != uniqueCharacters) {
        throw { message: "Custom alphabet cannot repeat characters" }
    }

    const uint8Array = textToUint8Array(plaintext_input_str);
    const binaryText = uint8ArrayToBinaryText(uint8Array);
    const number = binaryTextToNumber(binaryText);
    const baseDigitArray = numberToBaseDigitArray(number, base);
    const emojiText = baseDigitArrayToAlphabetEncodedText(baseDigitArray, alphabet, base);
    const fullOutput = alphabet.join("") + emojiText;
    return fullOutput;
}

function decode(encoded_input_str) {
    if (encoded_input_str.length == 0) {
        return [[], ""];
    }

    const segmentedEncoded = textToSegmented(encoded_input_str);
    const [alphabet, encodedMessage] = splitHeaderMessage(segmentedEncoded);
    if (!isValidMessageFromAlphabet(alphabet, encodedMessage)) {
        throw { message: "Invalid message" }
    }
    const base = alphabet.length;

    const baseDigitArray = alphabetEncodedSegmentsToBaseDigitArray(encodedMessage, alphabet, base);
    const number = baseDigitArrayToNumber(baseDigitArray, base);
    const binaryText = numberToBinaryText(number);
    const uint8Array = binaryTextToUint8Array(binaryText);
    const plaintext = uint8ArrayToText(uint8Array);
    return [alphabet, plaintext];
}


// Encode

function textToUint8Array(text) {
    return utf8Encoder.encode(text);
}

function uint8ArrayToBinaryText(array) {
    return Array.from(array).map(i => i.toString(2).padStart(8, "0")).join("");
}

function binaryTextToNumber(binaryText) {
    return BigInt('0b' + binaryText);
}

function numberToBaseEncodedTextOld(number, base) {
    return number.toString(base);
}

function numberToBaseDigitArray(number, base) {
    let numericValue = BigInt(number);
    const baseDivider = BigInt(base);
    let baseDigitArray = [];
    while (numericValue > 0) {
        baseDigitArray.push(numericValue % baseDivider);
        numericValue = numericValue / baseDivider;
    }
    return baseDigitArray.reverse();
}

function baseDigitArrayToAlphabetEncodedText(baseDigitArray, alphabet, base) {
    return baseDigitArray.map(i => {
        return alphabet[i];
    }).join("");
}

// Decode

function alphabetEncodedSegmentsToBaseDigitArray(alphabetEncodedArr, alphabet, base) {
    const alphabetMap = alphabet.reduce((acc, item, index) => {
        acc[item] = index;
        return acc;
    }, {});

    return alphabetEncodedArr.map(item => alphabetMap[item]);
}

function baseDigitArrayToNumber(baseDigitArray, base) {
    let numericValue = BigInt(0);
    const baseMultiplier = BigInt(base)
    for (let i = 0; i < baseDigitArray.length; i++) {
        const digit = BigInt(baseDigitArray[i]);
        numericValue = numericValue * baseMultiplier + digit;
    }
    return numericValue;
}

function numberToBinaryText(number) {
    return number.toString(2);
}

function binaryTextToUint8Array(binaryText) {
    const bytes = Math.ceil(binaryText.length / 8);
    const paddedLength = bytes * 8;
    const paddedBinaryText = binaryText.padStart(paddedLength, "0");
    const arr = new Uint8Array(bytes);
    for (let i = 0; i <= bytes; i++) {
        const offset = i * 8;
        const byteText = paddedBinaryText.slice(offset, offset + 8);
        const numeric = parseInt(byteText, 2);
        arr[i] = numeric;
    }
    return arr;
}

function uint8ArrayToText(uint8Array) {
    return utf8Decoder.decode(uint8Array);
}

// Header 

function splitHeaderMessage(messageArr) {
    const seen = new Set();
    const headerArr = [];
    for (const item of messageArr) {
        if (seen.has(item)) {
            break;
        }
        seen.add(item);
        headerArr.push(item);
    }
    const headerLength = headerArr.length;
    const remainingMessage = messageArr.slice(headerLength)
    return [headerArr, remainingMessage];
}

function isValidMessageFromAlphabet(alphabet, encodedMessage) {
    const validChars = new Set(alphabet);
    for (const messageChar of encodedMessage) {
        if (!validChars.has(messageChar)) {
            return false;
        }
    }
    return true;
}

// Segment

function textToSegmented(text) {
    return Array.from(textSegmenter.segment(text)).map(s => s.segment);
}