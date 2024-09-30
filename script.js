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
  if (base < 2) {
    document.getElementById("output-textarea").value = "";
    return;
  }

  const uint8Array = textToUint8Array(text_input_str);
  const binaryText = uint8ArrayToBinaryText(uint8Array);
  const number = binaryTextToNumber(binaryText);
  const baseDigitArray = numberToBaseDigitArray(number, base);
  const emojiText = baseDigitArrayToAlphabetEncodedText(baseDigitArray, alphabet, base);
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
  
  const baseDigitArray = alphabetEncodedSegmentsToBaseDigitArray(encodedMessage, alphabet, base);
  const number = baseDigitArrayToNumber(baseDigitArray, base);
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

function numberToBaseEncodedTextOld(number, base) {
  return number.toString(base);
}

function numberToBaseDigitArray(number, base){
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

// Segment

function textToSegmented(text) {
  return Array.from(textSegmenter.segment(text)).map(s => s.segment);
}

// UI

function toggleMode(encodeMode) {
  if (encodeMode == encodeModeStatus) {
    return;
  }
  encodeModeStatus = encodeMode;
  if (encodeMode) {
    document.getElementById("encoder-button").classList.add("toggled-on");
    document.getElementById("decoder-button").classList.remove("toggled-on");
    document.getElementById("converter-row").classList.remove("reverse");
    document.getElementById("input-textarea").removeAttribute('readonly');
    document.getElementById("output-textarea").setAttribute('readonly', 'readonly');
    document.getElementById("alphabet-input").removeAttribute('readonly');
    document.getElementById("plaintext-copy-button").classList.add("hidden");
    document.getElementById("plaintext-copy-button").disabled = true;
    document.getElementById("encoded-copy-button").classList.remove("hidden");
    document.getElementById("encoded-copy-button").removeAttribute("disabled");
    encode();
  } else {
    document.getElementById("encoder-button").classList.remove("toggled-on");
    document.getElementById("decoder-button").classList.add("toggled-on");
    document.getElementById("converter-row").classList.add("reverse");
    document.getElementById("input-textarea").setAttribute('readonly', 'readonly');
    document.getElementById("output-textarea").removeAttribute('readonly');
    document.getElementById("alphabet-input").setAttribute('readonly', 'readonly');
    document.getElementById("encoded-copy-button").classList.add("hidden");
    document.getElementById("encoded-copy-button").disabled = true;
    document.getElementById("plaintext-copy-button").classList.remove("hidden");
    document.getElementById("plaintext-copy-button").removeAttribute("disabled");
    decode();
  }
}

function copyText(textId, iconId) {
  const text = document.getElementById(textId).value;
  navigator.clipboard.writeText(text).then(function() {
    document.getElementById(iconId).src = "assets/check.svg";
    setTimeout(function() {
      document.getElementById(iconId).src = "assets/copy.svg";
    }, 1500);
  }, function(err) {
    console.error("Could not copy to clipboard: ", err);
  });
}