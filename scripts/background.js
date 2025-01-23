//post-process:import:./functions/getUuid.js
//post-process:import:./services/AnalyticsService.js
importScripts('./functions/getUuid.js'); //post-process:delete-line
importScripts('./services/AnalyticsService.js'); //post-process:delete-line\


function openPage(url) {
    chrome.tabs.create({ url: url });
}

async function setUserId(userId) {
    await chrome.storage.sync.set({
        'userId': userId
    });
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

chrome.runtime.onInstalled.addListener(async (details) => {
    setDefaults();

    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const userId = getUuid();
        await setUserId(userId);

        const analyticsService = new AnalyticsService();
        analyticsService.sendEvent(userId, 'extension_install');

        openPage('https://ai-math.pro/how-to-start/');
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        // When extension is updated
    } else if (details.reason === chrome.runtime.OnInstalledReason.CHROME_UPDATE) {
        // When browser is updated
    } else if (details.reason === chrome.runtime.OnInstalledReason.SHARED_MODULE_UPDATE) {
        // When a shared module is updated
    }
});