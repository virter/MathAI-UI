class CaptureComponent {
    constructor() {
        this.tagName = 'mai-capture';

        this.template = new CaptureTemplate();
        this.eventService = new EventService();

        this.create();
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
                'width': '100%',
                'height': '100%',
                'transform': 'translate(1000vw, 1000vh) scale(0, 0)',
                'z-index': 10020
            }
        );
        this.shadow = this.wrapper.attachShadow({ mode: 'closed' });
        this.shadow.innerHTML += `<style>${this.template.style}</style>${this.template.html}`;

        document.body.appendChild(this.wrapper);

        await this.initElements();
    }

    async initElements() {
    }

    initListeners() {
        this.eventService.add({
            event: 'keydown',
            element: document,
            handler: (event) => {
                if (event.key.toLowerCase() !== 'escape') return;
                this.hide();
            }
        });

        return;

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

    show() {
        this.initListeners();
        this.wrapper.style.transform = 'unset';
    }

    hide() {
        this.terminateListeners();
        this.wrapper.style.transform = 'translate(1000vw, 1000vh) scale(0, 0)';
    }
}


class CaptureTemplate {
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

.mai_screen-capture {
  display: block;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
}/*# sourceMappingURL=capture.css.map */`;

        this.html = `
<div class="mai_screen-capture">
      Aboba
</div>`;
    }
}