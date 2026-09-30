/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import type { TextareaRenderable } from "@opentui/core";
import { createMemo, createSignal, onCleanup, untrack } from "solid-js";

export type ThreadDraft = { id: string; directory: string; text: string; created: number };

export function createDrafts(context: Plugin.Context) {
  const [state, save] = context.storage.store("thread-drafts", { initial: { drafts: {} as Record<string, ThreadDraft> } });
  const [selected, setSelected] = createSignal<string>();
  const viewing = () => context.ui.router.current().type === "home" ? selected() : undefined;
  // Capture on entry, not on each edit. A fresh draft has no sidebar preview
  // until it has been left; reopening an invested draft keeps its row steady.
  const snapshot = createMemo<{ id?: string; draft?: ThreadDraft }>(previous => {
    const id = viewing();
    if (previous?.id === id) return previous;
    const draft = untrack(() => state.drafts[id ?? ""]);
    return { id, draft: draft?.text.trim() ? { ...draft } : undefined };
  }, {});
  const sidebarEntries = createMemo(() => Object.values(state.drafts).flatMap(draft => {
    if (draft.id === viewing()) return snapshot().draft ? [snapshot().draft!] : [];
    return draft.text.trim() ? [draft] : [];
  }));
  let editor: TextareaRenderable | undefined;
  let editorDirectory: string | undefined;
  let destination: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const report = (error: unknown) => context.ui.toast.show({ variant: "error", message: String(error) });
  const flush = async () => {
    clearTimeout(timer);
    const id = selected();
    if (!editor || editor.isDestroyed || !id || editorDirectory !== state.drafts[id]?.directory) return;
    const text = editor.plainText;
    await save(draft => { if (draft.drafts[id]) draft.drafts[id].text = text; });
  };
  const canLeave = () => {
    if (!editor || editor.isDestroyed || !editor.extmarks.getAll().length) return true;
    context.ui.toast.show({ variant: "info", message: "This draft has native attachments. Send it or remove its attachments before opening another draft." });
    return false;
  };
  const select = async (directory: string, id?: string) => {
    if (!canLeave()) return false;
    await flush();
    const empty = Object.values(state.drafts).find(draft => draft.directory === directory && !draft.text.trim());
    const next = id ?? empty?.id ?? crypto.randomUUID();
    if (!state.drafts[next]) await save(draft => { draft.drafts[next] = { id: next, directory, text: "", created: Date.now() }; });
    // Detach before changing identity so the departing editor cannot overwrite the destination.
    editor = undefined;
    destination = directory;
    setSelected(next);
    context.keymap.dispatch("session.new");
    context.keymap.dispatch("session.cd", directory);
    return true;
  };
  const attach = (input: TextareaRenderable, directory: string) => {
    editor = input;
    editorDirectory = directory;
    const id = selected();
    if (id && state.drafts[id]?.directory === directory && input.plainText !== state.drafts[id]!.text) input.setText(state.drafts[id]!.text);
    input.focus();
    return () => {
      void flush().catch(report);
      if (editor === input) editor = undefined;
    };
  };
  const changed = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void flush().catch(report), 150);
  };
  const initialize = async (input: TextareaRenderable, directory: string) => {
    if (destination && destination !== directory) return;
    destination = undefined;
    if (state.drafts[selected() ?? ""]?.directory === directory) return;
    const empty = Object.values(state.drafts).find(draft => draft.directory === directory && !draft.text.trim());
    const id = empty?.id ?? crypto.randomUUID();
    await save(draft => { draft.drafts[id] = { id, directory, text: input.plainText, created: empty?.created ?? Date.now() }; });
    setSelected(id);
  };
  onCleanup(() => clearTimeout(timer));
  return { state, selected, sidebarEntries, select, attach, changed, initialize, flush, canLeave };
}
