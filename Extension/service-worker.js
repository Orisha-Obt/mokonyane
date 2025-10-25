// Helper: check if URL is blocked by calling API
async function isBlocked(url) {
  try {
    // Skip checking for special URLs
    if (
      url.startsWith("about:") ||
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://")
    ) {
      console.log("Skipping special URL:", url);
      return false;
    }

    // Only check http and https URLs
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.log("Skipping non-http(s) URL:", url);
      return false;
    }

    // Remove the fragment (#) part of the URL
    const urlWithoutFragment = url.split("#")[0];

    // Properly encode the URL for the API request
    const apiUrl = new URL("http://127.0.0.1:8000/check-url");
    apiUrl.searchParams.append("url", urlWithoutFragment);

    const response = await fetch(apiUrl.toString());

    if (!response.ok) {
      console.log("API response not OK:", response.status, url);
      return false;
    }

    const data = await response.json();
    return data.is_malicious;
  } catch (e) {
    console.error("Error checking URL:", e, "URL:", url);
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
