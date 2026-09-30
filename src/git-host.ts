export type GitHost = { kind: "github" | "gitlab"; host: string; repository: string; cloneUrl: string };
export type PullRequest = { number: number; title: string; url: string; state: "open" | "merged" | "closed"; branch: string; draft: boolean; checks?: "pending" | "failed" | "passed" };

export async function runCommand(cwd: string, args: string[], timeout = 15000) {
  const child = Bun.spawn(args, { cwd, env: process.env, stdout: "pipe", stderr: "pipe", stdin: "ignore" });
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; child.kill(); }, timeout);
  try {
    const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
    if (timedOut) throw new Error(`${args[0]} timed out.`);
    if (code !== 0) throw new Error(stderr.trim() || `${args[0]} exited with ${code}.`);
    return stdout.trim();
  } finally { clearTimeout(timer); }
}

export function parseRemote(remote: string, configuredGitLabHosts: string[] = []): GitHost | undefined {
  const scp = /^(?:[^@]+@)?([^/:]+):(.+)$/.exec(remote);
  let host: string, repository: string;
  if (scp && !remote.includes("://")) { host = scp[1]!; repository = scp[2]!; }
  else {
    let url: URL;
    try { url = new URL(remote); } catch { return; }
    host = url.hostname; repository = url.pathname.replace(/^\//, "");
  }
  repository = repository.replace(/\.git\/?$/, "").replace(/\/$/, "");
  if (!repository.includes("/") || repository.includes("..")) return;
  const kind = host === "github.com" ? "github" : host === "gitlab.com" || configuredGitLabHosts.includes(host) ? "gitlab" : undefined;
  if (kind) return { kind, host, repository, cloneUrl: remote };
}

export function parseRequestUrl(input: string): { host: string; repository: string; number: number; kind: GitHost["kind"] } | undefined {
  let url: URL;
  try { url = new URL(input); } catch { return; }
  if (url.protocol !== "https:" || url.username || url.password) return;
  const match = /^\/(.+?)\/(pull|\-\/merge_requests)\/([1-9]\d*)\/?$/.exec(url.pathname);
  if (!match) return;
  const kind = match[2] === "pull" ? "github" : "gitlab";
  if (kind === "github" && url.hostname !== "github.com") return;
  return { host: url.hostname, repository: match[1]!, number: Number(match[3]), kind };
}

type GitHubRequest = { number: number; title: string; url: string; state: string; headRefName: string; isDraft: boolean; statusCheckRollup?: { status?: string; conclusion?: string; state?: string }[] };
type GitLabRequest = { iid: number; title: string; web_url: string; state: string; source_branch: string; draft?: boolean; work_in_progress?: boolean; head_pipeline?: { status: string } };

export function normalizeGitHub(value: GitHubRequest): PullRequest {
  if (!Number.isInteger(value.number) || !value.url || !value.headRefName) throw new Error("GitHub returned an invalid pull request.");
  const checks = value.statusCheckRollup ?? [];
  const failed = checks.some(check => ["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED"].includes(check.conclusion ?? check.state ?? ""));
  const pending = checks.some(check => check.status && check.status !== "COMPLETED" || check.state === "PENDING");
  return { number: value.number, title: value.title, url: value.url, state: value.state.toLowerCase() as PullRequest["state"], branch: value.headRefName, draft: value.isDraft,
    checks: failed ? "failed" : pending ? "pending" : checks.length ? "passed" : undefined };
}
export function normalizeGitLab(value: GitLabRequest): PullRequest {
  if (!Number.isInteger(value.iid) || !value.web_url || !value.source_branch) throw new Error("GitLab returned an invalid merge request.");
  const pipeline = value.head_pipeline?.status;
  return { number: value.iid, title: value.title, url: value.web_url, state: value.state === "opened" ? "open" : value.state as PullRequest["state"], branch: value.source_branch, draft: value.draft ?? value.work_in_progress ?? false,
    checks: pipeline === "failed" || pipeline === "canceled" ? "failed" : pipeline === "running" || pipeline === "pending" ? "pending" : pipeline === "success" ? "passed" : undefined };
}

const fields = "number,title,url,state,headRefName,isDraft,statusCheckRollup";
export async function listRequests(cwd: string, host: GitHost, branch?: string): Promise<PullRequest[]> {
  if (host.kind === "github") {
    const values = JSON.parse(await runCommand(cwd, ["gh", "pr", "list", "--repo", `${host.host}/${host.repository}`, "--state", "open", "--limit", "50", "--json", fields, ...(branch ? ["--head", branch] : [])]));
    return values.map(normalizeGitHub);
  }
  const endpoint = `projects/${encodeURIComponent(host.repository)}/merge_requests?state=opened&per_page=50${branch ? `&source_branch=${encodeURIComponent(branch)}` : ""}`;
  const values = JSON.parse(await runCommand(cwd, ["glab", "api", "--hostname", host.host, endpoint]));
  return values.map(normalizeGitLab);
}
export async function readRequest(cwd: string, host: GitHost, url: string): Promise<PullRequest> {
  const request = parseRequestUrl(url);
  if (!request || request.kind !== host.kind || request.host !== host.host) throw new Error("Choose a request on this repository's configured Git host.");
  if (host.kind === "github") return normalizeGitHub(JSON.parse(await runCommand(cwd, ["gh", "pr", "view", url, "--repo", `${host.host}/${host.repository}`, "--json", fields])));
  return normalizeGitLab(JSON.parse(await runCommand(cwd, ["glab", "api", "--hostname", host.host, `projects/${encodeURIComponent(request.repository)}/merge_requests/${request.number}`])));
}
