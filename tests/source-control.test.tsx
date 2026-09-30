import { expect, mock, test } from "bun:test";
import { createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { Plugin } from "@opencode/plugin/tui";
import { mkdtemp, mkdir, chmod, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runCommand } from "../src/git-host";
mock.module("../src/picker", () => ({ pick: async (context: any, _title: string, options: { value: string }[]) => context.testPick ? context.testPick(options) : options[0]?.value }));
const { createSourceControl } = await import("../src/source-control");

for (const provider of ["github", "gitlab"] as const) test(`${provider}: cancel/create, captured thread association and local checkout use the CLI contract`, async () => {
  const root = await mkdtemp(path.join(tmpdir(), "opencode-source-control-"));
  const binary = path.join(root, "bin");
  const cwd = path.join(root, "repo");
  const log = path.join(root, "calls.jsonl");
  const created = path.join(root, "created");
  const remote = path.join(root, "remote.git");
  const cli = provider === "github" ? "gh" : "glab";
  const host = provider === "github" ? "github.com" : "gitlab.com";
  const url = `https://${host}/team/repo/${provider === "github" ? "pull" : "-/merge_requests"}/7`;
  const previousPath = process.env.PATH;
  let dispose = () => {};
  try {
    await mkdir(binary); await mkdir(cwd);
    await runCommand(cwd, ["git", "init", "-b", "feature"]);
    await runCommand(cwd, ["git", "-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "--allow-empty", "-m", "test: fixture"]);
    await runCommand(cwd, ["git", "remote", "add", "origin", `https://${host}/team/repo.git`]);
    const realGit = Bun.which("git")!;
    await runCommand(cwd, [realGit, "clone", "--bare", cwd, remote]);
    await runCommand(remote, [realGit, "update-ref", provider === "github" ? "refs/pull/7/head" : "refs/merge-requests/7/head", "feature"]);
    const script = `#!${process.execPath}
const args = process.argv.slice(2);
await Bun.write(${JSON.stringify(log)}, (await Bun.file(${JSON.stringify(log)}).exists() ? await Bun.file(${JSON.stringify(log)}).text() : "") + JSON.stringify({cli:${JSON.stringify(cli)},args}) + "\\n");
const request = ${JSON.stringify(provider === "github" ? { number: 7, title: "Fixture review", url, state: "OPEN", headRefName: "feature", isDraft: false, statusCheckRollup: [{ status: "COMPLETED", conclusion: "SUCCESS" }] } : { iid: 7, title: "Fixture review", web_url: url, state: "opened", source_branch: "feature", draft: false, head_pipeline: { status: "success" } })};
if (args.includes("create")) { await Bun.write(${JSON.stringify(created)}, "yes"); console.log(${JSON.stringify(url)}); }
else if (args.includes("checkout")) console.log("checked out");
else if (args.includes("view") || args.some(arg => /merge_requests\\/7$/.test(arg))) console.log(JSON.stringify(request));
else { const branch = args.includes("--head") || args.some(arg => arg.includes("source_branch=")); console.log(JSON.stringify(branch && !await Bun.file(${JSON.stringify(created)}).exists() ? [] : [request])); }
`;
    await Bun.write(path.join(binary, cli), script); await chmod(path.join(binary, cli), 0o755);
    await Bun.write(path.join(binary, "git"), `#!${process.execPath}
const args = process.argv.slice(2);
if (args[0] === "push") { await Bun.write(${JSON.stringify(log)}, (await Bun.file(${JSON.stringify(log)}).exists() ? await Bun.file(${JSON.stringify(log)}).text() : "") + JSON.stringify({cli:"git",args}) + "\\n"); }
else { if (args[0] === "fetch") args[1] = ${JSON.stringify(remote)}; const child = Bun.spawn([${JSON.stringify(realGit)},...args],{stdin:"inherit",stdout:"inherit",stderr:"inherit"}); process.exit(await child.exited); }
`); await chmod(path.join(binary, "git"), 0o755);
    process.env.PATH = `${binary}:${previousPath}`;
    let choice = "create", confirmed = false, active = "original";
    let prompts = ["A review", "Exact description\nsecond line", "main"];
    const messages: string[] = [], drafts: string[] = [];
    const context = {
      testPick(options: { value: string }[]) { expect(options.some(option => option.value === choice)).toBe(true); return choice; },
      storage: { store(_key: string, { initial }: { initial: object }) { const [state, set] = createStore(initial); return [state, async (change: (draft: any) => void) => set(produce(change))]; } },
      ui: { dialog: { prompt: async () => prompts.shift(), confirm: async () => { active = "other"; return confirmed; }, select: async () => "local" }, toast: { show: ({ message }: { message: string }) => messages.push(message) } },
      keymap: { dispatch() {} },
    } as unknown as Plugin.Context;
    const control = createRoot(stop => { dispose = stop; return createSourceControl(context, () => cwd, () => active, async target => { drafts.push(target); return true; }, () => true); });
    await control.browse(cwd, "original");
    expect(messages).toEqual([]);
    let calls = (await Bun.file(log).text()).trim().split("\n").map(line => JSON.parse(line));
    expect(calls.some(call => call.args.includes("push") || call.args.includes("create"))).toBe(false);
    confirmed = true; prompts = ["A review", "Exact description\nsecond line", "main"];
    await control.browse(cwd, "original");
    expect(control.get({ id: "original", location: { directory: cwd } } as any)?.url).toBe(url);
    calls = (await Bun.file(log).text()).trim().split("\n").map(line => JSON.parse(line));
    expect(calls.some(call => call.cli === "git" && call.args.join(" ") === "push --set-upstream origin feature")).toBe(true);
    const creation = calls.find(call => call.args.includes("create"));
    expect(creation.args).toContain(provider === "github" ? "--body-file" : "--description");
    choice = url;
    context.ui.dialog.select = async () => "thread";
    // Choose request action first, then its checkout mode.
    let selections = 0;
    context.ui.dialog.select = async () => ++selections === 1 ? "thread" : "local";
    await control.browse(cwd, "original");
    expect(drafts).toEqual([cwd]);
    const worktree = path.join(root, "review");
    selections = 0; prompts = [worktree];
    context.ui.dialog.select = async () => ++selections === 1 ? "thread" : "worktree";
    await control.browse(cwd, "original");
    expect(drafts).toEqual([cwd, worktree]);
    expect(await runCommand(worktree, [realGit, "rev-parse", "HEAD"])).toBe(await runCommand(cwd, [realGit, "rev-parse", "HEAD"]));
    await Bun.write(path.join(cwd, "dirty"), "unsaved");
    selections = 0;
    context.ui.dialog.select = async () => ++selections === 1 ? "thread" : "local";
    await control.browse(cwd, "original");
    expect(drafts).toEqual([cwd, worktree]);
    expect(messages.some(message => message.includes("Commit or stash"))).toBe(true);
  } finally { dispose(); process.env.PATH = previousPath; await rm(root, { recursive: true, force: true }); }
});
