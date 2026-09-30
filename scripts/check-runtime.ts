import { ensureRuntimePluginSupport } from "@opentui/solid/runtime-plugin-support/configure";
import { render, type JSX } from "@opentui/solid";
import { createTestRenderer } from "@opentui/core/testing";

ensureRuntimePluginSupport({
  rewrite: { nodeModulesRuntimeSpecifiers: false, nodeModulesBareSpecifiers: false },
});

const entrypoint = Bun.resolveSync("./tui", process.cwd());
const { default: plugin } = await import(entrypoint);
const slots: { replace?: string; render(): JSX.Element }[] = [];
plugin.setup({ ui: { slot: (slot: typeof slots[number]) => slots.push(slot) } });
const footer = slots.find(slot => slot.replace === "home.footer");
if (!footer) throw new Error("Plugin did not register its home footer");

const screen = await createTestRenderer({ width: 100, height: 35 });
try {
  await render(() => footer.render(), screen.renderer);
  await screen.renderOnce();
  if (!screen.renderer.root.getChildren().some(child => child.height === 1)) {
    throw new Error("Plugin footer did not mount in the host render tree");
  }
  console.log("Rendered plugin footer with the host renderer");
} finally {
  screen.renderer.destroy();
}
