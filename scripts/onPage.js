window.mai = {
    components: {},
    services: {}
};

const onPageActions = new Map();

function openDialog(data = '') {
    window.mai.components.dialog.show(data);
}

onPageActions.set('openDialog', (request, sender, sendResponse) => {
    const data = request.details.data ? request.details.data : '';
    openDialog(data);
    sendResponse(true);
    return true;
});

function onMessageHandler(request, sender, sendResponse) {
    if (!onPageActions.has(request.action)) return false;
    const callback = onPageActions.get(request.action);
    callback(request, sender, sendResponse);
    return true;
}

function initMathJax() {
    if (!MathJax) return;
    console.log('MathJax', MathJax);

    MathJax.options.enableMenu = true;
}

async function load() {
    initMathJax();
    window.mai.components.dialog = new DialogComponent();
    chrome.runtime.onMessage.addListener(onMessageHandler);
}

load();