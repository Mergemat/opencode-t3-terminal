import { createSolidTransformPlugin } from "@opentui/solid/bun-plugin";
import { runtimeModuleIdForSpecifier } from "@opentui/core/runtime-plugin";

const sharedModules = new Set([
  "@opentui/core",
  "@opentui/solid",
  "solid-js",
  "solid-js/store",
]);

const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  naming: "tui.js",
  target: "bun",
  packages: "external",
  plugins: [createSolidTransformPlugin({
    moduleName: runtimeModuleIdForSpecifier("@opentui/solid"),
    resolvePath: specifier => sharedModules.has(specifier)
      ? runtimeModuleIdForSpecifier(specifier)
      : null,
  })],
});

if (!result.success) throw new AggregateError(result.logs, "Plugin build failed");
