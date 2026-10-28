import { formatSite, groupTabsBySite, isRestorableUrl, matchesTab } from "./src/tab-utils.mjs";

const $ = (selector) => document.querySelector(selector);
const tabCount = $("#tab-count");
const tabCountLabel = $("#tab-count-label");
const searchInput = $("#search-input");
const tabList = $("#tab-list");
const searchCount = $("#search-count");
const workspaceList = $("#workspace-list");
const workspaceCount = $("#workspace-count");
const organizeButton = $("#organize-button");
const saveButton = $("#save-button");
const saveForm = $("#save-form");
const workspaceName = $("#workspace-name");
const toast = $("#toast");
const actionHint = $("#action-hint");
const searchShortcut = $("#search-shortcut");

let tabs = [];
let toastTimer;

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

function showToast(message, isError = false) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function supportedTabs(items) {
  return items.filter((tab) => isRestorableUrl(tab.url ?? ""));
}

async function loadTabs() {
  try {
    tabs = await chrome.tabs.query({ currentWindow: true });
    tabCount.textContent = String(tabs.length);
    tabCountLabel.textContent = tabs.length === 1 ? "tab in this window" : "tabs in this window";
    renderTabs();
    refreshActionHint();
  } catch (error) {
    showToast(`Could not read tabs: ${errorText(error)}`, true);
    tabs = [];
    tabCount.textContent = "0";
    tabCountLabel.textContent = "tabs in this window";
    renderTabs();
    refreshActionHint();
  }
}

function refreshActionHint() {
  const groupCount = groupTabsBySite(supportedTabs(tabs)).length;
  actionHint.textContent = groupCount
    ? `${groupCount} site${groupCount === 1 ? "" : "s"} have multiple tabs ready to group.`
    : "Open two or more tabs from the same site to create a group.";
  organizeButton.disabled = groupCount === 0;
  saveButton.disabled = supportedTabs(tabs).length === 0;
}

function createEmptyState(title, message) {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const copy = document.createElement("span");
  copy.textContent = message;
  wrapper.append(heading, copy);
  return wrapper;
}

function renderTabs() {
  const filtered = tabs.filter((tab) => matchesTab(tab, searchInput.value));
  tabList.replaceChildren();
  searchCount.textContent = String(filtered.length);
  if (!tabs.length) {
    tabList.append(createEmptyState("A little too quiet in here", "Open a few websites and they’ll show up here."));
    return;
  }
  if (!filtered.length) {
    tabList.append(createEmptyState("No matching tabs", "Try another title or website name."));
    return;
  }
  for (const tab of filtered.slice(0, 40)) {
    const row = document.createElement("button");
    row.className = "tab-row";
    row.type = "button";
    row.title = `Switch to ${tab.title || formatSite(tab.url)}`;

    const favicon = document.createElement("span");
    favicon.className = "tab-favicon";
    favicon.setAttribute("aria-hidden", "true");
    favicon.textContent = (tab.title || "T").slice(0, 1).toUpperCase();

    const copy = document.createElement("span");
    copy.className = "tab-copy";
    const title = document.createElement("span");
    title.className = "tab-title";
    title.textContent = tab.title || "Untitled tab";
    const url = document.createElement("span");
    url.className = "tab-url";
    url.textContent = formatSite(tab.url);
    copy.append(title, url);

    const arrow = document.createElement("span");
    arrow.className = "tab-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    row.append(favicon, copy, arrow);
    row.addEventListener("click", () => activateTab(tab));
    tabList.append(row);
  }
  if (filtered.length > 40) {
    tabList.append(createEmptyState("Showing 40 tabs", `Refine your search to see the other ${filtered.length - 40}.`));
  }
}

async function activateTab(tab) {
  try {
    if (Number.isInteger(tab.id)) await chrome.tabs.update(tab.id, { active: true });
    if (Number.isInteger(tab.windowId)) await chrome.windows.update(tab.windowId, { focused: true });
    window.close();
  } catch (error) {
    showToast(`Could not switch to that tab: ${errorText(error)}`, true);
  }
}

async function organizeTabs() {
  organizeButton.disabled = true;
  const groups = groupTabsBySite(supportedTabs(tabs));
  let organized = 0;
  const failures = [];
  for (const group of groups) {
    try {
      const groupId = await chrome.tabs.group({ tabIds: group.tabIds });
      await chrome.tabGroups.update(groupId, {
        title: group.site,
        color: "green",
        collapsed: false
      });
      organized += group.tabIds.length;
    } catch (error) {
      failures.push(`${group.site}: ${errorText(error)}`);
    }
  }
  if (failures.length) {
    showToast(`Grouped ${organized} tabs; ${failures[0]}`, true);
  } else if (organized) {
    showToast(`Organized ${organized} tabs into ${groups.length} site groups.`);
  } else {
    showToast("No tabs could be organized.", true);
  }
  await loadTabs();
}

async function readWorkspaces() {
  const result = await chrome.storage.local.get("workspaces");
  return Array.isArray(result.workspaces)
    ? result.workspaces.filter((workspace) => workspace && typeof workspace === "object" && !Array.isArray(workspace))
    : [];
}

function showSaveForm() {
  saveForm.hidden = false;
  workspaceName.value = "";
  workspaceName.placeholder = `Workspace · ${new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(new Date())}`;
  workspaceName.focus();
}

