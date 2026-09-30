/** @jsxImportSource @opentui/solid */
import type { MouseEvent, Renderable, ScrollBoxRenderable, TextareaRenderable } from "@opentui/core";
import type { Plugin } from "@opencode/plugin/tui";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

const inside = (node: Renderable | undefined, x: number, y: number) => !!node
  && x >= node.x && x < node.x + node.width && y >= node.y && y < node.y + node.height;

export function createComposerResting(context: Plugin.Context, sessionID: () => string | undefined,
  card: () => Renderable | undefined, editor: () => TextareaRenderable | undefined) {
  const [resting, setResting] = createSignal(false);
  const expand = () => setResting(false);
  createEffect(() => {
    const id = sessionID();
    if (!id || context.data.session.permission.list(id)?.length || context.data.session.form.list(id)?.length) expand();
  });
  createEffect(() => {
    const input = editor();
    if (!input) return;
    input.editBuffer.on("content-changed", expand);
    input.on("focused", expand);
    onCleanup(() => { input.editBuffer.off("content-changed", expand); input.off("focused", expand); });
  });
  onMount(() => {
    const root = context.renderer.root;
    const previous = root.onMouseScroll;
    const handleScroll = (event: MouseEvent) => {
      previous?.call(root, event);
      if (!sessionID() || event.modifiers.ctrl || event.modifiers.shift) return;
      const input = editor(), surface = card();
      if (!input || !surface || input.plainText.includes("\n")) return;
      // Mouse events bubble after the native timeline handles them. Only a
      // transcript scroll can collapse the composer; menus and sidebar cannot.
      // Walk the event's ancestors, not every message in the session on each
      // wheel tick. Native dialogs live outside session-pane.
      let timeline: ScrollBoxRenderable | undefined;
      let target = event.target;
      while (target && target.id !== "session-pane") {
        if (!timeline && target.id.startsWith("scrollbox-") && target.visible
          && target.x >= surface.x && target.y < surface.y && target.width >= surface.width
          && inside(target, event.x, event.y)) timeline = target as ScrollBoxRenderable;
        target = target.parent as Renderable | null;
      }
      if (!target || !timeline || timeline.scrollHeight <= timeline.viewport.height) return;
      if (event.scroll?.direction === "up") setResting(true);
      else if (event.scroll?.direction === "down" && timeline.scrollTop + timeline.viewport.height >= timeline.scrollHeight) expand();
    };
    root.onMouseScroll = handleScroll;
    onCleanup(() => { if (root.onMouseScroll === handleScroll) root.onMouseScroll = previous; });
  });
  return { resting, expand };
}
