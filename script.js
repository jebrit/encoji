const utf8Encoder = new TextEncoder("utf-8");
const utf8Decoder = new TextDecoder("utf-8");
const textSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

let encodeModeStatus = true;

function encode() {
  if (encodeModeStatus == false) {
    return;
  }
  const text_input_str = document.getElementById("input-textarea").value;
  if (text_input_str.length == 0) {
    document.getElementById("output-textarea").value = "";
    return;
  }

  const alphabet_input_str = document.getElementById("alphabet-input").value;
  const alphabet = textToSegmented(alphabet_input_str)
  const base = alphabet.length;
  if (base < 2 || base > 36) {
    document.getElementById("output-textarea").value = "";
    return;
  }

  const uint8Array = textToUint8Array(text_input_str);
  const binaryText = uint8ArrayToBinaryText(uint8Array);
  const number = binaryTextToNumber(binaryText);
  const baseEncodedText = numberToBaseEncodedText(number, base);
  const emojiText = baseEncodedTextToAlphabetEncodedText(baseEncodedText, alphabet, base);
  const fullOutput = alphabet.join("") + emojiText;

  document.getElementById("output-textarea").value = fullOutput;
}


function decode() {
  if (encodeModeStatus == true) {
    return;
  }
  const text_output_str = document.getElementById("output-textarea").value;
  
  const segmentedEncoded = textToSegmented(text_output_str);
  const [alphabet, encodedMessage] = splitHeaderMessage(segmentedEncoded);
  const base = alphabet.length;

  document.getElementById("alphabet-input").value = alphabet.join("");
  
  const baseEncodedText = alphabetEncodedSegmentsToBaseEncodedText(encodedMessage, alphabet, base);
  const number = baseEncodedTextToNumber(baseEncodedText, base);
  const binaryText = numberToBinaryText(number);
  const uint8Array = binaryTextToUint8Array(binaryText);
  const text = uint8ArrayToText(uint8Array);

  document.getElementById("input-textarea").value = text;
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

function numberToBaseEncodedText(number, base) {
  return number.toString(base);
}

function baseEncodedTextToAlphabetEncodedText(baseEncodedText, alphabet, base) {
  return Array.from(baseEncodedText).map(i => {
    const alphabetIndex = parseInt(i, base);
    return alphabet[alphabetIndex];
  }).join("");
}

// Decode

function alphabetEncodedSegmentsToBaseEncodedText(alphabetEncodedArr, alphabet, base) {
  const alphabetMap = alphabet.reduce((acc, item, index) => {
    acc[item] = index;
    return acc;
  }, {});

  return alphabetEncodedArr.map(item => {
    const alphabetIndex = alphabetMap[item];
    const baseDigit = alphabetIndex.toString(base);
    return baseDigit;
  }).join("");
}

function baseEncodedTextToNumber(str, base) {
  let numericValue = BigInt(0);
  const baseMultiplier = BigInt(base)
  for (let i = 0; i < str.length; i++) {
    const digit = BigInt(parseInt(str[i], base));
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

// Segment

function textToSegmented(text) {
  return Array.from(textSegmenter.segment(text)).map(s => s.segment);
}