function openPage(url) {
    chrome.tabs.create({ url: url });
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener((details) => {
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