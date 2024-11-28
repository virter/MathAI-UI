class Loader {
    constructor(block) {
        if (!block) return;
        this.block = block;
    }

    show() {
        this.block.classList.add('show');
    }

    hide() {
        this.block.classList.remove('show');
    }
}

const popupLoader = new Loader(document.querySelector('[data-loader]'));

function localize() {
    const localizeList = document.querySelectorAll('[data-localize]');
    for (let item of localizeList) {
        const label = item.dataset['localize'];
        item.innerHTML = chrome.i18n.getMessage(label);
    }
}

async function openDialog(data) {
    chrome.tabs.query(
        {
            currentWindow: true,
            active: true
        },
        async (list) => {
            const tab = list[0];
            await chrome.tabs.sendMessage(tab.id, {
                action: 'openDialog',
                details: {
                    data: data
                }
            });
        }
    );

    return true;
}

const redirectUrlList = [
    'chromewebstore.google.com'
];

function smartOpenDialog(data) {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        /*
        const url = tabs[0].url;
        if (!url) {
            //openPage(openDialogRedirectUrl);
            return;
        }

        const urlObj = new URL(url);
        if (redirectUrlList.indexOf(urlObj.host) !== -1) {
            //openPage(openDialogRedirectUrl);
            return;
        }
        */

        openDialog(data);
        return true;
    });
}

async function sendRequest(file, mode) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);


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

        try {
            popupLoader.show();

            const result = await sendRequest(file, mode);
            this.smartOpenDialog(result.data);
            window.close();

            popupLoader.hide();
            console.log('request', result);
        } catch (error) {
            popupLoader.hide();
            console.log(error);
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
    initCloseBtn();
}

init();