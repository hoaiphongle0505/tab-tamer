export function getSiteKey(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.hostname.replace(/^www\./i, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

export function isRestorableUrl(url) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function groupTabsBySite(tabs) {
  const groups = new Map();
  for (const tab of tabs) {
    if (tab.pinned || !Number.isInteger(tab.id)) continue;
    const site = getSiteKey(tab.url ?? "");
    if (!site) continue;
    const matchingTabs = groups.get(site) ?? [];
    matchingTabs.push(tab);
    groups.set(site, matchingTabs);
  }
  return [...groups.entries()]
    .filter(([, matchingTabs]) => matchingTabs.length > 1)
    .map(([site, matchingTabs]) => ({ site, tabIds: matchingTabs.map(({ id }) => id) }));
}

export function matchesTab(tab, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  return `${tab.title ?? ""} ${tab.url ?? ""}`.toLocaleLowerCase().includes(needle);
}

export function formatSite(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./i, "") || parsed.protocol.slice(0, -1);
  } catch {
    return url || "Website";
  }
}
