window.mai = {
    components: {},
    services: {}
};

const onPageActions = new Map();

function showCapture() {
    window.mai.components.capture.show();
}

onPageActions.set('startCapture', (request) => {
    showCapture();
    return true;
});

function onMessageHandler(request, sender, sendResponse) {
    if (!onPageActions.has(request.action)) {
        return false;
    }

    const callback = onPageActions.get(request.action);
    callback(request);

    sendResponse({ received: true });
    return true;
}

function initShortcut() {
    document.addEventListener('keydown', (event) => {
        if (!(
                event.ctrlKey === true
                && event.shiftKey === true
                && event.key.toLowerCase() === 'f'
        )) return;

        if (window.mai.components.capture.visible) return;

        showCapture();
    })
}

async function load() {
    window.mai.components.capture = new CaptureComponent();

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        return onMessageHandler(request, sender, sendResponse);
    });
    initShortcut();
}

load();