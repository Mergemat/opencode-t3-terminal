/** @jsxImportSource @opentui/solid */
// Renders the sidebar and picker with fixture threads to PNG, icons included.
// bun --preload @opentui/solid/preload --conditions=browser scripts/preview.tsx [outdir]
import { createTestRenderer } from "@opentui/core/testing";
import type { Renderable } from "@opentui/core";
import { render } from "@opentui/solid";
import { createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Resvg } from "@resvg/resvg-js";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "@opencode/plugin/tui";
import { createWorkspace } from "../src/workspace";
import { Sidebar } from "../src/sidebar";
import { Picker } from "../src/picker";
import { projectPickerOptions } from "../src/project-picker";
import { colors } from "../src/palette";
import { iconBox } from "../src/terminal-image";
import type { PullRequest } from "../src/git-host";

const out = process.argv[2] ?? "/tmp/t3-preview";
await mkdir(out, { recursive: true });
const now = Date.now();
const min = 60000;
const dir = (name: string) => `/Users/demo/projects/${name}`;
const session = (id: string, project: string, title: string, minutesAgo: number, extra: object = {}) =>
  ({ id, title, projectID: project, cost: 0, tokens: {}, location: { directory: dir(project) }, model: { providerID: "anthropic", modelID: "claude" },
    time: { created: now - minutesAgo * min - 3600000, updated: now - minutesAgo * min }, ...extra });
const sessions = [
  session("s1", "atlas", "Team workspaces", 2),
  session("s2", "orbit", "Usage-based billing", 7),
  session("s3", "docs", "Search experience", 10),
  session("s4", "atlas", "Integration tests", 13),
  session("s5", "orbit", "Build failure", 16, { outcome: "failed" }),
  session("s6", "docs", "API changelog", 19),
  session("s7", "atlas", "Review follow-ups", 40),
  session("s8", "orbit", "Pricing copy", 90),
  session("s9", "atlas", "Invite links", 300),
  session("s10", "docs", "SDK quickstart", 600),
  session("s11", "orbit", "Fix flaky CI", 1500),
];
const requests: Record<string, PullRequest> = {
  s1: { number: 142, title: "", url: "", state: "open", branch: "teams", draft: false },
  s2: { number: 143, title: "", url: "", state: "open", branch: "billing", draft: true },
  s3: { number: 87, title: "", url: "", state: "merged", branch: "search", draft: false },
  s4: { number: 139, title: "", url: "", state: "open", branch: "teams", draft: false },
  s5: { number: 91, title: "", url: "", state: "closed", branch: "billing", draft: false },
};
const seed: Record<string, any> = {
  workspace: { settled: { s9: now - 60 * min, s10: now - 300 * min, s11: now - 1400 * min }, projects: [], showSettled: true, showSnoozed: true },
  "thread-state": { pinned: { s1: true }, snoozed: { s7: now + 36 * min, s8: now + 24 * 60 * min }, woke: {} },
  "thread-seen": { visited: { s4: now - 30 * min, s6: now }, unread: {}, branches: { s1: "teams", s2: "billing", s3: "search", s4: "teams", s5: "billing", s6: "docs/changelog" } },
  "thread-drafts": { drafts: { d1: { id: "d1", directory: dir("docs"), text: "Document the permission model", created: now - 5 * min } } },
};
const messages: Record<string, any[]> = {
  s1: [{ type: "user", time: { created: now - 125000 } }],
  s4: [{ type: "assistant", time: { created: now - 6 * min, completed: now - 5 * min } }],
};

async function frame(name: string, width: number, height: number, view: (context: Plugin.Context) => any, hover?: [number, number]) {
  const screen = await createTestRenderer({ width, height });
  const context = {
    location: { directory: dir("atlas") }, renderer: screen.renderer, theme: undefined,
    storage: {
      store(key: string, { initial }: { initial: object }) {
        const [state, setState] = createStore({ ...initial, ...seed[key] });
        return [state, async (change: (value: any) => void) => setState(produce(change))];
      },
      memory(_key: string, { initial }: { initial: object }) { const [state, setState] = createStore(initial); return [state, (change: (value: any) => void) => setState(produce(change))]; },
    },
    client: { project: { list: async () => [] }, session: { list: async () => ({ data: [], cursor: {} }),
      diff: async ({ sessionID }: { sessionID: string }) => sessionID === "s4" ? [{ additions: 124, deletions: 18 }] : sessionID === "s6" ? [{ additions: 12, deletions: 3 }] : [] } },
    data: {
      on: () => () => {},
      session: { list: () => sessions, get: (id: string) => sessions.find(item => item.id === id), sync: async () => {},
        status: (id: string) => id === "s1" ? "running" : "idle", message: { list: (id: string) => messages[id] ?? [] },
        permission: { list: (id: string) => id === "s2" ? [{}] : [] }, form: { list: (id: string) => id === "s3" ? [{}] : [] }, pending: { list: () => [] } },
      location: { default: () => ({ directory: dir("atlas") }), vcs: { sync: async () => {}, info: () => undefined } },
    },
    keymap: { dispatch() {}, shortcuts: () => ["ctrl+shift+z"], layer() {} },
    ui: { router: { current: () => ({ type: "session", sessionID: "s1" }), navigate() {} }, toast: { show() {} }, dialog: { prompt: async () => undefined, show() {}, set() {}, clear() {} } },
  } as unknown as Plugin.Context;
  let dispose = () => {};
  await createRoot(async stop => { dispose = stop; await render(() => view(context), screen.renderer); });
  for (let pass = 0; pass < 3; pass++) { await screen.renderOnce(); await new Promise(resolve => setTimeout(resolve, 30)); }
  if (hover) { await screen.mockMouse.moveTo(hover[0], hover[1]); await screen.renderOnce(); await screen.renderOnce(); }
  const spans = screen.captureSpans();
  const images: { name: string; color?: string; source: any; scale: number; x: number; y: number; w: number; h: number }[] = [];
  const walk = (node: Renderable) => {
    const image = (node as any).t3Image;
    // Clipped images never reach the terminal: the real layer hit-tests them too.
    if (image && node.visible && node.width > 0 && screen.renderer.hitTest(node.x + Math.floor(node.width / 2), node.y) === node.num) images.push({ name: image.name(), color: image.color(), source: image.source(), scale: image.scale(), align: image.align(), x: node.x, y: node.y, w: node.width, h: node.height });
    node.getChildren().forEach(walk);
  };
  walk(screen.renderer.root);
  await writePng(path.join(out, `${name}.png`), spans, images);
  dispose(); screen.renderer.destroy();
}

