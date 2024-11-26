function openPage(url) {
    window.open(url, '_blank');
}

class DialogComponent {
    constructor() {
        this.tagName = 'sew-dialog';

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
/*
    async initLangDropdown() {
        const store = await chrome.storage.local.get(['languageList', 'language']);
        if (!('languageList' in store)) return;

        const items = store.languageList.map(item => {
            return {
                name: item.name,
                value: item.code
            };
        });

        
        this.customerRatingSelect = new SearchDropdown({
            block: this.shadow.querySelector('[data-customer_rating_select]'),
            items: [
                { name: '1 star', value: '1_star' },
                { name: '2 stars', value: '2_stars' },
                { name: '3 stars', value: '3_stars' },
                { name: '4 stars', value: '4_stars' },
                { name: '5 stars', value: '5_stars' },
            ],
            active: 'none',
        });

        this.toneSelect = new SearchDropdown({
            block: this.shadow.querySelector('[data-tone_select]'),
            items: [
                { name: 'friendly', value: 'friendly' },
                { name: 'official', value: 'official' }
            ],
            active: 'classic',
        });

        this.lengthSelect = new SearchDropdown({
            block: this.shadow.querySelector('[data-length_select]'),
            items: [
                { name: 'short', value: 'short' },
                { name: 'medium', value: 'medium' },
                { name: 'long', value: 'long' },
            ],
            active: 'classic',
        });



        const activeLanguage = 'language' in store ? store.language : null;

        this.languageSelect = new SearchDropdown({
            block: this.shadow.querySelector('[data-language_select]'),
            items: items,
            active: activeLanguage,
            handlers: {
                onChange: (data) => {
                    chrome.runtime.sendMessage({
                        action: 'setLanguage',
                        language: data.value
                    });
                }
            }
        });
    }
*/
    async initElements() {
        this.dialog = this.shadow.querySelector('[data-dialog]');
        this.btnClose = this.shadow.querySelectorAll('[data-close_btn]');
        this.content = this.shadow.querySelector('[data-content]');

        this.rateBlock = new RateBlock(
            this.shadow.querySelector('[data-rate_block]'),
            () => {
                openPage('https://docs.google.com/forms/d/e/1FAIpQLSfOHXmNDwTGK0-5VhoxxlIGvLxs0sw0yDruaK4v4RfSTuax2Q/viewform');
            },
            () => {
                // PAGE FEEDBACK
                openPage('https://chrome.google.com/webstore/detail/ai-essay-writer/blcamfmkmjdbigcliokaebahmolamlfp/reviews');
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
        this.content.insertAdjacentHTML('afterbegin', data);
        MathJax.typesetPromise([this.content]);
    }

    show(data) {
        this.resetProperties();
        this.initContent(data);
        this.wrapper.style.transform = 'unset';
    }

    hide() {
        this.wrapper.style.transform = 'translate(1000vw, 1000vh)';
    }

    reset() {
        this.resetProperties();
        this.hide();
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

math {
    margin-top: 7px!important;
    margin-bottom: 7px!important;
}

.mai_back {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(19, 19, 19, 0.7);
  overflow-y: auto;
}
.mai_back button {
  margin: unset;
  padding: unset;
  background-color: unset;
  border: unset;
}
.mai_back .dialog {
  width: 370px;
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
.mai_back .dialog .content-wrap {
  padding: 10px;
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
  justify-content: center;
  align-items: center;
  padding: 15px 30px;
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
        <div class="content-wrap">
            <div class="content" data-content></div>
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
    </div>
</div>`;
        /*
        <div class="arg_dialog" data-dialog>
            <div class="arg_header">
                <span>${chrome.i18n.getMessage('dialog_title')}</span>
                <button class="arg_close" data-btn_close>
                    <svg viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 1.00714L8.99286 0L5 3.99286L1.00714 0L0 1.00714L3.99286 5L0 8.99286L1.00714 10L5 6.00714L8.99286 10L10 8.99286L6.00714 5L10 1.00714Z" fill="#8288C3"/></svg>
                </button>
            </div>
            <div class="arg_dialog-body">
                <div class="arg_dialog-intro">${chrome.i18n.getMessage('intro_text')}</div>
                <div class="arg_input-group arg_group-row">
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('customer_name')}<!--<div class="arg_requirement-label">*</div>--></div>
                        <input class="arg_input arg_wide" placeholder="${chrome.i18n.getMessage('customer_name')}" data-prop="options" data-field="customer_name"/>
                    </div>
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('customer_rating')}</div>
                        <div class="arg_select arg_wide" data-customer_rating_select>
                            <input type="text" class="arg_select-input" placeholder="${chrome.i18n.getMessage('customer_rating')}" data-dropdown_input data-prop="options" data-field="customer_rating" />
                            <div class="arg_select-list" data-dropdown_block>
                                <div class="arg_item-active hidden" data-active_item>
                                    <span data-active_item_label></span>
                                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4.99664L5.99999 12.9966L2.33333 9.32997L3.27333 8.38997L5.99999 11.11L13.06 4.05664L14 4.99664Z" fill="#00C94C"/></svg>
                                </div>
                                <div class="arg_list-body" data-dropdown_list></div>
                            </div>
                            <div class="arg_select-arrow">
                                <svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4.71609 5.37622L9.04622 0.126221H0.385968L4.71609 5.37622Z' fill='#C4CBEB'/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="arg_input-group arg_group-row">
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('text_language')}<div class="arg_requirement-label">*</div></div>
                        <div class="arg_select arg_wide" data-language_select>
                            <input type="text" class="arg_select-input" placeholder="${chrome.i18n.getMessage('language')}" data-dropdown_input data-prop="options" data-field="lang" />
                            <div class="arg_select-list" data-dropdown_block>
                                <div class="arg_item-active hidden" data-active_item>
                                    <span data-active_item_label></span>
                                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4.99664L5.99999 12.9966L2.33333 9.32997L3.27333 8.38997L5.99999 11.11L13.06 4.05664L14 4.99664Z" fill="#00C94C"/></svg>
                                </div>
                                <div class="arg_list-body" data-dropdown_list></div>
                            </div>
                            <div class="arg_select-arrow">
                                <svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4.71609 5.37622L9.04622 0.126221H0.385968L4.71609 5.37622Z' fill='#C4CBEB'/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('tone')}<div class="arg_requirement-label">*</div></div>
                        <div class="arg_select arg_wide" data-tone_select>
                            <input type="text" class="arg_select-input" placeholder="${chrome.i18n.getMessage('tone')}" data-dropdown_input data-prop="options" data-field="tone" />
                            <div class="arg_select-list" data-dropdown_block>
                                <div class="arg_item-active hidden" data-active_item>
                                    <span data-active_item_label></span>
                                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4.99664L5.99999 12.9966L2.33333 9.32997L3.27333 8.38997L5.99999 11.11L13.06 4.05664L14 4.99664Z" fill="#00C94C"/></svg>
                                </div>
                                <div class="arg_list-body" data-dropdown_list></div>
                            </div>
                            <div class="arg_select-arrow">
                                <svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4.71609 5.37622L9.04622 0.126221H0.385968L4.71609 5.37622Z' fill='#C4CBEB'/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="arg_input-group arg_group-row">
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('length')}<div class="arg_requirement-label">*</div></div>
                        <div class="arg_select arg_wide" data-length_select>
                            <input type="text" class="arg_select-input" placeholder="${chrome.i18n.getMessage('length')}" data-dropdown_input data-prop="options" data-field="text_length" />
                            <div class="arg_select-list" data-dropdown_block>
                                <div class="arg_item-active hidden" data-active_item>
                                    <span data-active_item_label></span>
                                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4.99664L5.99999 12.9966L2.33333 9.32997L3.27333 8.38997L5.99999 11.11L13.06 4.05664L14 4.99664Z" fill="#00C94C"/></svg>
                                </div>
                                <div class="arg_list-body" data-dropdown_list></div>
                            </div>
                            <div class="arg_select-arrow">
                                <svg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M4.71609 5.37622L9.04622 0.126221H0.385968L4.71609 5.37622Z' fill='#C4CBEB'/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('keywords')}</div>
                        <input class="arg_input arg_wide" placeholder="${chrome.i18n.getMessage('keywords_placeholder')}" data-prop="options" data-field="keywords"/>
                    </div>
                </div>
                <div class="arg_input-group arg_group-row">
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('optional_details')}</div>
                        <input class="arg_input arg_wide" placeholder="${chrome.i18n.getMessage('optional_details_placeholder')}" data-prop="options" data-field="optional_details"/>
                    </div>
                    <div class="arg_row-cell">
                        <div class="arg_label">${chrome.i18n.getMessage('details_about_bussiness')}</div>
                        <input class="arg_input arg_wide" placeholder="${chrome.i18n.getMessage('details_about_bussiness_placeholder')}" data-prop="options" data-field="details_about_bussiness"/>
                    </div>
                </div>
                <div class="arg_input-group arg_wide">
                    <div class="arg_label">${chrome.i18n.getMessage('user_review_text')}</div>
                    <textarea class="arg_textarea arg_textarea-description arg_scrollbar" placeholder="${chrome.i18n.getMessage('user_review_text')}" data-prop="options" data-field="user_review_text"></textarea>
                </div>
                <div class="arg_input-group small-top-margin">
                    <button class="arg_action-btn arg_send-btn" data-send_btn>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2841_2)"><path d="M5.00012 3.73337L3.33346 4.66671L4.26679 3.00004L3.33346 1.33337L5.00012 2.26671L6.66679 1.33337L5.73346 3.00004L6.66679 4.66671L5.00012 3.73337ZM13.0001 10.2667L14.6668 9.33337L13.7335 11L14.6668 12.6667L13.0001 11.7334L11.3335 12.6667L12.2668 11L11.3335 9.33337L13.0001 10.2667ZM14.6668 1.33337L13.7335 3.00004L14.6668 4.66671L13.0001 3.73337L11.3335 4.66671L12.2668 3.00004L11.3335 1.33337L13.0001 2.26671L14.6668 1.33337ZM8.89346 8.52004L10.5201 6.89337L9.10679 5.48004L7.48012 7.10671L8.89346 8.52004ZM9.58012 4.86004L11.1401 6.42004C11.4001 6.66671 11.4001 7.10004 11.1401 7.36004L3.36012 15.14C3.10012 15.4 2.66679 15.4 2.42012 15.14L0.860123 13.58C0.600123 13.3334 0.600123 12.9 0.860123 12.64L8.64012 4.86004C8.90012 4.60004 9.33346 4.60004 9.58012 4.86004Z" fill="white"></path></g><defs><clipPath id="clip0_2841_2"><rect width="16" height="16" fill="white"></rect></clipPath></defs></svg>
                        <span>${chrome.i18n.getMessage('generate_response')}</span>
                    </button>
                </div>
                <div class="arg_submit-description" data-send_description>${chrome.i18n.getMessage('send_description')}</div>

                <div class="arg_input-group arg_wide arg_result-group">
                    <div class="arg_label">${chrome.i18n.getMessage('ai_response')}</div>
                    <div class="arg_result-text arg_scrollbar" data-result_text></div>
                    <div class="arg_highlight-text arg_scrollbar" data-highlight_text></div>
                    <div class="arg_rate-line hidden" data-rate_line>
                        <span>${chrome.i18n.getMessage('like_extension')}</span>
                        <div class="arg_rate-block" data-rate_block>
                            <button class="arg_rate-star" data-rate_star="1"></button>
                            <button class="arg_rate-star" data-rate_star="2"></button>
                            <button class="arg_rate-star" data-rate_star="3"></button>
                            <button class="arg_rate-star" data-rate_star="4"></button>
                            <button class="arg_rate-star" data-rate_star="5"></button>
                        </div>
                    </div>
                    <div class="arg_result-controls">
                        <div class="arg_tip-wrap">
                            <button class="arg_action-btn arg_green-btn arg_copy-btn" data-copy_btn>
                                <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.6667 14.5286H5.33334V5.19531H12.6667M12.6667 3.86198H5.33334C4.97971 3.86198 4.64058 4.00245 4.39053 4.2525C4.14048 4.50255 4 4.84169 4 5.19531V14.5286C4 14.8823 4.14048 15.2214 4.39053 15.4715C4.64058 15.7215 4.97971 15.862 5.33334 15.862H12.6667C13.0203 15.862 13.3594 15.7215 13.6095 15.4715C13.8595 15.2214 14 14.8823 14 14.5286V5.19531C14 4.84169 13.8595 4.50255 13.6095 4.2525C13.3594 4.00245 13.0203 3.86198 12.6667 3.86198ZM10.6667 1.19531H2.66667C2.31305 1.19531 1.97391 1.33579 1.72386 1.58584C1.47381 1.83589 1.33334 2.17502 1.33334 2.52865V11.862H2.66667V2.52865H10.6667V1.19531Z" fill="white"/></svg>                    
                                <span>${chrome.i18n.getMessage('copy_text')}</span>
                            </button>
                            <div class="arg_copy-tip" data-copy_tip>${chrome.i18n.getMessage('text_coppied')}</div>
                        </div>
                        <!--
                        <button class="arg_outline-btn" data-highlight_btn>
                            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2839_137)"><path d="M1.14519 8.23808H3.14519V9.57141H1.14519V8.23808ZM13.2119 3.23808L11.8119 4.63808L12.7452 5.57141L14.1452 4.17141L13.2119 3.23808ZM7.81185 1.57141H9.14519V3.57141H7.81185V1.57141ZM3.74519 3.23808L2.81185 4.17141L4.21185 5.57141L5.14519 4.63808L3.74519 3.23808ZM7.14519 15.5714C7.14519 15.9714 7.41185 16.2381 7.81185 16.2381H9.14519C9.54519 16.2381 9.81185 15.9714 9.81185 15.5714V14.9047H7.14519V15.5714ZM8.47852 4.90474C6.27852 4.90474 4.47852 6.70474 4.47852 8.90474C4.47852 10.3714 5.27852 11.7047 6.47852 12.3714V13.5714C6.47852 13.9714 6.74519 14.2381 7.14519 14.2381H9.81185C10.2119 14.2381 10.4785 13.9714 10.4785 13.5714V12.3714C11.6785 11.7047 12.4785 10.3714 12.4785 8.90474C12.4785 6.70474 10.6785 4.90474 8.47852 4.90474ZM9.14519 11.5047V12.2381H7.81185V11.5047C6.67852 11.2381 5.81185 10.1714 5.81185 8.90474C5.81185 7.43808 7.01185 6.23808 8.47852 6.23808C9.94519 6.23808 11.1452 7.43808 11.1452 8.90474C11.1452 10.1714 10.2785 11.1714 9.14519 11.5047ZM13.8119 8.23808H15.8119V9.57141H13.8119V8.23808Z" fill="#9297CA"/></g><defs><clipPath id="clip0_2839_137"><rect width="16" height="16" fill="white" transform="translate(0.478516 0.904785)"/></clipPath></defs></svg>                        
                            <span>${chrome.i18n.getMessage('highlight_changes')}</span>
                        </button>
                        -->
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    */
    }
}