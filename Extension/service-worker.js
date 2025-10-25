// Helper: check if URL is blocked by calling API
async function isBlocked(url) {
  try {
    const apiUrl = `http://127.0.0.1:8000/check-url?url=${encodeURIComponent(
      url
    )}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.is_malicious;
  } catch (e) {
    console.error("Error checking URL:", e);
    return false;
  }
}

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log("Tab updated URL:", changeInfo.url);

    // store last URL per tab (optional)
    chrome.storage.local.set({ ["tab_" + tabId]: changeInfo.url });

    if (await isBlocked(changeInfo.url)) {
      console.log("Blocking:", changeInfo.url);
      // Redirect to local "blocked" page
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  }
});

// webNavigation example (finer-grained navigation events)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  console.log("Navigation committed:", details.tabId, details.url);
  if (await isBlocked(details.url)) {
    console.log("Blocking (nav event):", details.url);
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
});
