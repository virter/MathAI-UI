async function getUserId() {
    const store = await chrome.storage.sync.get(['userId']);
    return 'userId' in store ? store['userId'] : null;
}