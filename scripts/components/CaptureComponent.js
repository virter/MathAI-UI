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

        console.log('onMouseDown', this.startPoint);
    }

    onMouseMove(event) {
        if (!this.captureMove) return;

        this.endPoint.x = event.clientX;
        this.endPoint.y = event.clientY;
        const cssPolygon = this.getPolygon(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
        this.screen.style['clip-path'] = cssPolygon;
    }

    getCanvasRatio(canvas) {
        const realWidth = canvas.width;
        const styleWidth = parseInt(canvas.style.width);
        if (!realWidth || !styleWidth) return false;

        return realWidth/styleWidth;
    }

    async onMouseUp(event) {
        this.captureMove = false;

        const resPoint1 = { x: this.startPoint.x, y: this.startPoint.y };
        const resPoint2 = { x: event.clientX, y: event.clientY };
        //console.log('onMouseUp', event.clientX, event.clientY);

        this.startPoint.x = -1;
        this.startPoint.y = -1;
        this.endPoint.x = -1;
        this.endPoint.y = -1;
        this.screen.style['clip-path'] = 'unset';

        //console.log('result', screenshotData.image);

        /*
        const bodyOffset = document.body.getBoundingClientRect();
        const x1 = resPoint1.x - bodyOffset.x;
        const y1 = resPoint1.y - bodyOffset.y;
        const x2 = resPoint2.x  - bodyOffset.x;
        const y2 = resPoint2.y  - bodyOffset.y;
        */

        const x1 = resPoint1.x;
        const y1 = resPoint1.y;
        const x2 = resPoint2.x;
        const y2 = resPoint2.y;

        this.hide();

        const screenshotData = await chrome.runtime.sendMessage({ action: 'makeScreenshot' });
        const cropImage = await this.cropImage(screenshotData.image, x1, y1, x2, y2);

        chrome.runtime.sendMessage({
            action: 'makeRequest',
            image: cropImage
        });
        /*
        //DEBUG
        const image = new Image();
        image.setAttribute('width', `auto`);
        image.setAttribute('height', `auto`);
        image.src = cropImage;
        document.body.appendChild(image);
        console.log(image);
        //image.remove();

        const div = document.createElement('div');
        div.setAttribute('style', `top:${y1}px;left:${x1}px;width:${x2 - x1}px;height:${y2 - y1}px;position:fixed;border:unset!important;
            border-radius:unset!important;padding:0px!important;margin:0px!important;background-color:rgba(255, 0, 0, 0.3);`);
        document.body.appendChild(div);
        setTimeout(() => { div.remove(); }, 5000);
        */
    }

    transformCoord(coord, ratio) {
        return Math.round(coord*ratio);
    }

    cropImage(imageData, x1, y1, x2, y2) {
        return new Promise(resolve => {
            const image = new Image();
            image.setAttribute('width', `auto`);
            image.setAttribute('height', `auto`);
            image.onload = () => {
                //console.log('onload', image, image.width, image.height);

                const ratio = image.width/window.innerWidth;

                const maxWidth = image.width;
                const maxHeight = image.height;
                console.log('onload', window.innerWidth, window.innerHeight, 'maxWidth', maxWidth, 'maxHeight', maxHeight);

                x1 = this.transformCoord(x1, ratio);
                y1 = this.transformCoord(y1, ratio);
                x2 = this.transformCoord(x2, ratio);
                y2 = this.transformCoord(y2, ratio);

                const sx = x1 < 0 ? 0 : x1;
                const sy = y1 < 0 ? 0 : y1;
                const sx2 = x2 > maxWidth ? maxWidth : x2;
                const sy2 = y2 > maxHeight ? maxHeight : y2;
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

                const resultImage = canvasTarget.toDataURL();

                resolve(resultImage);
            };

            image.src = imageData;
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
        <!--
        <div class="mai_tip">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="mr-1 inline-block" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            <span><b>Ctrl&nbsp;+&nbsp;Shift&nbsp;+&nbsp;S</b></span>
        </div>
        -->
    </div>
</div>`;
    }
}