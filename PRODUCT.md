# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
People who tend to keep too many browser tabs open and need to find, sort, or return to a set of pages.

## Product Purpose
Tab Tamer helps people organize the tabs in their current browser window, save a named snapshot of useful pages, restore a snapshot later, and quickly locate an open tab.

## Positioning
A lightweight browser extension that performs tab organization and workspace snapshots locally in the browser, without an account or remote service.

## Operating Context
Users open the extension popup while browsing in Chrome or Microsoft Edge. They may group same-site tabs, search a tab by its title or URL, or save and later restore a named set of web pages.

## Capabilities and Constraints
- Uses browser tab groups to group unpinned tabs by hostname when multiple tabs share a site.
- Saves and restores HTTP(S) page URLs in the active window.
- Searches open tabs by title and URL.
- Workspace data remains in local extension storage; no cloud sync or remote requests.
- Manifest V3 extension for Chrome and Edge desktop; Firefox and Safari support are not established.
- Snapshot restore opens new tabs and does not replace or close current tabs.

## Product Principles
- Make common tab actions quick and reversible where practical.
- Keep saved workspaces local and user-controlled.
- Leave pinned tabs and browser-internal pages untouched.
- Report partial failures honestly instead of hiding them.

## Evidence on Hand
The repository contains the implementation and manual installation guidance. No customer research, testimonials, or performance claims were supplied.
