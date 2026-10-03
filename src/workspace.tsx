/** @jsxImportSource @opentui/solid */
import { createThreadState } from "./thread-state";
import { createWorkingState } from "./working-status";
import type { Plugin } from "@opencode/plugin/tui";
import type { SessionInfo } from "@opencode/client";
import { createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";
import path from "node:path";
import { createDrafts } from "./drafts";
import { createThreadUndo } from "./thread-undo";
import { nextAfterPark, orderActive } from "./thread-lifecycle";
import { createProjectActions } from "./projects";
import { createSourceControl } from "./source-control";
import { pick } from "./picker";
import { projectPickerOptions } from "./project-picker";
import type { ThreadStatus } from "./thread-status";

export function createWorkspace(context: Plugin.Context) {
  const [preferences, save] = context.storage.store("workspace", {
    initial: {
      settled: {} as Record<string, number>,
      projects: [] as string[],
      showSettled: false,
      showSnoozed: false,
    },
  });
  const threads = createThreadState(context);
  const working = createWorkingState(context);
  const [history, setHistory] = createSignal<SessionInfo[]>([]);
  const [knownDirectories, setKnownDirectories] = createSignal<string[]>([]);
  const [scope, setScope] = createSignal<string>();
  const [loadError, setLoadError] = createSignal<string>();
  const [busy, setBusy] = createSignal(false);
  const [failed, setFailed] = createSignal(new Set<string>());
  const [completed, setCompleted] = createSignal(new Map<string, number>());
  const [diffs, setDiffs] = context.storage.memory("thread-diffs", { initial: { stats: {} as Record<string, { key: number; additions: number; deletions: number }> } });
  let disposed = false;
  const report = (error: unknown) => context.ui.toast.show({
    variant: "error",
    message: error instanceof Error ? error.message : String(error),
  });
  const undo = createThreadUndo(report);
  const drafts = createDrafts(context);
  const mutations = new Set<string>();
  const persist = (mutation: Parameters<typeof save>[0]) => save(mutation).catch(report);
  const active = createMemo(() => {
    const route = context.ui.router.current();
    return route.type === "session" ? route.sessionID : undefined;
  });
  // Refreshes return new objects for unchanged sessions. Reusing the previous
  // object keeps <For> rows mounted, so hover state and images survive a refresh.
  const identities = new Map<string, { json: string; value: SessionInfo }>();
  const stable = (session: SessionInfo) => {
    const json = JSON.stringify(session);
    const previous = identities.get(session.id);
    if (previous?.json === json) return previous.value;
    identities.set(session.id, { json, value: session });
    return session;
  };
  const sessions = createMemo(() => {
    const all = new Map(history().map(session => [session.id, session]));
    for (const session of context.data.session.list()) all.set(session.id, session);
    return [...all.values()].map(stable)
      .filter(session => !session.parentID && !session.time.archived)
      .sort((a, b) => Math.max(b.time.created, threads.lifecycle.anchors[b.id] ?? 0) - Math.max(a.time.created, threads.lifecycle.anchors[a.id] ?? 0) || a.id.localeCompare(b.id));
  });
  const directory = createMemo(() => {
    const id = active();
    return sessions().find(session => session.id === id)?.location.directory
      ?? context.location?.directory ?? context.data.location.default().directory;
  });
  const projects = createMemo(() => {
    const directories = new Set([directory(), ...knownDirectories(), ...preferences.projects]);
    for (const session of sessions()) directories.add(session.location.directory);
    return [...directories].sort((a, b) => a.localeCompare(b)).map(directory => ({
      directory,
      name: path.basename(directory) || directory,
      sessions: sessions().filter(session => session.location.directory === directory && !preferences.settled[session.id] && !threads.state.snoozed[session.id]),
    }));
  });
  const visibleSessions = createMemo(() => sessions().filter(session => !scope() || session.location.directory === scope()));
  const activeSessions = createMemo(() => orderActive(visibleSessions().filter(session => !preferences.settled[session.id] && !threads.state.snoozed[session.id]), threads.state.pinned, threads.lifecycle.anchors));
  const snoozed = createMemo(() => visibleSessions().filter(session => threads.state.snoozed[session.id])
    .sort((a, b) => threads.state.snoozed[a.id]! - threads.state.snoozed[b.id]!));
  const settled = createMemo(() => visibleSessions().filter(session => preferences.settled[session.id] && !threads.state.snoozed[session.id])
    .sort((a, b) => preferences.settled[b.id]! - preferences.settled[a.id]!));

  const refresh = async () => {
    try {
      const woke = await threads.wake();
      if (woke.length) await persist(draft => { for (const id of woke) delete draft.settled[id]; });
      const knownProjects = await context.client.project.list();
      if (!disposed) setKnownDirectories(knownProjects.flatMap(project => [project.canonical, ...project.sandboxes]));
      const pages = await Promise.all(knownProjects.map(async project => {
        const collected: SessionInfo[] = [];
        let cursor: string | undefined;
        do {
          const page = await context.client.session.list({ project: project.id, directory: project.canonical, limit: 100, cursor });
          collected.push(...page.data);
          cursor = page.cursor.next ?? undefined;
        } while (cursor && !disposed);
        return collected;
      }));
      const collected = pages.flat();
      if (!disposed) {
        setHistory(collected);
        setLoadError(undefined);
        const locations = new Map(collected.map(session => [session.location.directory, session.location]));
        void Promise.allSettled([...locations.values()].map(location => context.data.location.vcs.sync(location)));
      }
    } catch (error) {
      if (!disposed) setLoadError(error instanceof Error ? error.message : String(error));
    }
  };
  const open = async (sessionID: string) => {
    try {
      await drafts.flush();
      await threads.acknowledge(sessionID);
      await visit([sessionID]);
      await context.data.session.sync(sessionID);
      context.ui.router.navigate({ type: "session", sessionID });
    } catch (error) { report(error); }
  };
  const newThread = async (target = directory()) => {
    if (busy()) return false;
    setBusy(true);
    try {
      return await drafts.select(target);
    } catch (error) { report(error); return false; }
    finally { setBusy(false); }
  };
  const chooseNewThread = async (local = false) => {
    if (local || projects().length <= 1) { await newThread(); return; }
    const selected = await pick(context, "New thread in…", projectPickerOptions(projects(), directory()), { section: "Projects", numbered: true, current: directory() });
    if (selected) await newThread(selected);
  };
  const chooseProject = async () => {
    const selected = await pick(context, "Choose draft project", projectPickerOptions(projects(), directory()), { section: "Projects", numbered: true, current: directory() });
    if (selected) await newThread(selected);
  };
  const registerProject = async (target: string) => { await save(draft => { if (!draft.projects.includes(target)) draft.projects.push(target); }); await refresh(); };
  const openProject = async (target: string) => {
    const latest = sessions().filter(session => session.location.directory === target && !preferences.settled[session.id] && !threads.state.snoozed[session.id]).sort((a, b) => b.time.updated - a.time.updated)[0];
    if (latest) await open(latest.id); else await newThread(target);
  };
  const projectActions = createProjectActions(context, directory, registerProject, openProject);
  const sourceControl = createSourceControl(context, directory, active, newThread, drafts.canLeave);
  createEffect(() => { void sourceControl.refresh(directory()); });
  const byId = createMemo(() => new Map(sessions().map(session => [session.id, session])));
  const latestAssistant = (sessionID: string) => {
    const latest = context.data.session.message.list(sessionID).findLast(message => message.type === "assistant");
    return latest?.type === "assistant" ? latest : undefined;
  };
  const completedAt = (sessionID: string) => completed().get(sessionID)
    ?? latestAssistant(sessionID)?.time.completed ?? byId().get(sessionID)?.time.idle;
  // T3 Code: a completion is unread until you visit the thread after it.
  // A thread you never visited counts as read, so history doesn't light up.
  const unread = (sessionID: string) => {
    if (threads.seen.unread[sessionID]) return true;
    const finished = completedAt(sessionID);
    const visited = Math.max(threads.seen.visited[sessionID] ?? 0, byId().get(sessionID)?.time.viewed ?? 0);
    return finished !== undefined && visited > 0 && finished > visited;
  };
  // A visit reads everything finished so far, even when the server clock runs ahead.
  const visit = (ids: (string | undefined)[]) => Promise.all(ids.filter((id): id is string => !!id)
    .map(id => threads.visit([id], Math.max(Date.now(), (completedAt(id) ?? 0) + 1)))).catch(report);
  const status = (sessionID: string): ThreadStatus => {
    if (context.data.session.permission.list(sessionID)?.length) return "Approval";
    if (context.data.session.form.list(sessionID)?.length) return "Input";
    if (context.data.session.status(sessionID) === "running") return "Working";
    const saved = byId().get(sessionID);
    if (failed().has(sessionID) || !completed().has(sessionID) && (saved?.outcome === "failed" || latestAssistant(sessionID)?.error)) return "Failed";
    if (threads.state.woke[sessionID]) return "Woke";
    return unread(sessionID) ? "Done" : "Idle";
  };
  // The time a quiet card shows: your latest message, as in T3 Code.
  const activityAt = (session: SessionInfo) => context.data.session.message.list(session.id)
    .findLast(message => message.type === "user")?.time.created ?? session.time.updated;
  const liveBranch = (session: SessionInfo) => context.data.location.vcs.info?.(session.location)?.branch.current;
  // OpenCode sessions share a checkout, so record each thread's branch while it
  // works. A thread alone in its directory, such as a worktree, can use the live one.
  const branch = (session: SessionInfo) => threads.seen.branches[session.id]
    ?? (active() === session.id || sessions().every(other => other.id === session.id || other.location.directory !== session.location.directory) ? liveBranch(session) : undefined);
  const diffQueue: SessionInfo[] = [];
  const diffPending = new Set<string>();
  let diffRunning = 0;
  const pumpDiffs = () => {
    while (diffRunning < 2 && diffQueue.length) {
      const session = diffQueue.shift()!;
      const key = session.time.idle ?? session.time.updated;
      diffRunning++;
      void context.client.session.diff({ sessionID: session.id })
        .then(files => setDiffs(draft => { draft.stats[session.id] = { key, additions: files.reduce((sum, file) => sum + file.additions, 0), deletions: files.reduce((sum, file) => sum + file.deletions, 0) }; }))
        .catch(() => setDiffs(draft => { draft.stats[session.id] = { key, additions: 0, deletions: 0 }; }))
        .finally(() => { diffRunning--; diffPending.delete(session.id); if (!disposed) pumpDiffs(); });
    }
  };
  const diffStat = (session: SessionInfo) => {
    const cached = diffs.stats[session.id];
    const key = session.time.idle ?? session.time.updated;
    if (cached?.key !== key && context.data.session.status(session.id) !== "running" && !diffPending.has(session.id) && typeof (context.client.session as { diff?: unknown }).diff === "function") {
      diffPending.add(session.id);
      diffQueue.push(session);
      queueMicrotask(pumpDiffs);
    }
    return cached && (cached.additions || cached.deletions) ? cached : undefined;
  };
  const parkedNavigation = (id: string) => ({ viewed: active() === id, next: nextAfterPark(activeSessions(), id), directory: sessions().find(session => session.id === id)?.location.directory });
  const navigateAfterPark = async (id: string, plan: ReturnType<typeof parkedNavigation>) => {
    if (!plan.viewed || active() !== id) return;
    if (plan.next && !preferences.settled[plan.next] && !threads.state.snoozed[plan.next]) await open(plan.next);
    else if (plan.directory) await newThread(plan.directory);
  };
  const hasQueuedWork = (id: string) => context.data.session.pending.list(id).length > 0;
  const toggleSettle = async (sessionID = active()) => {
    if (!sessionID) return;
    if (mutations.has(sessionID)) return;
    const restoring = !!preferences.settled[sessionID];
    if (!restoring && (["Working", "Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID))) {
      context.ui.toast.show({ variant: "info", message: "Finish the running work or answer its request before settling." });
      return;
    }
    mutations.add(sessionID);
    undo.invalidate(sessionID);
    const plan = parkedNavigation(sessionID);
    const before = threads.snapshot(sessionID);
    const settledAt = preferences.settled[sessionID];
    try {
      await threads.clear(sessionID);
      if (restoring) await threads.reenter(sessionID); else await threads.unpin(sessionID);
      await save(draft => { if (restoring) delete draft.settled[sessionID]; else draft.settled[sessionID] = Date.now(); });
      if (!restoring) {
        undo.offer("Settled 1 thread", sessionID, async () => {
          await threads.restore(sessionID, before);
          await save(draft => { if (settledAt === undefined) delete draft.settled[sessionID]; else draft.settled[sessionID] = settledAt; });
        });
        await navigateAfterPark(sessionID, plan);
      }
    } catch (error) { await threads.restore(sessionID, before).catch(report); report(error); }
    finally { mutations.delete(sessionID); }
  };
  const snooze = async (sessionID: string) => {
    if (mutations.has(sessionID)) return;
    if (["Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID)) {
      context.ui.toast.show({ variant: "info", message: "Answer the pending request before snoozing." });
      return;
    }
    mutations.add(sessionID);
    let before: ReturnType<typeof threads.snapshot> | undefined;
    try {
      const until = await threads.chooseSnooze();
      if (!until) return;
      // A request may arrive while the time picker is open.
      if (["Approval", "Input"].includes(status(sessionID)) || hasQueuedWork(sessionID)) throw new Error("This thread now needs your response and cannot be snoozed.");
      undo.invalidate(sessionID);
      const plan = parkedNavigation(sessionID);
      before = threads.snapshot(sessionID);
      const undoState = before;
      const settledAt = preferences.settled[sessionID];
      await threads.snooze(sessionID, until);
      await save(draft => { delete draft.settled[sessionID]; });
      undo.offer("Snoozed 1 thread", sessionID, async () => {
        await threads.restore(sessionID, undoState);
        await save(draft => { if (settledAt === undefined) delete draft.settled[sessionID]; else draft.settled[sessionID] = settledAt; });
      });
      await navigateAfterPark(sessionID, plan);
    } catch (error) { if (before) await threads.restore(sessionID, before).catch(report); report(error); }
    finally { mutations.delete(sessionID); }
  };
  const wake = async (sessionID: string) => {
    try {
      undo.invalidate(sessionID);
      await threads.clear(sessionID);
      await persist(draft => { delete draft.settled[sessionID]; });
    } catch (error) { report(error); }
  };
  const togglePin = async (sessionID: string) => {
    try {
      undo.invalidate(sessionID);
      const wasPinned = !!threads.state.pinned[sessionID];
      await threads.togglePin(sessionID);
      if (wasPinned) undo.offer("Unpinned 1 thread", sessionID, async () => { if (!threads.state.pinned[sessionID]) await threads.togglePin(sessionID); });
      if (threads.state.pinned[sessionID] && preferences.settled[sessionID]) { await threads.reenter(sessionID); await save(draft => { delete draft.settled[sessionID]; }); }
    } catch (error) { report(error); }
  };
  const markUnread = (sessionID: string) => threads.markUnread(sessionID).catch(report);
  const toggleScope = (directory: string) => setScope(scope() === directory ? undefined : directory);
  const remove = async (sessionID: string) => {
    const session = byId().get(sessionID);
    if (!session || mutations.has(sessionID)) return;
    if (!(await context.ui.dialog.confirm({ title: "Delete thread?", message: `${session.title || "New thread"}\nThis permanently removes the conversation.`, label: { confirm: "Delete" } }))) return;
    mutations.add(sessionID);
    try {
      const plan = parkedNavigation(sessionID);
      undo.invalidate(sessionID);
      await context.client.session.remove({ sessionID });
      setHistory(current => current.filter(item => item.id !== sessionID));
      await navigateAfterPark(sessionID, plan);
      void refresh();
    } catch (error) { report(error); }
    finally { mutations.delete(sessionID); }
  };
  const rename = async (sessionID = active()) => {
    if (!sessionID) return;
    try {
      if (active() !== sessionID) await open(sessionID);
      // The 2.0.6 host owns session.update; the next SDK's rename route does not exist.
      setTimeout(() => context.keymap.dispatch("session.rename"), 0);
    }
    catch (error) { report(error); }
  };
  {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const stops = [
      context.data.on("session.created", () => void refresh()),
      context.data.on("session.deleted", () => void refresh()),
      context.data.on("session.renamed", () => void refresh()),
      context.data.on("session.execution.failed", event => { setFailed(current => new Set([...current, event.data.sessionID])); setCompleted(current => { const next = new Map(current); next.delete(event.data.sessionID); return next; }); if (active() === event.data.sessionID) void visit([event.data.sessionID]); undo.invalidate(event.data.sessionID, event.created); void threads.raiseAttention(event.data.sessionID, event.created).catch(report); }),
      context.data.on("session.execution.succeeded", event => { setCompleted(current => new Map(current).set(event.data.sessionID, event.created)); setFailed(current => { const next = new Set(current); next.delete(event.data.sessionID); return next; }); if (active() === event.data.sessionID) void visit([event.data.sessionID]); undo.invalidate(event.data.sessionID, event.created); void threads.raiseAttention(event.data.sessionID, event.created).catch(report); }),
      context.data.on("permission.asked", event => { undo.invalidate(event.data.sessionID, event.created); void threads.raiseAttention(event.data.sessionID, event.created).catch(report); }),
      context.data.on("form.created", event => { if (event.data.form.sessionID) { undo.invalidate(event.data.form.sessionID, event.created); void threads.raiseAttention(event.data.form.sessionID, event.created).catch(report); } }),
      context.data.on("session.execution.started", event => {
        setFailed(current => { const next = new Set(current); next.delete(event.data.sessionID); return next; });
        setCompleted(current => { const next = new Map(current); next.delete(event.data.sessionID); return next; });
        const started = byId().get(event.data.sessionID);
        if (started) void threads.recordBranch(started.id, liveBranch(started))?.catch(report);
        undo.invalidate(event.data.sessionID, event.created);
        if (preferences.settled[event.data.sessionID]) void threads.reenter(event.data.sessionID).then(() => save(draft => { delete draft.settled[event.data.sessionID]; })).catch(report);
      }),
    ];
    onCleanup(() => { disposed = true; clearInterval(timer); stops.forEach(stop => stop()); });
  }
  // Viewing a thread reads it, including when you leave it.
  createEffect(on(active, (id, previous) => { void visit([id, previous]); }));
  createEffect(() => {
    const session = byId().get(active() ?? "");
    if (session) void threads.recordBranch(session.id, liveBranch(session))?.catch(report);
  });
  const repositoryTimer = setInterval(() => void sourceControl.refresh(directory()), 60000);
  const stopRepository = context.data.on("session.execution.succeeded", () => void sourceControl.refresh(directory(), true));
  const attentionTimer = setInterval(() => {
    for (const session of sessions()) if (threads.state.snoozed[session.id] && ["Approval", "Input"].includes(status(session.id))) void threads.raiseAttention(session.id, Date.now()).catch(report);
  }, 1000);
  onCleanup(() => { clearInterval(repositoryTimer); clearInterval(attentionTimer); stopRepository(); });
  return { context, preferences, persist, active, sessions, activeSessions, visibleSessions, scope, setScope, toggleScope, projects, settled, directory, status, unread, activityAt, branch, diffStat, open, newThread, chooseNewThread, chooseProject, openProject,
    addProject: projectActions.add, toggleSettle, snooze, snoozed, wake, togglePin, markUnread, remove, threads, working, rename, busy, loadError, refresh, undo, drafts, sourceControl };
}

export type Workspace = ReturnType<typeof createWorkspace>;
