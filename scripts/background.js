function openPage(url) {
    chrome.tabs.create({ url: url });
}

function setDefaults() {
    chrome.runtime.setUninstallURL('https://docs.google.com/forms/d/1y8rwj2CUKDi93vHJy27qDr4NFlcYz-qeEuf63ihwrwg');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'makeScreenshot') {
        (async () => {
            await chrome.tabs.captureVisibleTab(
                null,
                { format: 'png' },
                (dataUrl) => {
                    sendResponse({ image: dataUrl });
                }
            )

        })();

        return true;
    }
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener((details) => {
    setDefaults();

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        openPage('https://ai-math.pro/how-to-start/');
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        // When extension is updated
    } else if (details.reason === chrome.runtime.OnInstalledReason.CHROME_UPDATE) {
        // When browser is updated
    } else if (details.reason === chrome.runtime.OnInstalledReason.SHARED_MODULE_UPDATE) {
        // When a shared module is updated
    }
});