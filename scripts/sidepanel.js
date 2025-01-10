const popupLoader = new Loader(document.querySelector('[data-loader]'));
const responseError = new ResponseError(document.querySelector('[data-response_error]'));
const headerBlock = document.querySelector('[data-header]');
const footerBlock = document.querySelector('[data-footer]');
const contentBlock = document.querySelector('[data-content]');
const hiddenContentBlock = document.querySelector('[data-hidden_content]');

function localize() {
    const localizeList = document.querySelectorAll('[data-localize]');
    for (let item of localizeList) {
        const label = item.dataset['localize'];
        item.innerHTML = chrome.i18n.getMessage(label);
    }
}


async function sendRequest(file, mode) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options[mode]', mode);

    const url = 'https://aiwordchecker.online/api/math';
    //const url = 'https://app.wordsuperb.com/dev/test.php';

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to upload file');
    }

    const result = await response.json(); // assuming the response is in JSON format
    return result;
}

function getMode() {
    const radio = document.querySelector('[name="mode"]:checked');
    return radio.value;
}

function clearFileInput() {
    const fileInput = document.querySelector('[data-upload_file]');
    fileInput.value = '';
}

function copyText() {
    console.log('copyText');
    navigator.clipboard.writeText(hiddenContentBlock.innerText);
}

function resetContent() {
    contentBlock.innerHTML = '';
    hiddenContentBlock.innerHTML = '';
}

async function startRequestProcess(file) {
    const mode = getMode();
    if (!mode) return;

    popupLoader.show();
    responseError.hide();

    resetContent();

    try {
        const result = await sendRequest(file, mode);
        contentBlock.innerHTML = result.data;
        hiddenContentBlock.innerHTML = result.data;

        //renderMathInElement(contentBlock);
        clearFileInput();
        popupLoader.hide();
    } catch (error) {
        console.log(error);

        popupLoader.hide();
        responseError.show();
    }
}

function initUploadBtn() {
    const btn = document.querySelector('[data-upload_btn]');
    const fileInput = document.querySelector('[data-upload_file]');

    btn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const [file] = fileInput.files;
        if (!file) return;
        startRequestProcess(file);
    });
}

function initCloseBtn() {
    const btn = document.querySelector('[data-close_btn]');

    btn.addEventListener('click', () => {
        window.close();
    });
}

function openPage(url) {
    chrome.tabs.create({url: url});
}

function initBlockSize() {
    const onResize = () => {
        if (window.innerHeight === 0) return;

        document.body.style.height = `${window.innerHeight}px`;
        const hHeader = headerBlock.clientHeight;
        const hFooter = footerBlock.clientHeight;

        const contentHeight = window.innerHeight - hHeader - hFooter;
        contentBlock.style.height = `${contentHeight}px`;

        clearInterval(intervalId);
    };

    const intervalId = setInterval(onResize, 200);

    window.onresize = onResize;
}

function initScreenshotBtn() {
    const btn = document.querySelector('[data-screenshot_btn]');
    btn.addEventListener('click', () => {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function(tabs) {
                for (let i = 0; i < tabs.length; ++i) {
                    chrome.tabs.sendMessage(tabs[i].id, { action: 'startCapture' });
                }
            }
        );
    });
}

function initCopyBtn() {
    const btn = document.querySelector('[data-copy_btn]');
    btn.addEventListener('click', () => {
        copyText();
    });
}

function dataURIToBlob(dataURI) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
}


function initOnMessage() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action === 'makeRequest') {
            const file = dataURIToBlob(message.image);
            startRequestProcess(file);
            //console.log('makeRequest', 'image', message.image);
        }
    });
}

function initDropdownLang() {
    this.levelSelect = new SearchDropdown({
        block: document.querySelector('[data-lang_select]'),
        items: [
            { name: 'English', value: 'English' },
            { name: 'Croatian', value: 'Croatian' },
            { name: 'Czech', value: 'Czech' },
            { name: 'Danish', value: 'Danish' },
            { name: 'Dutch', value: 'Dutch' },
            { name: 'Estonian', value: 'Estonian' },
            { name: 'Filipino', value: 'Filipino' },
            { name: 'Finnish', value: 'Finnish' },
            { name: 'French', value: 'French' },
            { name: 'German', value: 'German' },
            { name: 'Indonesian', value: 'Indonesian' },
            { name: 'Italian', value: 'Italian' },
            { name: 'Latvian', value: 'Latvian' },
            { name: 'Lithuanian', value: 'Lithuanian' },
            { name: 'Malay', value: 'Malay' },
            { name: 'Norwegian', value: 'orwegian' },
            { name: 'Polish', value: 'Polish' },
            { name: 'Portuguese', value: 'Portuguese' },
            { name: 'Romanian', value: 'Romanian' },
            { name: 'Russian', value: 'Russian' },
            { name: 'Slovak', value: 'Slovak' },
            { name: 'Slovenian', value: 'Slovenian' },
            { name: 'Spanish', value: 'Spanish' },
            { name: 'Swedish', value: 'Swedish' },
            { name: 'Turkish', value: 'Turkish' },
            { name: 'Vietnamese', value: 'Vietnamese' },
        ],
        active: 'English',
    });
}




async function init() {
    localize();

    const rateBlock = new RateBlock(
        document.querySelector('[data-rate_block]'),
        () => {
            openPage('https://docs.google.com/forms/d/e/1FAIpQLSfOHXmNDwTGK0-5VhoxxlIGvLxs0sw0yDruaK4v4RfSTuax2Q/viewform');
        },
        () => {
            // PAGE FEEDBACK
            openPage('https://chrome.google.com/webstore/detail/ai-math/madagoalbkmkbcgfocmiiabjfccnggpf/reviews');
        }
    );

    initUploadBtn();
    initBlockSize();
    initScreenshotBtn();
    initCopyBtn();
    initOnMessage();
    initDropdownLang();
}

init();