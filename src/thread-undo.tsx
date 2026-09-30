/** @jsxImportSource @opentui/solid */
import { createSignal, onCleanup } from "solid-js";

export function createThreadUndo(report: (error: unknown) => void) {
  const [notice, setNotice] = createSignal<{ label: string; id: string; created: number; restore(): Promise<void> }>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { clearTimeout(timer); setNotice(undefined); };
  const invalidate = (id: string, created = Infinity) => { const pending = notice(); if (pending?.id === id && created > pending.created) clear(); };
  const offer = (label: string, id: string, restore: () => Promise<void>) => {
    clear();
    setNotice({ label, id, created: Date.now(), restore });
    timer = setTimeout(clear, 5000);
  };
  const undo = async () => {
    const pending = notice();
    clear();
    try { await pending?.restore(); } catch (error) { report(error); }
  };
  onCleanup(clear);
  return { notice, offer, invalidate, undo };
}
