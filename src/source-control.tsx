/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import type { SessionInfo } from "@opencode/client";
import { createSignal } from "solid-js";
import path from "node:path";
import { tmpdir } from "node:os";
import { rm } from "node:fs/promises";
import { listRequests, parseRemote, parseRequestUrl, readRequest, runCommand, type GitHost, type PullRequest } from "./git-host";
import { pick } from "./picker";
import { openUrlCommand } from "./open-url";
import { requestPresentation } from "./request-badge";

type Repository = { branch: string; host?: GitHost; request?: PullRequest; error?: string };
export function createSourceControl(context: Plugin.Context, directory: () => string, active: () => string | undefined, newThread: (directory: string) => Promise<boolean>, canLeave: () => boolean) {
  const [links, saveLinks] = context.storage.store("thread-pr-links", { initial: { urls: {} as Record<string, string> } });
  const [settings, saveSettings] = context.storage.store("git-hosts", { initial: { gitlab: [] as string[] } });
  const [repositories, setRepositories] = createSignal<Record<string, Repository>>({});
  const [requests, setRequests] = createSignal<Record<string, PullRequest>>({});
  const pending = new Map<string, Promise<void>>();
  const checked = new Map<string, number>();
  const report = (error: unknown) => context.ui.toast.show({ variant: "error", message: error instanceof Error ? error.message : String(error), duration: 7000 });
  const refresh = (cwd: string, force = false): Promise<void> => {
    if (pending.has(cwd)) return pending.get(cwd)!;
    if (!force && Date.now() - (checked.get(cwd) ?? 0) < 60000) return Promise.resolve();
    const operation = (async () => {
      let branch: string;
      try { branch = await runCommand(cwd, ["git", "branch", "--show-current"]); }
      catch { setRepositories(values => { const next = { ...values }; delete next[cwd]; return next; }); return; }
      let remote = "";
      try { remote = await runCommand(cwd, ["git", "remote", "get-url", "origin"]); } catch { /* A local repository may have no origin. */ }
      const host = parseRemote(remote, settings.gitlab);
      let request: PullRequest | undefined;
      let error: string | undefined;
      if (host && branch) {
        try {
          request = (await listRequests(cwd, host, branch))[0];
          const urls = new Set(Object.values(links.urls).filter(url => parseRequestUrl(url)?.host === host.host));
          const results = await Promise.allSettled([...urls].map(url => readRequest(cwd, host, url)));
          for (const result of results) if (result.status === "fulfilled") setRequests(values => ({ ...values, [result.value.url]: result.value }));
        } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
      }
      setRepositories(values => ({ ...values, [cwd]: { branch, host, request, error } }));
      if (request) setRequests(values => ({ ...values, [request.url]: request }));
    })().finally(() => { pending.delete(cwd); checked.set(cwd, Date.now()); });
    pending.set(cwd, operation);
    return operation;
  };
  // OpenCode sessions share a live checkout. Only the viewed thread inherits
  // that checkout's request; background threads need an explicit association.
  const get = (session: SessionInfo) => links.urls[session.id] ? requests()[links.urls[session.id]!] : active() === session.id ? repositories()[session.location.directory]?.request : undefined;
  const openUrl = async (url: string) => {
    const request = parseRequestUrl(url);
    if (!request) throw new Error("Invalid pull request URL.");
    await runCommand(directory(), openUrlCommand(url));
  };
  const link = async (sessionID: string, cwd: string, url?: string) => {
    await refresh(cwd);
    const host = repositories()[cwd]?.host;
    if (!host) throw new Error("Configure a GitHub or GitLab origin for this project first.");
    const input = url ?? await context.ui.dialog.prompt({ title: host.kind === "gitlab" ? "Link merge request" : "Link pull request", placeholder: "Full request URL" });
    if (!input) return;
    const request = await readRequest(cwd, host, input.trim());
    setRequests(values => ({ ...values, [request.url]: request }));
    await saveLinks(draft => { draft.urls[sessionID] = request.url; });
  };
  const checkout = async (cwd: string, host: GitHost, request: PullRequest) => {
    if (!canLeave()) return;
    if (parseRequestUrl(request.url)?.repository !== host.repository) throw new Error("Open this request's project before preparing its checkout.");
    const mode = await context.ui.dialog.select({ title: `New thread from ${host.kind === "gitlab" ? "MR" : "PR"} #${request.number}`, options: [
      { title: "New worktree", value: "worktree", description: "Keep the current checkout and prepare a separate workspace" },
      { title: "Local checkout", value: "local", description: "Switch this project's branch" },
    ] });
    if (!mode) return;
    let target = cwd;
    if (mode === "local") {
      if (await runCommand(cwd, ["git", "status", "--porcelain"])) throw new Error("Commit or stash local changes before checking out this request.");
      if (!(await context.ui.dialog.confirm({ title: "Switch local checkout?", message: `${cwd}\n${request.title}\nBranch: ${request.branch}`, label: { confirm: "Checkout" } }))) return;
      await runCommand(cwd, host.kind === "github" ? ["gh", "pr", "checkout", request.url] : ["glab", "mr", "checkout", request.url], 60000);
    } else {
      const destination = await context.ui.dialog.prompt({ title: "New worktree directory", value: path.join(path.dirname(cwd), `${path.basename(cwd)}-${host.kind === "gitlab" ? "mr" : "pr"}-${request.number}`) });
      if (!destination) return;
      target = path.resolve(cwd, destination);
      const reference = host.kind === "github" ? `refs/pull/${request.number}/head` : `refs/merge-requests/${request.number}/head`;
      const parsed = parseRequestUrl(request.url)!;
      await runCommand(cwd, ["git", "fetch", `https://${host.host}/${parsed.repository}.git`, reference], 60000);
      await runCommand(cwd, ["git", "worktree", "add", "-b", `review/${host.kind}-${request.number}-${Date.now().toString(36)}`, target, "FETCH_HEAD"], 60000);
    }
    if (await newThread(target)) context.ui.toast.show({ variant: "success", message: `Checkout ready. The new draft uses ${request.branch}.` });
  };
  const createRequest = async (cwd: string, host: GitHost, branch: string, sessionID?: string) => {
    if (!branch) throw new Error("Checkout a branch before creating a request.");
    if (await runCommand(cwd, ["git", "status", "--porcelain"])) throw new Error("Commit your changes before creating a request.");
    const title = await context.ui.dialog.prompt({ title: host.kind === "gitlab" ? "Merge request title" : "Pull request title" });
    if (!title?.trim()) return;
    const body = await context.ui.dialog.prompt({ title: "Request description", placeholder: "Describe the change" });
    if (body === undefined) return;
    const base = await context.ui.dialog.prompt({ title: "Target branch", placeholder: "main" });
    if (!base?.trim()) return;
    if (base.trim() === branch) throw new Error("Choose a target branch different from the current branch.");
    if (!(await context.ui.dialog.confirm({ title: "Push branch and create request?", message: `${host.host}/${host.repository}\n${branch} → ${base.trim()}\n${title.trim()}`, label: { confirm: "Push and create" } }))) return;
    await runCommand(cwd, ["git", "push", "--set-upstream", "origin", branch], 60000);
    const file = path.join(tmpdir(), `opencode-pr-${crypto.randomUUID()}.md`);
    try {
      await Bun.write(file, body);
      const result = host.kind === "github"
        ? await runCommand(cwd, ["gh", "pr", "create", "--repo", `${host.host}/${host.repository}`, "--head", branch, "--base", base.trim(), "--title", title.trim(), "--body-file", file], 60000)
        : await runCommand(cwd, ["glab", "mr", "create", "--repo", `${host.host}/${host.repository}`, "--source-branch", branch, "--target-branch", base.trim(), "--title", title.trim(), "--description", body, "--yes"], 60000);
      const url = result.match(/https:\/\/\S+\/(?:pull|\-\/merge_requests)\/\d+/)?.[0];
      if (url && sessionID) await link(sessionID, cwd, url);
      await refresh(cwd, true);
      context.ui.toast.show({ variant: "success", message: "Request created." });
    } finally { await rm(file, { force: true }); }
  };
  const requestMenu = async (cwd: string, host: GitHost, request: PullRequest, sessionID?: string) => {
    const choice = await context.ui.dialog.select({ title: `${host.kind === "gitlab" ? "MR" : "PR"} #${request.number} · ${request.state}`, options: [
      { title: "Open in browser", value: "open", description: request.title },
      { title: "New thread from checkout…", value: "thread" },
      ...(sessionID ? [{ title: links.urls[sessionID] === request.url ? "Unlink from thread" : "Link to thread", value: "link" }] : []),
    ] });
    if (choice === "open") await openUrl(request.url);
    if (choice === "thread") await checkout(cwd, host, request);
    if (choice === "link" && sessionID) {
      if (links.urls[sessionID] === request.url) await saveLinks(draft => { delete draft.urls[sessionID]; });
      else await link(sessionID, cwd, request.url);
    }
  };
  const browse = async (cwd = directory(), sessionID = active()) => {
    try {
      await refresh(cwd, true);
      const repo = repositories()[cwd];
      if (!repo?.host) {
        const action = await context.ui.dialog.select({ title: "Source control", options: [
          { title: "Native workspaces", value: "workspaces", description: "Open OpenCode's workspace menu" },
          { title: "Configure GitLab host", value: "host", description: "Enable your self-hosted GitLab origin" },
        ] });
        if (action === "workspaces") context.keymap.dispatch("session.move");
        if (action === "host") {
          const input = await context.ui.dialog.prompt({ title: "GitLab hostname", placeholder: "gitlab.example.com" });
          if (input && /^[a-z0-9.-]+$/i.test(input)) { await saveSettings(draft => { if (!draft.gitlab.includes(input)) draft.gitlab.push(input); }); await refresh(cwd, true); }
        }
        return;
      }
      if (repo.error) throw new Error(`${repo.error}\nCheck ${repo.host.kind === "github" ? "gh auth login" : "glab auth login"}.`);
      const items = await listRequests(cwd, repo.host);
      const selected = await pick(context, repo.host.kind === "gitlab" ? "Merge requests" : "Pull requests", [
        ...items.map(item => ({ title: `#${item.number} ${item.title}`, value: item.url, description: item.branch, icon: requestPresentation(item).icon, iconColor: requestPresentation(item).color })),
        ...(sessionID ? [{ title: "Link existing request…", value: "link", description: "Paste a URL", icon: "git-pull-request" as const }] : []),
        ...(!repo.request ? [{ title: "Create request…", value: "create", description: `Push ${repo.branch || "branch"}`, icon: "plus" as const }] : []),
      ]);
      if (selected === "link" && sessionID) await link(sessionID, cwd);
      else if (selected === "create") await createRequest(cwd, repo.host, repo.branch, sessionID);
      else if (selected) { const item = items.find(item => item.url === selected); if (item) await requestMenu(cwd, repo.host, item, sessionID); }
    } catch (error) { report(error); }
  };
  const openRequest = async (session: SessionInfo) => {
    try {
      const repo = repositories()[session.location.directory];
      const request = get(session);
      if (repo?.host && request) await requestMenu(session.location.directory, repo.host, request, session.id);
    } catch (error) { report(error); }
  };
  return { repositories, get, refresh, browse, link, openRequest, settings };
}
