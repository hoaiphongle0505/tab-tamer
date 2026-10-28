import test from "node:test";
import assert from "node:assert/strict";
import { formatSite, getSiteKey, groupTabsBySite, isRestorableUrl, matchesTab } from "../src/tab-utils.mjs";

test("normalizes website hostnames and skips non-web URLs", () => {
  assert.equal(getSiteKey("https://www.Example.com/article"), "example.com");
  assert.equal(getSiteKey("file:///C:/notes.html"), null);
  assert.equal(formatSite("not a url"), "not a url");
  assert.equal(formatSite("file:///C:/notes.html"), "file");
});

test("groups repeated unpinned tabs by hostname", () => {
  const groups = groupTabsBySite([
    { id: 1, url: "https://example.com/a" },
    { id: 2, url: "https://www.example.com/b" },
    { id: 3, url: "https://other.example/a" },
    { id: 4, url: "https://example.com/pinned", pinned: true },
    { url: "https://example.com/no-id" }
  ]);
  assert.deepEqual(groups, [{ site: "example.com", tabIds: [1, 2] }]);
});

test("allows only restorable web pages", () => {
  assert.equal(isRestorableUrl("https://example.com"), true);
  assert.equal(isRestorableUrl("http://localhost:3000"), true);
  assert.equal(isRestorableUrl("chrome://settings"), false);
  assert.equal(isRestorableUrl("javascript:alert(1)"), false);
});

test("matches title or URL case-insensitively", () => {
  const tab = { title: "Project Dashboard", url: "https://example.com/work" };
  assert.equal(matchesTab(tab, "DASHBOARD"), true);
  assert.equal(matchesTab(tab, "example.com"), true);
  assert.equal(matchesTab(tab, "unrelated"), false);
  assert.equal(matchesTab(tab, "   "), true);
});
