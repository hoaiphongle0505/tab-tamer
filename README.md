# Tab Tamer

Tab Tamer is a lightweight browser extension for turning a crowded window into a calmer workspace. It groups tabs by website, saves named snapshots locally, restores them later, and lets you search tabs already open in the current window.

## Features

- **Organize by site:** groups unpinned web tabs when at least two share a hostname. Pinned tabs and browser-internal pages are left alone.
- **Save workspaces:** store a named snapshot of the current window's web pages and restore it later. Repeated sites are grouped when restored.
- **Find a tab:** search open tab titles and URLs, then jump to a result.
- **Private by design:** workspace snapshots are stored in the browser's local extension storage. There is no account, sync service, or remote request.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Microsoft Edge.
3. Turn on **Developer mode**.
4. Choose **Load unpacked** and select the repository folder containing `manifest.json`.
5. Pin Tab Tamer from the extensions menu, then open a few tabs and click its icon.

The extension uses Manifest V3 and has no build step or external dependencies.

## Test

With Node.js 18 or newer, run the focused utility tests from the repository root:

```sh
npm test
```

For a quick manual check, open several pages from the same site, organize them, save a workspace, close a tab or two, and restore the saved workspace. Search should switch to a matching tab.

## Supported browsers

Chrome and Microsoft Edge desktop versions that support Manifest V3, `chrome.tabGroups`, and ES modules in extension popups. Firefox and Safari are not currently supported.

## Known limitations

- Tab search and organization work in the active browser window; snapshots capture its regular HTTP(S) pages only.
- Tabs requiring special permissions or unavailable browser pages, such as `chrome://` settings pages, cannot be saved or restored.
- Restore opens new tabs and can create duplicates. It does not close or replace current tabs.
- Workspaces are local to the browser profile and are not synchronized or exported.
- Organization groups identical hostnames; it does not combine related subdomains or apply a custom taxonomy.
