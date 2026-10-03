import { expect, mock, test } from "bun:test";
import { createRoot, createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import type { Plugin } from "@opencode/plugin/tui";
import type { SessionInfo } from "@opencode/client";
import type { TextareaRenderable } from "@opentui/core";
import { tmpdir } from "node:os";
mock.module("../src/picker", () => ({ pick: async (context: any, _title: string, options: { value: string }[]) => context.testPick ? context.testPick(options) : options[0]?.value }));
const { createWorkspace } = await import("../src/workspace");

function harness() {
  const listeners = new Map<string, ((event: any) => void)[]>();
  const stores = new Map<string, any>();
  const [route, setRoute] = createSignal<any>({ type: "session", sessionID: "b" });
  const [location, setLocation] = createSignal({ directory: tmpdir() });
  const running = new Set<string>();
  const sessions = ["a", "b", "c"].map((id, index) => ({ id, time: { created: 3 - index, updated: 3 - index }, location: { directory: tmpdir() } })) as SessionInfo[];
  const calls: string[] = [];
  const messages: string[] = [];
  let failWrite = false;
  let release: (() => void) | undefined;
  let paused = false;
  const context = {
    get location() { return location(); },
    storage: {
      store(key: string, { initial }: { initial: object }) {
        const [state, setState] = createStore(initial);
        stores.set(key, state);
        return [state, async (change: (value: any) => void) => {
          if (key === "workspace" && failWrite) { failWrite = false; throw new Error("storage unavailable"); }
          if (key === "workspace" && paused) await new Promise<void>(resolve => { release = resolve; });
          setState(produce(change));
        }];
      },
      memory(_key: string, { initial }: { initial: object }) { const [state, setState] = createStore(initial); return [state, (change: (value: any) => void) => setState(produce(change))]; },
    },
    client: { project: { list: async () => [] }, session: { create: async () => { calls.push("create"); }, list: async () => ({ data: [], cursor: {} }) } },
    data: {
      on(type: string, callback: (event: any) => void) { listeners.set(type, [...listeners.get(type) ?? [], callback]); return () => {}; },
      session: { list: () => sessions, sync: async () => {}, status: (id: string) => running.has(id) ? "running" : "idle",
        message: { list: () => [] }, permission: { list: () => [] }, form: { list: () => [] }, pending: { list: () => [] } },
      location: { default: location, vcs: { sync: async () => {} } },
    },
    keymap: { dispatch(command: string, input?: string) { calls.push(command); if (command === "session.new") setRoute({ type: "home" }); if (command === "session.cd" && input) setLocation({ directory: input }); } },
    ui: { router: { current: route, navigate: setRoute }, toast: { show: (value: { message: string }) => messages.push(value.message) }, dialog: { prompt: async () => undefined } },
  } as unknown as Plugin.Context;
  let dispose!: () => void;
  const workspace = createRoot(stop => { dispose = stop; return createWorkspace(context); });
  return { workspace, route, setRoute, running, stores, calls, messages, dispose,
    emit(type: string, id: string, created = Date.now()) { listeners.get(type)?.forEach(callback => callback({ created, data: { sessionID: id } })); },
    fail() { failWrite = true; }, pause() { paused = true; }, resume() { paused = false; release?.(); } };
}

test("Settle advances to the following card; Undo restores a pinned thread", async () => {
  const h = harness();
  try {
    await h.workspace.toggleSettle("b");
    expect(h.route()).toEqual({ type: "session", sessionID: "c" });
    expect(h.workspace.settled().map(session => session.id)).toContain("b");
    await h.workspace.undo.undo();
    expect(h.workspace.settled().map(session => session.id)).not.toContain("b");
    await h.workspace.togglePin("a");
    await h.workspace.toggleSettle("a");
    expect(h.workspace.threads.state.pinned.a).toBeUndefined();
    await h.workspace.undo.undo();
    expect(h.workspace.threads.state.pinned.a).toBe(true);
  } finally { h.dispose(); }
});
test("a failed park and a navigation during storage both keep the user's route", async () => {
  const h = harness();
  try {
    await h.workspace.togglePin("b");
    h.fail(); await h.workspace.toggleSettle("b");
    expect(h.route().sessionID).toBe("b");
    expect(h.workspace.threads.state.pinned.b).toBe(true);
    expect(h.messages).toContain("storage unavailable");
    h.pause(); const operation = h.workspace.toggleSettle("b");
    await new Promise(resolve => setTimeout(resolve, 0));
    h.setRoute({ type: "session", sessionID: "a" });
    h.resume(); await operation;
    expect(h.route().sessionID).toBe("a");
  } finally { h.dispose(); }
});
test("running work can be snoozed; start does not wake it; completion does", async () => {
  const h = harness();
  try {
    h.running.add("b");
    await h.workspace.snooze("b");
    expect(h.workspace.snoozed().map(session => session.id)).toContain("b");
    h.emit("session.execution.succeeded", "b", 1);
    expect(h.workspace.undo.notice()?.id).toBe("b");
    expect(h.workspace.snoozed().map(session => session.id)).toContain("b");
    h.emit("session.execution.started", "b");
    expect(h.workspace.snoozed().map(session => session.id)).toContain("b");
    h.emit("session.execution.succeeded", "b", Date.now() + 1);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(h.workspace.snoozed().map(session => session.id)).not.toContain("b");
    expect(h.workspace.threads.state.woke.b).toBe(true);
    await h.workspace.open("b");
    expect(h.workspace.threads.state.woke.b).toBeUndefined();
  } finally { h.dispose(); }
});
test("opening snoozed work preserves Snooze; fresh permission wakes it", async () => {
  const h = harness();
  try {
    await h.workspace.snooze("b"); await h.workspace.open("b");
    expect(h.workspace.snoozed().map(session => session.id)).toContain("b");
    h.emit("permission.asked", "b", Date.now() + 1);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(h.workspace.snoozed().map(session => session.id)).not.toContain("b");
    expect(h.workspace.undo.notice()).toBeUndefined();
  } finally { h.dispose(); }
});
test("emptying the queue opens a native draft without creating a session", async () => {
  const h = harness();
  try {
    await h.workspace.toggleSettle("a"); await h.workspace.toggleSettle("c");
    await h.workspace.toggleSettle("b");
    expect(h.route().type).toBe("home");
    expect(h.calls).toContain("session.cd");
    expect(h.calls).not.toContain("create");
  } finally { h.dispose(); }
});
test("a new draft preserves composed text; a native attachment prevents destructive replacement", async () => {
  const h = harness();
  try {
    await h.workspace.newThread();
    let text = "unfinished request";
    let attached = false;
    const editor = { isDestroyed: false, get plainText() { return text; }, extmarks: { getAll: () => attached ? [{}] : [] }, setText(value: string) { text = value; }, focus() {} } as unknown as TextareaRenderable;
    h.workspace.drafts.attach(editor, tmpdir());
    text = "unfinished request";
    await h.workspace.drafts.flush();
    const first = h.workspace.drafts.selected();
    await h.workspace.newThread();
    expect(h.workspace.drafts.selected()).not.toBe(first);
    expect(h.workspace.drafts.state.drafts[first!]!.text).toBe("unfinished request");
    h.workspace.drafts.attach(editor, tmpdir()); attached = true;
    const selected = h.workspace.drafts.selected();
    await h.workspace.newThread();
    expect(h.workspace.drafts.selected()).toBe(selected);
    expect(h.messages.some(message => message.includes("native attachments"))).toBe(true);
  } finally { h.dispose(); }
});

test("drafts enter the sidebar after navigation and freeze their preview when reopened", async () => {
  const h = harness();
  try {
    await h.workspace.newThread();
    let text = "";
    const editor = { isDestroyed: false, get plainText() { return text; }, extmarks: { getAll: () => [] },
      setText(value: string) { text = value; }, focus() {} } as unknown as TextareaRenderable;
    h.workspace.drafts.attach(editor, tmpdir());
    text = "First thought";
    await h.workspace.drafts.flush();
    expect(h.workspace.drafts.sidebarEntries()).toEqual([]);
    text = "Saved thought";
    await h.workspace.drafts.flush();
    expect(h.workspace.drafts.sidebarEntries()).toEqual([]);
    const id = h.workspace.drafts.selected()!;
    await h.workspace.open("a");
    expect(h.workspace.drafts.sidebarEntries().map(draft => draft.text)).toEqual(["Saved thought"]);
    await h.workspace.drafts.select(tmpdir(), id);
    h.workspace.drafts.attach(editor, tmpdir());
    expect(text).toBe("Saved thought");
    text = "Edited thought";
    await h.workspace.drafts.flush();
    expect(h.workspace.drafts.sidebarEntries().map(draft => draft.text)).toEqual(["Saved thought"]);
    await h.workspace.open("b");
    expect(h.workspace.drafts.sidebarEntries().map(draft => draft.text)).toEqual(["Edited thought"]);
    await h.workspace.drafts.select(tmpdir(), id);
    h.workspace.drafts.attach(editor, tmpdir());
    text = "";
    await h.workspace.drafts.flush();
    await h.workspace.open("a");
    expect(h.workspace.drafts.sidebarEntries()).toEqual([]);
    await h.workspace.newThread();
    await h.workspace.open("b");
    expect(h.workspace.drafts.sidebarEntries()).toEqual([]);
  } finally { h.dispose(); }
});

test("Done means an unseen completion; visiting the thread clears it", async () => {
  const h = harness();
  try {
    h.setRoute({ type: "session", sessionID: "a" });
    await new Promise(resolve => setTimeout(resolve, 0));
    h.setRoute({ type: "session", sessionID: "b" });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(h.workspace.status("a")).toBe("Idle");
    h.emit("session.execution.succeeded", "a", Date.now() + 1000);
    expect(h.workspace.status("a")).toBe("Done");
    await h.workspace.open("a");
    expect(h.workspace.status("a")).toBe("Idle");
    await h.workspace.markUnread("a");
    expect(h.workspace.status("a")).toBe("Done");
    expect(h.workspace.status("c")).toBe("Idle");
  } finally { h.dispose(); }
});
test("unpinning offers Undo", async () => {
  const h = harness();
  try {
    await h.workspace.togglePin("a");
    await h.workspace.togglePin("a");
    expect(h.workspace.undo.notice()?.label).toBe("Unpinned 1 thread");
    await h.workspace.undo.undo();
    expect(h.workspace.threads.state.pinned.a).toBe(true);
  } finally { h.dispose(); }
});