async function saveWorkspace(event) {
  event.preventDefault();
  const eligible = supportedTabs(tabs);
  if (!eligible.length) {
    showToast("There are no web pages to save in this window.", true);
    return;
  }
  const cleanName = workspaceName.value.trim();
  if (!cleanName) {
    workspaceName.setCustomValidity("Enter a name for this workspace.");
    workspaceName.reportValidity();
    return;
  }
  workspaceName.setCustomValidity("");
  try {
    const workspaces = await readWorkspaces();
    const workspace = {
      id: crypto.randomUUID(),
      name: cleanName.slice(0, 60),
      savedAt: Date.now(),
      tabs: eligible.map((tab) => ({ title: tab.title || formatSite(tab.url), url: tab.url }))
    };
    workspaces.unshift(workspace);
    await chrome.storage.local.set({ workspaces });
    saveForm.hidden = true;
    await renderWorkspaces();
    showToast(`Saved “${workspace.name}” with ${workspace.tabs.length} tabs.`);
  } catch (error) {
    showToast(`Could not save workspace: ${errorText(error)}`, true);
  }
}

async function restoreWorkspace(workspace) {
  const restorable = Array.isArray(workspace.tabs)
    ? workspace.tabs.filter((tab) => tab && typeof tab === "object" && isRestorableUrl(tab.url))
    : [];
  if (!restorable.length) {
    showToast("This workspace has no restorable web pages.", true);
    return;
  }
  const options = { active: false };
  if (Number.isInteger(tabs[0]?.windowId)) options.windowId = tabs[0].windowId;
  const created = [];
  const failures = [];
  for (const tab of restorable) {
    try {
      created.push(await chrome.tabs.create({ ...options, url: tab.url }));
    } catch (error) {
      failures.push(errorText(error));
    }
  }
  const bySite = new Map();
  for (const tab of created) {
    const site = formatSite(tab.url);
    const groupTabs = bySite.get(site) ?? [];
    groupTabs.push(tab.id);
    bySite.set(site, groupTabs);
  }
  for (const [site, tabIds] of bySite) {
    if (tabIds.length < 2) continue;
    try {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, { title: site, color: "green", collapsed: false });
    } catch (error) {
      failures.push(`${site}: ${errorText(error)}`);
    }
  }
  if (failures.length) {
    showToast(`Restored ${created.length} tabs; ${failures[0]}`, true);
  } else {
    showToast(`Restored ${created.length} tabs from “${workspace.name}”.`);
  }
  await loadTabs();
}

async function deleteWorkspace(workspaceId) {
  try {
    const workspaces = await readWorkspaces();
    await chrome.storage.local.set({ workspaces: workspaces.filter(({ id }) => id !== workspaceId) });
    await renderWorkspaces();
    showToast("Workspace deleted.");
  } catch (error) {
    showToast(`Could not delete workspace: ${errorText(error)}`, true);
  }
}

function formatSavedAt(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Saved workspace";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

async function renderWorkspaces() {
  workspaceList.replaceChildren();
  try {
    const workspaces = await readWorkspaces();
    workspaceCount.textContent = String(workspaces.length);
    if (!workspaces.length) {
      workspaceList.append(createEmptyState("No workspaces yet", "Save this window to keep a snapshot for later."));
      return;
    }
    for (const workspace of workspaces) {
      const row = document.createElement("div");
      row.className = "workspace-row";
      const symbol = document.createElement("span");
      symbol.className = "workspace-symbol";
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = "▧";
      const meta = document.createElement("span");
      meta.className = "workspace-meta";
      const name = document.createElement("span");
      name.className = "workspace-name";
      name.textContent = workspace.name || "Untitled workspace";
      const details = document.createElement("span");
      details.className = "workspace-detail";
      const savedTabs = Array.isArray(workspace.tabs) ? workspace.tabs.length : 0;
      details.textContent = `${savedTabs} tab${savedTabs === 1 ? "" : "s"} · ${formatSavedAt(workspace.savedAt)}`;
      meta.append(name, details);

      const actions = document.createElement("span");
      actions.className = "workspace-actions";
      const restoreButton = document.createElement("button");
      restoreButton.className = "icon-button";
      restoreButton.type = "button";
      restoreButton.textContent = "↗";
      restoreButton.title = `Restore ${workspace.name || "workspace"}`;
      restoreButton.setAttribute("aria-label", restoreButton.title);
      restoreButton.addEventListener("click", () => restoreWorkspace(workspace));
      const deleteButton = document.createElement("button");
      deleteButton.className = "icon-button delete";
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.title = `Delete ${workspace.name || "workspace"}`;
      deleteButton.setAttribute("aria-label", deleteButton.title);
      deleteButton.addEventListener("click", () => deleteWorkspace(workspace.id));
      actions.append(restoreButton, deleteButton);
      row.append(symbol, meta, actions);
      workspaceList.append(row);
    }
  } catch (error) {
    workspaceCount.textContent = "!";
    workspaceList.append(createEmptyState("Workspaces unavailable", errorText(error)));
  }
}

organizeButton.addEventListener("click", organizeTabs);
saveButton.addEventListener("click", showSaveForm);
saveForm.addEventListener("submit", saveWorkspace);
$("#cancel-save").addEventListener("click", () => { saveForm.hidden = true; });
workspaceName.addEventListener("input", () => workspaceName.setCustomValidity(""));
searchInput.addEventListener("input", renderTabs);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  } else if (event.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    renderTabs();
  }
});

searchShortcut.textContent = /mac/i.test(navigator.userAgentData?.platform ?? navigator.platform) ? "⌘ K" : "Ctrl K";
chrome.tabs.onCreated.addListener(loadTabs);
chrome.tabs.onRemoved.addListener(loadTabs);
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.title || changeInfo.url) loadTabs();
});

await Promise.all([loadTabs(), renderWorkspaces()]);
