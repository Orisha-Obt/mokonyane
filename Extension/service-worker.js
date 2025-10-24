// List of blocked domains (you can extend this or make it configurable)
const blockedSites = [
  "facebook.com",
  "x.com",
  "instagram.com"
];

// Helper: check if URL matches blocked domains
function isBlocked(url) {
  try {
    const hostname = new URL(url).hostname;
    return blockedSites.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

// Listen for tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log("Tab updated URL:", changeInfo.url);

    // store last URL per tab (optional)
    chrome.storage.local.set({ ['tab_' + tabId]: changeInfo.url });

    if (isBlocked(changeInfo.url)) {
      console.log("Blocking:", changeInfo.url);
      // Redirect to local "blocked" page
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  }
});

// webNavigation example (finer-grained navigation events)
chrome.webNavigation.onCommitted.addListener(details => {
  console.log("Navigation committed:", details.tabId, details.url);
  if (isBlocked(details.url)) {
    console.log("Blocking (nav event):", details.url);
    chrome.tabs.update(details.tabId, { url: chrome.runtime.getURL("blocked.html") });
  }
});
