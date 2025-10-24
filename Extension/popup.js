async function showActiveTabUrl() {
  // Query active tab in current window
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs || tabs.length === 0) {
    document.getElementById('url').textContent = 'No active tab found';
    return;
  }
  const tab = tabs[0];
  // tab.url is available if extension has permission to access this tab
  document.getElementById('url').textContent = tab.url || 'URL not available';
  document.getElementById('copy').onclick = () => {
    navigator.clipboard.writeText(tab.url || '').then(() => {
      document.getElementById('copy').textContent = 'Copied!';
      setTimeout(() => document.getElementById('copy').textContent = 'Copy URL', 1200);
    });
  };
}

// run when popup opens
showActiveTabUrl();
