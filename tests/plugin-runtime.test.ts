import { expect, test } from "bun:test";

test("the packaged TUI renders inside the host's renderer context", async () => {
  const child = Bun.spawn([
    process.execPath, "--conditions=browser", "scripts/check-runtime.ts",
  ], { stdout: "pipe", stderr: "pipe" });
  const [code, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  expect({ code, stderr }).toEqual({ code: 0, stderr: "" });
  expect(stdout).toContain("Rendered plugin footer with the host renderer");
});
