/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import path from "node:path";
import { homedir } from "node:os";
import { mkdir, readdir, stat } from "node:fs/promises";
import { pick } from "./picker";
import { runCommand } from "./git-host";

export function createProjectActions(context: Plugin.Context, current: () => string, register: (directory: string) => Promise<void>, open: (directory: string) => Promise<void>) {
  const resolve = (input: string) => path.resolve(current(), input.trim().replace(/^~(?=\/|$)/, homedir()));
  const chooseFolder = async (): Promise<string | undefined> => {
    let directory = current();
    while (true) {
      const entries = (await readdir(directory, { withFileTypes: true })).filter(entry => entry.isDirectory() && !entry.name.startsWith(".")).sort((a, b) => a.name.localeCompare(b.name));
      const chosen = await pick(context, "Add local project", [
        { title: `Use ${path.basename(directory) || directory}`, value: "use", description: directory, badge: "" },
        { title: "Enter a path…", value: "path", description: "Choose an existing folder or create a new one", badge: "" },
        ...(directory !== path.dirname(directory) ? [{ title: "Parent directory", value: path.dirname(directory), description: path.dirname(directory), badge: "" }] : []),
        ...entries.map(entry => ({ title: entry.name, value: path.join(directory, entry.name), description: path.join(directory, entry.name), badge: "" })),
      ]);
      if (!chosen) return;
      if (chosen === "use") return directory;
      if (chosen === "path") {
        const input = await context.ui.dialog.prompt({ title: "Project directory", placeholder: "/path/to/project" });
        if (!input?.trim()) return;
        const target = resolve(input);
        let exists = false;
        try { exists = (await stat(target)).isDirectory(); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
        if (!exists) {
          if (!(await context.ui.dialog.confirm({ title: "Create project directory?", message: target, label: { confirm: "Create" } }))) return;
          await mkdir(target, { recursive: true });
        }
        return target;
      }
      directory = chosen;
    }
  };
  const add = async () => {
    try {
      const source = await context.ui.dialog.select({ title: "Add project", options: [
        { title: "Local folder", value: "local", description: "Choose a folder or create one" },
        { title: "Git URL", value: "url", description: "Clone a repository" },
        { title: "GitHub repository", value: "github", description: "Use your authenticated gh account" },
        { title: "GitLab repository", value: "gitlab", description: "Use your authenticated glab account" },
      ] });
      if (!source) return;
      let target: string | undefined;
      if (source === "local") target = await chooseFolder();
      else {
        let repository: string | undefined;
        let url: string | undefined;
        if (source === "url") {
          url = (await context.ui.dialog.prompt({ title: "Clone Git repository", placeholder: "https://host/owner/repository.git" }))?.trim();
          if (!url) return;
          if (!/^(https?:\/\/|ssh:\/\/|git@)[^\s]+$/.test(url)) throw new Error("Enter an HTTPS or SSH Git repository URL.");
        } else {
          try {
            const items = source === "github"
              ? JSON.parse(await runCommand(current(), ["gh", "repo", "list", "--limit", "100", "--json", "nameWithOwner,url"])) as { nameWithOwner: string; url: string }[]
              : (JSON.parse(await runCommand(current(), ["glab", "api", "projects?membership=true&per_page=100"])) as { path_with_namespace: string; web_url: string }[]).map(item => ({ nameWithOwner: item.path_with_namespace, url: item.web_url }));
            repository = await pick(context, source === "github" ? "GitHub repositories" : "GitLab repositories", items.map(item => ({ title: item.nameWithOwner, value: item.nameWithOwner, description: item.url, badge: "" })));
            if (!repository) return;
            url = items.find(item => item.nameWithOwner === repository)!.url;
          } catch (error) { throw new Error(`${error instanceof Error ? error.message : String(error)}\nRun ${source === "github" ? "gh auth login" : "glab auth login"} to configure access.`); }
        }
        const name = path.basename(url!.replace(/\.git$/, ""));
        const destination = await context.ui.dialog.prompt({ title: "Clone destination", value: path.join(path.dirname(current()), name) });
        if (!destination?.trim()) return;
        target = resolve(destination);
        context.ui.toast.show({ variant: "info", message: `Cloning ${repository ?? url}…`, duration: 60000 });
        await runCommand(current(), source === "url" ? ["git", "clone", "--", url!, target] : [source === "github" ? "gh" : "glab", "repo", "clone", url!, target], 120000);
        context.ui.toast.show({ variant: "success", message: "Repository cloned." });
      }
      if (!target) return;
      await register(target);
      await open(target);
    } catch (error) { context.ui.toast.show({ variant: "error", message: error instanceof Error ? error.message : String(error), duration: 7000 }); }
  };
  return { add };
}
