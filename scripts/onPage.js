window.mai = {
    components: {},
    services: {}
};

console.log(window.mai);

const onPageActions = new Map();

function openDialog(data, mode) {
    window.mai.components.dialog.show(data);
}

onPageActions.set('openDialog', (request, sender, sendResponse) => {
    const data = request.details.data ? request.details.data : '';
    const mode = request.details.mode ? request.details.mode : '';
    openDialog(data, mode);
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
    MathJax.options.enableMenu = true;
}

async function load() {
    initMathJax();
    window.mai.components.dialog = new DialogComponent();
    chrome.runtime.onMessage.addListener(onMessageHandler);
}

load();