function openPage(url) {
    window.open(url, '_blank');
}

class DialogComponent {
    constructor() {
        this.tagName = 'mai-dialog';

        this.mode = '';
        this.template = new DialogTemplate();
        this.eventService = new EventService();

        this.create();
        this.initListeners();
    }

    define() {
        if (customElements.get(this.tagName) !== undefined) return;
        customElements.define(this.tagName, class extends HTMLElement {
            connectedCallback() { }
        });
    }

    async create() {
        this.define();

        this.wrapper = createElement(
            this.tagName,
            {
                'display': 'block',
                'position': 'fixed',
                'left': '0px',
                'top': '0px',
                'transform': 'translate(1000vw, 1000vh)',
                'z-index': 10020
            }
        );
        this.shadow = this.wrapper.attachShadow({ mode: 'closed' });
        this.shadow.innerHTML += `<style>${this.template.style}</style>${this.template.html}`;

        document.body.appendChild(this.wrapper);

        await this.initElements();
    }

    async initElements() {
        this.dialog = this.shadow.querySelector('[data-dialog]');
        this.btnClose = this.shadow.querySelectorAll('[data-close_btn]');
        this.copyBtn = this.shadow.querySelector('[data-copy_btn]');
        this.content = this.shadow.querySelector('[data-content]');
        this.hiddenContent = this.shadow.querySelector('[data-hidden_content]');
        this.uploadBtn = this.shadow.querySelector('[data-upload_btn]');
        this.fileInput = this.shadow.querySelector('[data-upload_file]');

        this.loader = new Loader(this.shadow.querySelector('[data-loader]'));
        this.responseError = new ResponseError(this.shadow.querySelector('[data-response_error]'));

        this.rateBlock = new RateBlock(
            this.shadow.querySelector('[data-rate_block]'),
            () => {
                openPage('https://docs.google.com/forms/d/1y8rwj2CUKDi93vHJy27qDr4NFlcYz-qeEuf63ihwrwg/viewform');
            },
            () => {
                // PAGE FEEDBACK
                openPage('https://chrome.google.com/webstore/detail/ai-math/madagoalbkmkbcgfocmiiabjfccnggpf/reviews');
            }
        );
    }

    initListeners() {
        this.eventService.add({
            event: 'mousedown',
            element: this.btnClose,
            handler: (event) => {
                this.hide();
            }
        });

        this.eventService.add({
            event: 'mousedown',
            element: this.copyBtn,
            handler: (event) => {
                this.copyText();
            }
        });

        this.eventService.add({
            event: 'mousedown',
            element: this.uploadBtn,
            handler: (event) => {
                this.fileInput.click();
            }
        });

        this.eventService.add({
            event: 'change',
            element: this.fileInput,
            handler: (event) => {
                this.onFileChange();
            }
        });
    }

    terminateListeners() {
        this.eventService.removeAll();
    }

    destroy() {
        this.terminateListeners();
        this.wrapper.remove();
    }

    resetProperties() {
        this.initialData = '';
    }

    initContent(data = '') {
        this.initialData = data;
        if (!this.initialData) return;

        this.content.innerHTML = '';
        this.hiddenContent.innerHTML = data;
        this.content.insertAdjacentHTML('afterbegin', data);
        MathJax.typesetPromise([this.content]);
    }

    show(data, mode = 'step_by_step') {
        this.resetProperties();
        this.initContent(data);
        this.mode = mode;
        this.wrapper.style.transform = 'unset';
    }

    hide() {
        this.wrapper.style.transform = 'translate(1000vw, 1000vh)';
    }

    reset() {
        this.resetProperties();
        this.hide();
    }

    copyText() {
        navigator.clipboard.writeText(this.hiddenContent.innerText);
    }

