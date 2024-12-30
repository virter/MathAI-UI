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


    const response = await fetch('https://aiwordchecker.online/api/math', {
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

function initUploadBtn() {
    const btn = document.querySelector('[data-upload_btn]');
    const fileInput = document.querySelector('[data-upload_file]');

    btn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
        const [file] = fileInput.files;

        if (!file) return;

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
    //initScreenshotBtn();
    initCopyBtn();
}

init();