const hex = (rgba: any, otherwise: string) => {
  const [r, g, b, a] = rgba.toInts();
  return a === 0 ? otherwise : "#" + [r, g, b].map((part: number) => part.toString(16).padStart(2, "0")).join("");
};
const escape = (text: string) => text.replace(/[&<>]/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[value]!);

async function writePng(file: string, frame: ReturnType<Awaited<ReturnType<typeof createTestRenderer>>["captureSpans"]>, images: any[]) {
  const cw = 9, ch = 20, scale = 2;
  let body = "";
  frame.lines.forEach((line, row) => {
    let column = 0;
    for (const span of line.spans) {
      const bg = hex(span.bg, colors.background);
      body += `<rect x="${column * cw}" y="${row * ch}" width="${span.width * cw}" height="${ch}" fill="${bg}"/>`;
      if (span.text.trim()) body += `<text x="${column * cw}" y="${row * ch + 14}" fill="${hex(span.fg, colors.text)}" font-weight="${span.attributes & 1 ? 700 : 400}" textLength="${span.width * cw}" lengthAdjust="spacingAndGlyphs" xml:space="preserve">${escape(span.text)}</text>`;
      column += span.width;
    }
  });
  let defs = "";
  for (const [index, image] of images.entries()) {
    const bytes = image.source instanceof URL ? await Bun.file(image.source).bytes() : image.source;
    const data = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
    const grid = bytes.length && bytes[16] === 0 && bytes[17] === 0 && bytes[18] === 0 && bytes[19] <= 16 ? bytes[19] : undefined;
    const box = iconBox(image.w * cw * scale, image.h * ch * scale, image.h, image.scale, grid, image.align);
    const size = box.size / scale, x = image.x * cw + box.left / scale, y = image.y * ch + box.top / scale;
    const sampling = grid ? ` image-rendering="optimizeSpeed"` : "";
    if (!image.color) { body += `<image href="${data}" x="${x}" y="${y}" width="${size}" height="${size}"${sampling}/>`; continue; }
    defs += `<mask id="m${index}"><image href="${data}" x="${x}" y="${y}" width="${size}" height="${size}"${sampling}/></mask>`;
    body += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${image.color}" mask="url(#m${index})"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${frame.cols * cw}" height="${frame.rows * ch}" font-family="Menlo" font-size="14"><defs>${defs}</defs>${body}</svg>`;
  await Bun.write(file, new Resvg(svg, { fitTo: { mode: "zoom", value: scale }, font: { loadSystemFonts: true, defaultFontFamily: "Menlo" } }).render().asPng());
  console.log(file);
}

await frame("sidebar", 30, 66, context => { const workspace = createWorkspace(context); for (const key in requests) void 0;
  workspace.sourceControl.get = (item: { id: string }) => requests[item.id]; return <Sidebar workspace={workspace} width={30} />; });
await frame("sidebar-hover", 30, 40, context => { const workspace = createWorkspace(context);
  workspace.sourceControl.get = (item: { id: string }) => requests[item.id]; return <Sidebar workspace={workspace} width={30} />; }, [10, 27]);
const projects = ["atlas", "orbit", "docs", "fluenc", "opencode-v2", "t3-terminal"].map(name => ({ name, directory: dir(name) }));
await frame("picker", 64, 24, context => <Picker context={context} title="New thread in…" presentation={{ section: "Projects", numbered: true, current: dir("atlas") }}
  options={[{ title: "All projects", value: "all", icon: "folder" }, ...projectPickerOptions(projects, dir("atlas"))]} select={() => {}} />);
await frame("picker-threads", 64, 24, context => <Picker context={context} title="Threads" presentation={{}}
  options={sessions.slice(0, 7).map(item => ({ title: item.title, value: item.id, project: path.basename(item.location.directory), description: path.basename(item.location.directory) }))} select={() => {}} />);
process.exit(0);
