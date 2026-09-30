/** @jsxImportSource @opentui/solid */
import type { Renderable } from "@opentui/core";
import { createEffect, onCleanup, onMount } from "solid-js";

// OpenCode 2.0.6 exposes composer/footer slots, but no outer-layout slot.
// Keep the two host-layout adjustments here so navigation never owns the editor.
export function mountWorkspaceLayout(node: () => Renderable | undefined, sidebarWidth: () => number, contentWidth: () => number) {
  let host: Renderable | undefined;
  let content: Renderable | undefined;
  onMount(() => {
    queueMicrotask(() => {
      host = node()?.parent ?? undefined;
      if (!host) return;
      host.paddingLeft = sidebarWidth();
      host.paddingTop = 3;
      content = host.getChildren().find(child => child.visible && child !== node());
      if (content) { content.maxWidth = contentWidth(); content.alignSelf = "center"; content.width = "100%"; }
    });
  });
  createEffect(() => {
    const width = sidebarWidth();
    const maximum = contentWidth();
    if (host) host.paddingLeft = width;
    if (content) content.maxWidth = maximum;
  });
  onCleanup(() => {
    if (host && !host.isDestroyed) { host.paddingLeft = 0; host.paddingTop = 0; }
  });
}

export function mountHomeComposer(node: () => Renderable | undefined) {
  const changed: Array<{ node: Renderable; visible: boolean }> = [];
  const hasEditor = (value: Renderable): boolean => value.id.startsWith("textarea-") || value.id === "t3-composer" || value.getChildren().some(hasEditor);
  onMount(() => {
    queueMicrotask(() => {
      const footer = node()?.parent;
      const home = footer?.parent?.getChildren().find(child => child !== footer && child.visible);
      if (!home) return;
      const children = home.getChildren();
      const composer = children.find(hasEditor);
      if (!composer) return;
      // Find the editor by identity. Filtering visible children changes indices on reload
      // and used to hide the prompt itself after the first generation hid the splash.
      for (const child of children) {
        changed.push({ node: child, visible: child.visible });
        if (child === composer) { child.visible = true; child.maxWidth = 100; child.height = "auto"; child.flexShrink = 0; }
        else if (child === children[0]) { child.height = 0; child.flexGrow = 1; }
        else if (child !== children[0]) child.visible = false;
      }
    });
  });
  onCleanup(() => {
    for (const value of changed) if (!value.node.isDestroyed) {
      value.node.visible = value.visible;
    }
  });
}
