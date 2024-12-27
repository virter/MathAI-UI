class CaptureComponent {
    constructor() {
        this.tagName = 'mai-capture';

        this.template = new CaptureTemplate();
        this.eventService = new EventService();

        this.captureMove = false; 
        this.startPoint = { x: -1, y: -1 };
        this.endPoint = { x: -1, y: -1 };

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
                'z-index': 2147483647
            }
        );
        this.shadow = this.wrapper.attachShadow({ mode: 'closed' });
        this.shadow.innerHTML += `<style>${this.template.style}</style>${this.template.html}`;

        document.body.appendChild(this.wrapper);

        await this.initElements();
    }

    async initElements() {
        this.screen = this.shadow.querySelector('[data-screen]');
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

        this.eventService.add({
            event: 'mousedown',
            element: document,
            handler: (event) => {
                this.onMouseDown(event);
            }
        });

        this.eventService.add({
            event: 'mousemove',
            element: document,
            handler: (event) => {
                this.onMouseMove(event);
            }
        });

        this.eventService.add({
            event: 'mouseup',
            element: document,
            handler: (event) => {
                this.onMouseUp(event);
            }
        });
    }

    onMouseDown(event) {
        this.captureMove = true;

        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;
    }

    onMouseMove(event) {
        if (!this.captureMove) return;

        this.endPoint.x = event.clientX;
        this.endPoint.y = event.clientY;
        const cssPolygon = this.getPolygon(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
        this.screen.style['clip-path'] = cssPolygon;
    }

    onMouseUp(event) {
        this.captureMove = false;

        const resPoint1 = { x: this.startPoint.x, y: this.startPoint.y };
        const resPoint2 = { x: event.clientX, y: event.clientY };

        this.startPoint.x = -1;
        this.startPoint.y = -1;
        this.endPoint.x = -1;
        this.endPoint.y = -1;
        this.screen.style['clip-path'] = 'unset';

        html2canvas(document.body)
            .then(async canvas => {
                const scaledCanvas = await this.scaleCanvas(canvas, document.body.offsetWidth);
                const result = await this.cropCanvas(scaledCanvas, resPoint1.x, resPoint1.y, resPoint2.x, resPoint2.y);
                console.log(result);
            });

        console.log('onMouseUp', resPoint1, resPoint2);
    }

    scaleCanvas(canvas, width) {
        return new Promise(resolve => {
            const imageWidth = canvas.width;
            const imageHeight = canvas.height;

            const image = new Image();
            image.setAttribute('width', `${imageWidth}px`);
            image.setAttribute('height', `${imageHeight}px`);

            image.onload = () => {
                const sx = 0;
                const sy = 0;
                const sWidth = imageWidth;
                const sHeight = imageHeight;

                const dx = 0;
                const dy = 0;
                const dWidth = width;
                const dHeight = Math.round(width*imageHeight/imageWidth);

                const canvasTarget = document.createElement('canvas');
                canvasTarget.setAttribute('width', `${dWidth}px`);
                canvasTarget.setAttribute('height', `${dHeight}px`);
                const ctxTarget = canvasTarget.getContext("2d");
                ctxTarget.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                image.remove();
                
                resolve(canvasTarget);
            };

            image.src = canvas.toDataURL();
            canvas.remove();
        });
    }

    cropCanvas(canvas, x1, y1, x2, y2) {
        return new Promise(resolve => {
            const image = new Image();
            image.setAttribute('width', `${canvas.width}px`);
            image.setAttribute('height', `${canvas.height}px`);
            image.onload = () => {
                const sx = x1;
                const sy = y1;
                const sx2 = x2;
                const sy2 = y2;
                const sWidth = sx2 - sx;
                const sHeight = sy2 - sy;

                const dx = 0;
                const dy = 0;
                const dWidth = sWidth;
                const dHeight = sHeight;

                const canvasTarget = document.createElement('canvas');
                canvasTarget.setAttribute('width', `${dWidth}px`);
                canvasTarget.setAttribute('height', `${dHeight}px`);

                const ctxTarget = canvasTarget.getContext("2d");
                ctxTarget.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                image.remove();

                
                const resultImage = canvasTarget.toDataURL();
                canvasTarget.remove();

                resolve(resultImage);
            };

            image.src = canvas.toDataURL();
            canvas.remove();
        });
    }
    
    getPolygon(x1, y1, x2, y2) {
        return `polygon(0% 0%, 0% 100%, ${x1}px 100%, ${x1}px ${y1}px, ${x2}px ${y1}px, ${x2}px ${y2}px, ${x1}px ${y2}px, ${x1}px 100%, 100% 100%, 100% 0%)`;
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
  color: #ffffff;
  position: relative;
}
.mai_screen-capture .mai_tip-row {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translate(-50%, 0px);
}
.mai_screen-capture .mai_tip-row .mai_tip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 5px;
  background-color: rgb(71, 70, 191);
  white-space: nowrap;
  font-size: 17px;
  line-height: 19.5px;
  margin: 5px;
}
.mai_screen-capture .mai_tip-row .mai_tip svg {
  margin-right: 3px;
}
.mai_screen-capture .mai_tip-row .mai_tip > * {
  white-space: nowrap;
}
.mai_screen-capture .mai_tip-row .mai_tip > * > * {
  white-space: nowrap;
}/*# sourceMappingURL=capture.css.map */`;

        this.html = `
<div class="mai_screen-capture" data-screen>
    <div class="mai_tip-row">
        <div class="mai_tip">
            <span><b>Screenshot Mode Enabled</b>, click on page and drag to select <b>one question</b></span>
        </div>
        <div class="mai_tip">
            <span>Use <b> Esc </b> to exit</span>
        </div>
        <div class="mai_tip">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="mr-1 inline-block" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            <span><b>Ctrl&nbsp;+&nbsp;Shift&nbsp;+&nbsp;S</b></span>
        </div>
    </div>
</div>`;
    }
}