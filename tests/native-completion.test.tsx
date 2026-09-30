import { expect, test } from "bun:test";
import { BoxRenderable, ScrollBoxRenderable, TextRenderable } from "@opentui/core";
import { createTestRenderer } from "@opentui/core/testing";
import { mountCompletionMenu } from "../src/native-completion";

test("filtered slash rows render completely in the first frame", async () => {
  const screen = await createTestRenderer({ width: 100, height: 35 });
  const { renderer } = screen;
  const prompt = new BoxRenderable(renderer, { width: "100%", height: "100%" });
  const composer = new BoxRenderable(renderer, { position: "absolute", left: 10, top: 25, width: 80, height: 6 });
  const popup = new BoxRenderable(renderer, { position: "absolute", left: 10, top: 15, width: 80, height: 9 });
  const list = new ScrollBoxRenderable(renderer, { id: "scrollbox-native", height: 7, scrollY: true });
  const rows = (count: number) => {
    for (const child of list.getChildren()) child.destroyRecursively();
    for (let index = 0; index < count; index++) {
      const row = new BoxRenderable(renderer, { flexDirection: "row", height: 1 });
      const name = new TextRenderable(renderer, { id: `text-name-${index}` });
      name.add(`/command-${index} `);
      const description = new TextRenderable(renderer, { id: `text-description-${index}` });
      description.add(` Description ${index}`);
      row.add(name); row.add(description); list.add(row);
    }
  };
  renderer.root.add(prompt); prompt.add(composer); prompt.add(popup); popup.add(list);
  rows(12);
  await screen.renderOnce();
  const restore = mountCompletionMenu(prompt, composer);
  try {
    expect(restore).toBeDefined();
    await screen.flush();
    // OpenCode queues native dimensions when a query replaces the result rows.
    // Rendered height getters still report the previous, styled dimensions.
    rows(7); list.height = 7; popup.height = 9;
    await screen.renderOnce();
    const first = screen.captureCharFrame();
    expect(first).toContain("/command-6 Description 6");
    await screen.flush();
    expect(first).toBe(screen.captureCharFrame());
  } finally {
    restore?.(); renderer.destroy();
  }
});