    async sendRequest(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('options[mode]', this.mode);

        const response = await fetch('https://aiwordchecker.online/api/math', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
    
        const result = await response.json();
        return result;
    }

    clearFileInput() {
        this.fileInput.value = '';
    }

    async onFileChange() {
        const [file] = this.fileInput.files;
        if (!file) return;

        this.loader.show();
        this.responseError.hide();

        try {
            const result = await this.sendRequest(file);
            this.clearFileInput();
            this.initContent(result.data);
            console.log('request', result);

            this.loader.hide();
        } catch (error) {
            console.log(error);

            this.loader.hide();
            this.responseError.show();
        }
    }
}


class DialogTemplate {
    constructor() {
        this.style = `
:host * {
  /*
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  */
  white-space: normal;
  font-family: Arial, Helvetica;
  font-size: 16px;
  visibility: visible !important;
}

mjx-container,
mjx-container *,
math,
math * {
  font-size: 16px !important;
  line-height: 30px !important;
}

.mai_back {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(19, 19, 19, 0.9);
  overflow-y: auto;
}
.mai_back button {
  margin: unset;
  padding: unset;
  background-color: unset;
  border: unset;
}
.mai_back .dialog {
  width: 500px;
  background-color: #ffffff;
}
.mai_back .dialog .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: rgb(81, 80, 246);
}
.mai_back .dialog .header .left {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.mai_back .dialog .header .left .logo {
  width: 28px;
  height: 28px;
}
.mai_back .dialog .header .left .title {
  font-size: 18px;
  color: #ffffff;
  margin-left: 7px;
}
.mai_back .dialog .header .right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.mai_back .dialog .header .right .cross {
  width: 24px;
  height: 24px;
  cursor: pointer;
}
.mai_back .dialog .dialog-body {
  position: relative;
}
.mai_back .dialog .content-wrap {
  padding: 10px;
}
.mai_back .dialog .content-wrap .hidden-content {
  display: none;
}
.mai_back .dialog .content-wrap .content {
  padding: 20px 20px;
  font-size: 16px;
  line-height: 30px;
  overflow-y: auto;
  max-height: 200px;
}
.mai_back .dialog .content-wrap .content::-webkit-scrollbar {
  width: 5px;
}
.mai_back .dialog .content-wrap .content::-webkit-scrollbar-track {
  background: rgb(241, 241, 240);
  border-radius: 10px;
}
.mai_back .dialog .content-wrap .content::-webkit-scrollbar-thumb {
  background: rgb(191, 191, 191);
  border-radius: 10px;
}
.mai_back .dialog .content-wrap .content::-webkit-scrollbar-thumb:hover {
  background: rgb(105, 105, 105);
}
.mai_back .green-block {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 30px;
  background-color: rgb(227, 255, 234);
}
.mai_back .green-block .left {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  flex-grow: 0;
  flex-shrink: 0;
}
.mai_back .green-block .rate-block {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 50%;
  flex-grow: 0;
  flex-shrink: 0;
}
.mai_back .green-block .rate-block .text {
  font-size: 14px;
  line-height: 16.5px;
  font-weight: bold;
}
.mai_back .green-block .rate-block .star-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 3px;
}
.mai_back .green-block .rate-block .star-row .star {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
.mai_back .green-block .rate-block .star-row .star svg path {
  fill: #cfcfcf;
  transition: 0.3s;
}
.mai_back .green-block .rate-block .star-row .star.hover svg path, .mai_back .green-block .rate-block .star-row .star.active svg path {
  fill: rgb(255, 185, 33);
}
.mai_back .green-block .rate-block .star-row .star.unhover svg path {
  fill: #cfcfcf;
}
.mai_back .upload-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0px;
  width: 100%;
}
.mai_back .upload-preview img {
  -o-object-fit: contain;
     object-fit: contain;
  height: 100px;
  width: 100%;
}
.mai_back .actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px 30px;
}
.mai_back .actions .response-error {
  display: none;
  font-size: 16px;
  line-height: 18.5px;
  color: #ef5350;
  margin-bottom: 10px;
}
.mai_back .actions .response-error.show {
  display: block;
}
.mai_back .btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 13px;
  border-radius: 6px;
  background-color: rgb(81, 80, 246);
  cursor: pointer;
  transition: 0.3s;
}
.mai_back .btn:hover, .mai_back .btn:active {
  background-color: rgb(43, 43, 192);
}
.mai_back .btn .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
}
.mai_back .btn .icon svg {
  width: 19px;
  height: auto;
}
.mai_back .btn .text {
  color: #ffffff;
  font-size: 14px;
  line-height: 16.5px;
  margin-left: 5px;
}
.mai_back .btn.copy-btn {
  background-color: rgb(0, 199, 96);
}
.mai_back .btn.copy-btn:hover, .mai_back .btn.copy-btn:active {
  background-color: rgb(17, 140, 76);
}

.loader {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(19, 19, 19, 0.7);
  visibility: hidden !important;
  opacity: 0;
  transition: opacity 0.3s 0s, visibility 0s 0.3s;
}
.loader.show {
  visibility: visible !important;
  opacity: 1;
  transition: opacity 0.3s 0s, visibility 0s 0s;
}

.hidden {
  display: none;
}`;

        this.html = `
<div class="mai_back">
    <div class="dialog">
        <div class="header">
            <div class="left">
                <img class="logo" src="${getUrl('img/icons/popup_title_icon.svg')}" />
                <div class="title">${chrome.i18n.getMessage('popup_title')}</div>
            </div>

            <div class="right">
                <button
                    type="button"
                    class="cross"
                    data-close_btn
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.4 18.6538L5.34625 17.6L10.9463 12L5.34625 6.4L6.4 5.34625L12 10.9463L17.6 5.34625L18.6538 6.4L13.0538 12L18.6538 17.6L17.6 18.6538L12 13.0538L6.4 18.6538Z" fill="white"/></svg>                    
                </button>
            </div>
        </div>
        <div class="dialog-body">
            <div class="content-wrap">
                <div class="content" data-content></div>
                <div class="hidden-content" data-hidden_content></div>
            </div>
            <div class="green-block">
                <div class="left">
                    <button
                        type="button"
                        class="btn copy-btn"
                        data-copy_btn
                    >
                        <div class="icon">
                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.05775 17.9864C8.55258 17.9864 8.125 17.8114 7.775 17.4614C7.425 17.1114 7.25 16.6838 7.25 16.1786V4.79414C7.25 4.28897 7.425 3.86139 7.775 3.51139C8.125 3.16139 8.55258 2.98639 9.05775 2.98639H17.4423C17.9474 2.98639 18.375 3.16139 18.725 3.51139C19.075 3.86139 19.25 4.28897 19.25 4.79414V16.1786C19.25 16.6838 19.075 17.1114 18.725 17.4614C18.375 17.8114 17.9474 17.9864 17.4423 17.9864H9.05775ZM9.05775 16.4864H17.4423C17.5192 16.4864 17.5898 16.4543 17.6538 16.3901C17.7179 16.3261 17.75 16.2556 17.75 16.1786V4.79414C17.75 4.71714 17.7179 4.64664 17.6538 4.58264C17.5898 4.51847 17.5192 4.48639 17.4423 4.48639H9.05775C8.98075 4.48639 8.91025 4.51847 8.84625 4.58264C8.78208 4.64664 8.75 4.71714 8.75 4.79414V16.1786C8.75 16.2556 8.78208 16.3261 8.84625 16.3901C8.91025 16.4543 8.98075 16.4864 9.05775 16.4864ZM5.55775 21.4864C5.05258 21.4864 4.625 21.3114 4.275 20.9614C3.925 20.6114 3.75 20.1838 3.75 19.6786V6.79414H5.25V19.6786C5.25 19.7556 5.28208 19.8261 5.34625 19.8901C5.41025 19.9543 5.48075 19.9864 5.55775 19.9864H15.4423V21.4864H5.55775Z" fill="white"/></svg>
                        </div>
                        <div class="text">${chrome.i18n.getMessage('dialog_copy_btn')}</div>
                    </button>
                </div>
                <div class="rate-block" data-rate_block>
                    <div class="text">${chrome.i18n.getMessage('dialog_help_and_rate')}</div>
                    <div class="star-row">
                        <div class="star" data-rate_star="1">
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.04172 0.816923C8.40853 0.0736769 9.46838 0.0736789 9.83519 0.816924L11.7333 4.66287C11.8789 4.95802 12.1605 5.16259 12.4862 5.20992L16.7305 5.82664C17.5507 5.94583 17.8782 6.9538 17.2847 7.53234L14.2135 10.526C13.9778 10.7557 13.8703 11.0867 13.9259 11.4111L14.6509 15.6382C14.791 16.4551 13.9336 17.0781 13.2 16.6924L9.40379 14.6966C9.11247 14.5435 8.76444 14.5435 8.47311 14.6966L4.67693 16.6924C3.9433 17.0781 3.08587 16.4551 3.22598 15.6382L3.95099 11.4111C4.00663 11.0867 3.89908 10.7557 3.66339 10.526L0.592218 7.53233C-0.00129926 6.9538 0.326212 5.94583 1.14643 5.82664L5.39069 5.20992C5.7164 5.16259 5.99796 4.95802 6.14363 4.66287L8.04172 0.816923Z"/></svg>
                        </div>
                        <div class="star" data-rate_star="2">
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.04172 0.816923C8.40853 0.0736769 9.46838 0.0736789 9.83519 0.816924L11.7333 4.66287C11.8789 4.95802 12.1605 5.16259 12.4862 5.20992L16.7305 5.82664C17.5507 5.94583 17.8782 6.9538 17.2847 7.53234L14.2135 10.526C13.9778 10.7557 13.8703 11.0867 13.9259 11.4111L14.6509 15.6382C14.791 16.4551 13.9336 17.0781 13.2 16.6924L9.40379 14.6966C9.11247 14.5435 8.76444 14.5435 8.47311 14.6966L4.67693 16.6924C3.9433 17.0781 3.08587 16.4551 3.22598 15.6382L3.95099 11.4111C4.00663 11.0867 3.89908 10.7557 3.66339 10.526L0.592218 7.53233C-0.00129926 6.9538 0.326212 5.94583 1.14643 5.82664L5.39069 5.20992C5.7164 5.16259 5.99796 4.95802 6.14363 4.66287L8.04172 0.816923Z"/></svg>
                        </div>
                        <div class="star" data-rate_star="3">
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.04172 0.816923C8.40853 0.0736769 9.46838 0.0736789 9.83519 0.816924L11.7333 4.66287C11.8789 4.95802 12.1605 5.16259 12.4862 5.20992L16.7305 5.82664C17.5507 5.94583 17.8782 6.9538 17.2847 7.53234L14.2135 10.526C13.9778 10.7557 13.8703 11.0867 13.9259 11.4111L14.6509 15.6382C14.791 16.4551 13.9336 17.0781 13.2 16.6924L9.40379 14.6966C9.11247 14.5435 8.76444 14.5435 8.47311 14.6966L4.67693 16.6924C3.9433 17.0781 3.08587 16.4551 3.22598 15.6382L3.95099 11.4111C4.00663 11.0867 3.89908 10.7557 3.66339 10.526L0.592218 7.53233C-0.00129926 6.9538 0.326212 5.94583 1.14643 5.82664L5.39069 5.20992C5.7164 5.16259 5.99796 4.95802 6.14363 4.66287L8.04172 0.816923Z"/></svg>
                        </div>
                        <div class="star" data-rate_star="4">
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.04172 0.816923C8.40853 0.0736769 9.46838 0.0736789 9.83519 0.816924L11.7333 4.66287C11.8789 4.95802 12.1605 5.16259 12.4862 5.20992L16.7305 5.82664C17.5507 5.94583 17.8782 6.9538 17.2847 7.53234L14.2135 10.526C13.9778 10.7557 13.8703 11.0867 13.9259 11.4111L14.6509 15.6382C14.791 16.4551 13.9336 17.0781 13.2 16.6924L9.40379 14.6966C9.11247 14.5435 8.76444 14.5435 8.47311 14.6966L4.67693 16.6924C3.9433 17.0781 3.08587 16.4551 3.22598 15.6382L3.95099 11.4111C4.00663 11.0867 3.89908 10.7557 3.66339 10.526L0.592218 7.53233C-0.00129926 6.9538 0.326212 5.94583 1.14643 5.82664L5.39069 5.20992C5.7164 5.16259 5.99796 4.95802 6.14363 4.66287L8.04172 0.816923Z"/></svg>
                        </div>
                        <div class="star" data-rate_star="5">
                            <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.04172 0.816923C8.40853 0.0736769 9.46838 0.0736789 9.83519 0.816924L11.7333 4.66287C11.8789 4.95802 12.1605 5.16259 12.4862 5.20992L16.7305 5.82664C17.5507 5.94583 17.8782 6.9538 17.2847 7.53234L14.2135 10.526C13.9778 10.7557 13.8703 11.0867 13.9259 11.4111L14.6509 15.6382C14.791 16.4551 13.9336 17.0781 13.2 16.6924L9.40379 14.6966C9.11247 14.5435 8.76444 14.5435 8.47311 14.6966L4.67693 16.6924C3.9433 17.0781 3.08587 16.4551 3.22598 15.6382L3.95099 11.4111C4.00663 11.0867 3.89908 10.7557 3.66339 10.526L0.592218 7.53233C-0.00129926 6.9538 0.326212 5.94583 1.14643 5.82664L5.39069 5.20992C5.7164 5.16259 5.99796 4.95802 6.14363 4.66287L8.04172 0.816923Z"/></svg>
                        </div>
                    </div>
                </div>
            </div>
            <div class="actions">
                <input
                    type="file"
                    class="hidden"
                    data-upload_file
                />
                <div
                    class="response-error"
                    data-response_error
                >${chrome.i18n.getMessage('dialog_internal_error')}</div>
                <button
                    type="button"
                    class="btn upload-btn"
                    data-upload_btn
                >
                    <div class="icon">
                        <svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.35575 12.3118C4.73175 12.3118 3.34983 11.7467 2.21 10.6165C1.07 9.48652 0.5 8.11094 0.5 6.48977C0.5 4.8686 1.07 3.49135 2.21 2.35802C3.34983 1.22469 4.73175 0.65802 6.35575 0.65802H15.3462C16.5001 0.65802 17.4808 1.05869 18.2885 1.86002C19.0962 2.66119 19.5 3.63869 19.5 4.79252C19.5 5.94635 19.0962 6.92394 18.2885 7.72527C17.4808 8.5266 16.5001 8.92727 15.3462 8.92727H6.8365C6.15967 8.92727 5.58183 8.69144 5.103 8.21977C4.62417 7.74827 4.38475 7.1736 4.38475 6.49577C4.38475 5.81794 4.6225 5.2396 5.098 4.76077C5.5735 4.28194 6.153 4.04252 6.8365 4.04252H15.6152V5.54252H6.8365C6.5685 5.54252 6.34283 5.6326 6.1595 5.81277C5.97617 5.99294 5.8845 6.21694 5.8845 6.48477C5.8845 6.75277 5.97617 6.97685 6.1595 7.15702C6.34283 7.33719 6.5685 7.42727 6.8365 7.42727H15.3558C16.0942 7.41694 16.7196 7.16044 17.2318 6.65777C17.7439 6.1551 18 5.53335 18 4.79252C18 4.05485 17.7423 3.43135 17.227 2.92202C16.7115 2.41269 16.0846 2.15802 15.3462 2.15802H6.35575C5.14675 2.14769 4.11858 2.5656 3.27125 3.41177C2.42375 4.25794 2 5.2851 2 6.49327C2 7.68427 2.42375 8.69669 3.27125 9.53052C4.11858 10.3642 5.14675 10.7913 6.35575 10.8118H15.6152V12.3118H6.35575Z" fill="#ffffff"/></svg>
                    </div>
                    <div class="text">${chrome.i18n.getMessage('dialog_upload_btn')}</div>
                </button>
            </div>
            <div class="loader" data-loader>
                <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 24 24"><g><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.14"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.29" transform="rotate(30 12 12)"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.43" transform="rotate(60 12 12)"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.57" transform="rotate(90 12 12)"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.71" transform="rotate(120 12 12)"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" opacity="0.86" transform="rotate(150 12 12)"/><rect width="2" height="5" x="11" y="1" fill="#ffffff" transform="rotate(180 12 12)"/><animateTransform attributeName="transform" calcMode="discrete" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12"/></g></svg>
            </div>
        </div>
    </div>
</div>`;
    }
}