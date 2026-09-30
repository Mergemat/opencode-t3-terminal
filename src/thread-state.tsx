/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import { pick } from "./picker";
import { icons } from "./icons";
import { parseWakeTime, snoozePresets } from "./thread-lifecycle";

export function createThreadState(context: Plugin.Context) {
  const [state, save] = context.storage.store("thread-state", {
    initial: { pinned: {} as Record<string, boolean>, snoozed: {} as Record<string, number>, woke: {} as Record<string, boolean> },
  });
  const [lifecycle, updateLifecycle] = context.storage.store("thread-lifecycle", {
    initial: { snoozedAt: {} as Record<string, number>, anchors: {} as Record<string, number> },
  });
  const chooseSnooze = async () => {
    const options = snoozePresets(new Date());
    const choice = await pick(context, "Snooze thread", options.map(option => ({
      title: option.title, value: String(option.time), badge: icons.snooze,
      description: new Date(option.time).toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit" }),
    })).concat([{ title: "Custom time", value: "custom", badge: icons.snooze, description: "Duration (30m, 2h, 3d) or date and time" }]));
    if (!choice) return;
    if (choice !== "custom") return Number(choice);
    const input = await context.ui.dialog.prompt({ title: "Wake thread at…", placeholder: "30m, 2h, or 2026-10-01 09:00" });
    if (!input) return;
    const time = parseWakeTime(input, Date.now());
    if (!time) throw new Error("Choose a future time, or a duration such as 30m or 2h.");
    return time;
  };
  const snooze = async (sessionID: string, until: number) => {
    await updateLifecycle(draft => { draft.snoozedAt[sessionID] = Date.now(); });
    await save(draft => { draft.snoozed[sessionID] = until; delete draft.woke[sessionID]; });
  };
  const clear = (sessionID: string) => save(draft => { delete draft.snoozed[sessionID]; delete draft.woke[sessionID]; });
  const acknowledge = (sessionID: string) => {
    if (state.woke[sessionID]) return save(draft => { delete draft.woke[sessionID]; });
  };
  const raiseAttention = async (sessionID: string, created: number) => {
    if (!state.snoozed[sessionID] || created <= (lifecycle.snoozedAt[sessionID] ?? 0)) return;
    await save(draft => { delete draft.snoozed[sessionID]; draft.woke[sessionID] = true; });
  };
  const wake = async () => {
    const due = Object.entries(state.snoozed).filter(([, until]) => until <= Date.now()).map(([id]) => id);
    if (due.length) await save(draft => { for (const id of due) { delete draft.snoozed[id]; draft.woke[id] = true; } });
    return due;
  };
  const togglePin = (sessionID: string) => save(draft => {
    if (draft.pinned[sessionID]) delete draft.pinned[sessionID]; else draft.pinned[sessionID] = true;
  });
  const reenter = (sessionID: string) => updateLifecycle(draft => { draft.anchors[sessionID] = Date.now(); });
  const snapshot = (id: string) => ({ pinned: state.pinned[id], snoozed: state.snoozed[id], woke: state.woke[id], snoozedAt: lifecycle.snoozedAt[id], anchor: lifecycle.anchors[id] });
  const restore = async (id: string, value: ReturnType<typeof snapshot>) => {
    await save(draft => {
      for (const key of ["pinned", "snoozed", "woke"] as const) {
        if (value[key] === undefined) delete draft[key][id];
        else (draft[key] as Record<string, number | boolean>)[id] = value[key]!;
      }
    });
    await updateLifecycle(draft => {
      if (value.snoozedAt === undefined) delete draft.snoozedAt[id]; else draft.snoozedAt[id] = value.snoozedAt;
      if (value.anchor === undefined) delete draft.anchors[id]; else draft.anchors[id] = value.anchor;
    });
  };
  const unpin = (id: string) => save(draft => { delete draft.pinned[id]; });
  return { state, lifecycle, chooseSnooze, snooze, clear, acknowledge, wake, raiseAttention, reenter, togglePin, unpin, snapshot, restore };
}
