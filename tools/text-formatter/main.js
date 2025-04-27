document.querySelectorAll('button[data-color]').forEach(button => {
    const hex = button.getAttribute('data-color');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    button.style.backgroundColor = `#${hex}`;
    button.style.color = brightness < 128 ? 'white' : 'black';
});

const textarea = document.querySelector('.Editor textarea');
const output = document.querySelector('.Output div');

const formatButtons = document.querySelectorAll('[data-formatting-symbol]');

formatButtons.forEach(button => {
    button.addEventListener('click', () => {
        const symbol = button.getAttribute('data-formatting-symbol');
        insertAtCursor(textarea, '&' + symbol);
        updateOutput();
    });
});

function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;

    textarea.value = currentText.substring(0, start) + text + currentText.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
}
const colors = {
    "0": "000000",
    "1": "0000AA",
    "2": "00AA00",
    "3": "00AAAA",
    "4": "AA0000",
    "5": "AA00AA",
    "6": "FFAA00",
    "7": "AAAAAA",
    "8": "555555",
    "9": "5555FF",
    "a": "55FF55",
    "b": "55FFFF",
    "c": "FF5555",
    "d": "FF55FF",
    "e": "FFFF55",
    "f": "FFFFFF",
};

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function updateOutput() {
    let input = textarea.value;
    let outputHTML = '';
    
    let currentColor = '';
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrikethrough = false;
    
    let openSpan = false;

    function openNewSpan() {
        let style = '';
        if (currentColor) style += `color: #${currentColor};`;
        if (isBold) style += 'font-weight: bold;';
        if (isItalic) style += 'font-style: italic;';
        if (isUnderline) style += 'text-decoration: underline;';
        if (isStrikethrough) style += 'text-decoration: line-through;';
        outputHTML += `<span style="${style}">`;
        openSpan = true;
    }

    function closeSpan() {
        if (openSpan) {
            outputHTML += `</span>`;
            openSpan = false;
        }
    }

    for (let i = 0; i < input.length; i++) {
        if (input[i] === '&' && i + 1 < input.length) {
            let code = input[i + 1].toLowerCase();
            
            closeSpan();

            if (colors[code]) {
                currentColor = colors[code];
                openNewSpan();
                i++;
                continue;
            }
            if (code === 'l') { // bold
                isBold = true;
                openNewSpan();
                i++;
                continue;
            }
            if (code === 'o') { // italic
                isItalic = true;
                openNewSpan();
                i++;
                continue;
            }
            if (code === 'n') { // underline
                isUnderline = true;
                openNewSpan();
                i++;
                continue;
            }
            if (code === 'm') { // strikethrough
                isStrikethrough = true;
                openNewSpan();
                i++;
                continue;
            }
            if (code === 'r') { // reset
                currentColor = '';
                isBold = false;
                isItalic = false;
                isUnderline = false;
                isStrikethrough = false;
                i++;
                continue;
            }
        }

        // normal character
        if (!openSpan) openNewSpan();
        outputHTML += escapeHtml(input[i]);
    }

    // close any remaining open spans
    closeSpan();

    output.innerHTML = outputHTML;
}

textarea.addEventListener('input', updateOutput);