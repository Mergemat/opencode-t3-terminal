/** @jsxImportSource @opentui/solid */
import { createEffect, createSignal, onCleanup } from "solid-js";
import type { Plugin } from "@opencode/plugin/tui";

export function createWorkingState(context: Plugin.Context) {
  const [state, update] = context.storage.memory("working", { initial: { started: {} as Record<string, number> } });
  const stops = [
    context.data.on("session.execution.started", event => update(draft => { draft.started[event.data.sessionID] = event.created; })),
    ...(["session.execution.succeeded", "session.execution.failed", "session.execution.interrupted", "session.deleted"] as const)
      .map(type => context.data.on(type, event => update(draft => { delete draft.started[event.data.sessionID]; }))),
  ];
  onCleanup(() => stops.forEach(stop => stop()));
  const startedAt = (sessionID: string) => {
    if (state.started[sessionID] !== undefined) return state.started[sessionID];
    // A TUI can attach after execution started. The current request is already
    // in the native message collection, even though its start event was missed.
    return context.data.session.message.list(sessionID).findLast(message => message.type === "user")?.time.created;
  };
  return { startedAt };
}

export function workingLabel(startedAt: number | undefined, now: number) {
  if (startedAt === undefined) return "Working";
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  const duration = seconds < 60 ? `${seconds}s` : minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `Working ${duration}`;
}

export function createWorkingClock(working: () => boolean) {
  const [now, setNow] = createSignal(Date.now());
  // Keep the second tick confined to this card's label and width.
  createEffect(() => {
    if (!working()) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    onCleanup(() => clearInterval(timer));
  });
  return now;
}
