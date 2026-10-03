import type { SessionInfo } from "@opencode/client";
import path from "node:path";
import type { Workspace } from "./workspace";

export async function threadMenu(workspace: Workspace, session: SessionInfo) {
  const id = session.id;
  const snoozed = !!workspace.threads.state.snoozed[id];
  const settled = !!workspace.preferences.settled[id];
  const project = path.basename(session.location.directory);
  const scoped = workspace.scope() === session.location.directory;
  const choice = await workspace.context.ui.dialog.select({ title: session.title || "New thread", options: [
    { title: workspace.threads.state.pinned[id] ? "Unpin thread" : "Pin thread", value: "pin" },
    { title: "Rename thread", value: "rename" },
    ...(snoozed ? [{ title: "Wake thread", value: "wake" }] : [{ title: "Snooze…", value: "snooze" }]),
    { title: settled ? "Un-settle thread" : "Settle thread", value: "settle" },
    ...(!workspace.unread(id) ? [{ title: "Mark unread", value: "unread" }] : []),
    { title: scoped ? "Show all projects" : `Filter by ${project}`, value: "scope" },
    { title: "Pull / merge requests", value: "prs" },
    { title: "Delete thread", value: "delete" },
  ] });
  if (choice === "pin") await workspace.togglePin(id);
  if (choice === "rename") await workspace.rename(id);
  if (choice === "wake") await workspace.wake(id);
  if (choice === "snooze") await workspace.snooze(id);
  if (choice === "settle") await workspace.toggleSettle(id);
  if (choice === "unread") await workspace.markUnread(id);
  if (choice === "scope") workspace.toggleScope(session.location.directory);
  if (choice === "prs") await workspace.sourceControl.browse(session.location.directory, id);
  if (choice === "delete") await workspace.remove(id);
}
