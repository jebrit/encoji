function encodeUpdate() {
    const plaintext_input_str = document.getElementById("input-textarea").value;
    const alphabet_input_str = document.getElementById("alphabet-input").value;
    try {
        result_str = encode(alphabet_input_str, plaintext_input_str)
        document.getElementById("output-textarea").value = result_str;
    } catch (e) {
        console.log(e);
        const message = e.message || "";
        document.getElementById("output-textarea").value = message;
    }
}

function decodeUpdate() {
    const encoded_input_str = document.getElementById("output-textarea").value;
    try {
        const [alphabet, plaintext] = decode(encoded_input_str)
        document.getElementById("alphabet-input").value = alphabet.join("");
        document.getElementById("input-textarea").value = plaintext;
    } catch (e) {
        console.log(e);
        const message = e.message || "";
        document.getElementById("alphabet-input").value = "";
        document.getElementById("input-textarea").value = message;
    }
}

function resetEncodeMode() {
    document.getElementById("encoder-button").classList.add("toggled-on");
    document.getElementById("decoder-button").classList.remove("toggled-on");
    document.getElementById("converter-row").classList.remove("reverse");
    document.getElementById("input-textarea").removeAttribute('readonly');
    document.getElementById("output-textarea").setAttribute('readonly', 'readonly');
    document.getElementById("input-textarea").classList.add('left-textarea');
    document.getElementById("output-textarea").classList.remove('left-textarea');
    document.getElementById("alphabet-input").removeAttribute('readonly');
    document.getElementById("plaintext-copy-button").classList.add("hidden");
    document.getElementById("plaintext-copy-button").disabled = true;
    document.getElementById("encoded-copy-button").classList.remove("hidden");
    document.getElementById("encoded-copy-button").removeAttribute("disabled");
}

function resetDecodeMode() {
    document.getElementById("encoder-button").classList.remove("toggled-on");
    document.getElementById("decoder-button").classList.add("toggled-on");
    document.getElementById("converter-row").classList.add("reverse");
    document.getElementById("input-textarea").setAttribute('readonly', 'readonly');
    document.getElementById("output-textarea").removeAttribute('readonly');
    document.getElementById("input-textarea").classList.remove('left-textarea');
    document.getElementById("output-textarea").classList.add('left-textarea');
    document.getElementById("alphabet-input").setAttribute('readonly', 'readonly');
    document.getElementById("encoded-copy-button").classList.add("hidden");
    document.getElementById("encoded-copy-button").disabled = true;
    document.getElementById("plaintext-copy-button").classList.remove("hidden");
    document.getElementById("plaintext-copy-button").removeAttribute("disabled");
}

function switchMode(newMode) {
    if (newMode == currentMode) {
        return;
    }
    currentMode = newMode;
    if (currentMode == Mode.ENCODE) {
        resetEncodeMode();
        encodeUpdate();
    } else {
        resetDecodeMode();
        decodeUpdate();
    }
}

function copyText(textId, iconId) {
    const text = document.getElementById(textId).value;
    navigator.clipboard.writeText(text).then(function () {
        document.getElementById(iconId).src = "assets/check.svg";
        setTimeout(function () {
            document.getElementById(iconId).src = "assets/copy.svg";
        }, 1500);
    }, function (err) {
        console.error("Could not copy to clipboard: ", err);
    });
}