import { expect, test } from "bun:test";
import { nextAfterPark, orderActive, parseWakeTime, snoozePresets } from "../src/thread-lifecycle";
import { normalizeGitHub, normalizeGitLab, parseRemote, parseRequestUrl } from "../src/git-host";

test("streaming updates don't reorder active cards; restore and pins do", () => {
  const sessions = [
    { id: "old", time: { created: 1, updated: 999 }, location: { directory: "/a" } },
    { id: "new", time: { created: 2, updated: 2 }, location: { directory: "/a" } },
  ];
  expect(orderActive(sessions, {}, {}).map(item => item.id)).toEqual(["new", "old"]);
  expect(orderActive(sessions, {}, { old: 3 }).map(item => item.id)).toEqual(["old", "new"]);
  expect(orderActive(sessions, { old: true }, {}).map(item => item.id)).toEqual(["old", "new"]);
});
test("parking advances relative to the selected card and wraps", () => {
  const cards = ["a", "b", "c"].map(id => ({ id, time: { created: 1 }, location: { directory: "/a" } }));
  expect(nextAfterPark(cards, "b")).toBe("c");
  expect(nextAfterPark(cards, "c")).toBe("a");
  expect(nextAfterPark([cards[0]!], "a")).toBeUndefined();
});
test("Next week uses the calendar and doesn't duplicate tomorrow on Sunday", () => {
  const friday = snoozePresets(new Date(2026, 9, 2, 12));
  const monday = new Date(friday.find(item => item.title === "Next week")!.time);
  expect([monday.getDay(), monday.getDate(), monday.getHours()]).toEqual([1, 5, 9]);
  const sunday = snoozePresets(new Date(2026, 9, 4, 12));
  expect(sunday.some(item => item.title === "Next week")).toBe(false);
  expect(new Set(sunday.map(item => item.time)).size).toBe(sunday.length);
});
test("custom wake input rejects past, zero and invalid values", () => {
  const now = Date.now();
  expect(parseWakeTime("30m", now)).toBe(now + 1800000);
  expect(parseWakeTime("0h", now)).toBeUndefined();
  expect(parseWakeTime("yesterday", now)).toBeUndefined();
  expect(parseWakeTime("2020-01-01", now)).toBeUndefined();
});
test("GitLab hosts are explicit and request URLs cannot redirect CLI credentials", () => {
  expect(parseRemote("git@gitlab.example.com:group/sub/repo.git")).toBeUndefined();
  expect(parseRemote("git@gitlab.example.com:group/sub/repo.git", ["gitlab.example.com"])?.repository).toBe("group/sub/repo");
  expect(parseRequestUrl("https://github.com/a/b/pull/12")?.number).toBe(12);
  expect(parseRequestUrl("https://gitlab.example.com/a/b/-/merge_requests/4")?.kind).toBe("gitlab");
  expect(parseRequestUrl("https://github.com.evil.test/a/b/pull/12")).toBeUndefined();
  expect(parseRequestUrl("https://user:pass@github.com/a/b/pull/12")).toBeUndefined();
});
test("request presentation reflects provider states and failing checks", () => {
  expect(normalizeGitHub({ number: 1, title: "PR", url: "https://github.com/a/b/pull/1", state: "OPEN", headRefName: "feature", isDraft: false, statusCheckRollup: [{ status: "COMPLETED", conclusion: "FAILURE" }] }).checks).toBe("failed");
  expect(normalizeGitLab({ iid: 2, title: "MR", web_url: "https://gitlab.com/a/b/-/merge_requests/2", state: "opened", source_branch: "feature", head_pipeline: { status: "running" } })).toMatchObject({ state: "open", checks: "pending" });
});
