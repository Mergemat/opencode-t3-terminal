import { expect, test } from "bun:test";
import { rankOptions } from "../src/picker-rank";
import { fitTail } from "../src/single-line";

test("picker ranks title prefixes first and requires every term", () => {
  const options = ["docs", "atlas docs", "orbit"].map(title => ({ title, value: title, description: title === "orbit" ? "~/docs/orbit" : undefined }));
  expect(rankOptions(options, "doc").map(option => option.value)).toEqual(["docs", "atlas docs", "orbit"]);
  expect(rankOptions(options, "atlas doc").map(option => option.value)).toEqual(["atlas docs"]);
});
test("paths keep their end when truncated", () => {
  expect(fitTail("~/projects/opencode/t3-terminal", 13)).toBe("…/t3-terminal");
});
