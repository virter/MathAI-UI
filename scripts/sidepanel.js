const popupLoader = new Loader(document.querySelector('[data-loader]'));
const responseError = new ResponseError(document.querySelector('[data-response_error]'));
const analyticsService = new AnalyticsService();
const headerBlock = document.querySelector('[data-header]');
const footerBlock = document.querySelector('[data-footer]');
const contentBlock = document.querySelector('[data-content]');
const hiddenContentBlock = document.querySelector('[data-hidden_content]');
let langSelect = null;


function localize() {
    let localizeList = document.querySelectorAll('[data-localize]');
    for (let item of localizeList) {
        const label = item.dataset['localize'];
        item.innerHTML = chrome.i18n.getMessage(label);
    }

    localizeList = document.querySelectorAll('[data-localize_placeholder]');
    for (let item of localizeList) {
        const label = item.dataset['localize_placeholder'];
        item.setAttribute('placeholder', chrome.i18n.getMessage(label));
    }
}

async function sendRequest(file, mode) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options[mode]', mode);

    const langItem = langSelect.getSelectedItem();
    formData.append('options[lang]', langItem.value);

    const url = 'https://aiwordchecker.online/api/math';

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

function initRadio() {
    for (let item of document.querySelectorAll('[name="mode"]')) {
        item.addEventListener('click', async () => {
            analyticsService.sendEvent(
                userId,
                'user_action',
                {
                    action: 'change_mode',
                    mode: item.value
                });
        })
    }
}

function clearFileInput() {
    const fileInput = document.querySelector('[data-upload_file]');
    fileInput.value = '';
}

function copyText() {
    navigator.clipboard.writeText(hiddenContentBlock.innerText);
}

function resetContent() {
    contentBlock.innerHTML = '';
    hiddenContentBlock.innerHTML = '';
}

function prepareContent(content) {
    content = content.replaceAll('\n', '<br>');
    return content;
}

async function startRequestProcess(file) {
    const mode = getMode();
    if (!mode) return;

    popupLoader.show();
    responseError.hide();

    resetContent();

    try {
        const result = await sendRequest(file, mode);

        hiddenContentBlock.innerHTML = result.data;
        //const content = prepareContent(result.data)
        const content = result.data;
        contentBlock.innerHTML = content;

        renderMathInElement(contentBlock);
        clearFileInput();
        questBlock.show();

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
        analyticsService.sendEvent(
            userId,
            'user_action',
            {
                action: 'click_upload_btn'
            });
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
        analyticsService.sendEvent(
            userId,
            'user_action',
            {
                action: 'click_screenshot_btn'
            });
    });
}

function initCopyBtn() {
    const btn = document.querySelector('[data-copy_btn]');
    btn.addEventListener('click', () => {
        copyText();
        analyticsService.sendEvent(
            userId,
            'user_action',
            {
                action: 'click_copy_btn'
            });
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
        }
    });
}

function initDropdownLang() {
    langSelect = new SearchDropdown({
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
        callback: (value) => {
            analyticsService.sendEvent(
                userId,
                'user_action',
                {
                    action: 'select_lang',
                    lang: value
                });
        }
    });
}

class QuestBlock {
    constructor(element) {
        this.element = element;
     
        this.initElements();
        this.initListeners();
    }

    initElements() {
        this.crossBtn = this.element.querySelector('[data-cross_btn]');
        
        this.yesBtn = this.element.querySelector('[data-quest_yes_btn]');
        this.noBtn = this.element.querySelector('[data-quest_no_btn]');

        this.expandBox = this.element.querySelector('[data-quest_expand_box]');
        this.expandLink = this.element.querySelector('[data-quest_exp_link]');
        this.expandReview = this.element.querySelector('[data-quest_exp_review]');
    }

    initListeners() {
        this.crossBtn.addEventListener('click', () => {
            this.hide();
        });

        this.yesBtn.addEventListener('click', () => {
            console.log('yes');
            this.expandBox.classList.remove('show-review');
            this.expandBox.classList.add('show-link');
        });

        this.noBtn.addEventListener('click', () => {
            console.log('no');
            this.expandBox.classList.remove('show-link');
            this.expandBox.classList.add('show-review');
        });
    }

    async show() {
        const d = await this.getStoreDate();
        if (d === this.getDate()) return;
        this.element.classList.add('show');
    }

    async hide() {
        await this.setStoreDate();
        this.element.classList.remove('show');
    }

    getDate() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }

    async setStoreDate() {
        const d = this.getDate();
        await chrome.storage.sync.set({
            'QuestBlockHideDate': d
        });
    }

    async getStoreDate() {
        const store = await chrome.storage.sync.get([ 'QuestBlockHideDate' ]);
        return store.QuestBlockHideDate ? store.QuestBlockHideDate : '';
    }
}



let userId = null;
let questBlock = null;

async function init() {
    userId = await getUserId();

    localize();

    const rateBlock = new RateBlock(
        document.querySelector('[data-rate_block]'),
        () => {
            openPage('https://docs.google.com/forms/d/1y8rwj2CUKDi93vHJy27qDr4NFlcYz-qeEuf63ihwrwg');
        },
        () => { 
            // PAGE FEEDBACK
            openPage('https://chrome.google.com/webstore/detail/ai-math/madagoalbkmkbcgfocmiiabjfccnggpf/reviews');
        }
    );

    questBlock = new QuestBlock(document.querySelector('[data-quest_wrap]'));

    initUploadBtn();
    initBlockSize();
    initScreenshotBtn();
    initCopyBtn();
    initOnMessage();
    initDropdownLang();
    initRadio();
}

init();