/** @jsxImportSource @opentui/solid */
import { Plugin } from "@opencode/plugin/tui";
import { Show, createSignal, onCleanup, onMount, untrack } from "solid-js";
import type { Renderable } from "@opentui/core";
import path from "node:path";
import { Sidebar, SIDEBAR_WIDTH } from "./sidebar";
import { createWorkspace, type Workspace } from "./workspace";
import { mountHomeComposer, mountWorkspaceLayout } from "./native-layout";
import { Composer } from "./composer";
import { pick } from "./picker";
import { colors } from "./palette";
import { icons } from "./icons";
import { Button } from "./controls";
import { SingleLine } from "./single-line";
import { projectBadge } from "./project-badge";
import { projectPickerOptions } from "./project-picker";

function WorkspaceShell(props: { workspace: Workspace }) {
  const workspace = props.workspace;
  let anchor: Renderable | undefined;
  const [width, setWidth] = createSignal(workspace.context.renderer.width);
  const [showSidebar, setShowSidebar] = createSignal(width() >= 72);
  const sidebarWidth = () => showSidebar() && width() >= 72 ? SIDEBAR_WIDTH : 0;
  const contentWidth = () => Math.min(90, width() - sidebarWidth() - 4);
  mountWorkspaceLayout(() => anchor, sidebarWidth, contentWidth);
  onMount(() => {
    const resize = () => setWidth(workspace.context.renderer.width);
    workspace.context.renderer.on("resize", resize);
    onCleanup(() => workspace.context.renderer.off("resize", resize));
    if (process.env.T3_TERMINAL_INSPECT) setTimeout(() => {
      const tree = (node: Renderable): unknown => ({ id: node.id, type: node.constructor.name, x: node.x, y: node.y, width: node.width,
        height: node.height, visible: node.visible, border: (node as any).border, background: (node as any).backgroundColor?.toString(), text: (node as any).textNode?.toChunks().map((chunk: any) => chunk.text).join(""), children: node.getChildren().map(tree) });
      void Bun.write(process.env.T3_TERMINAL_INSPECT!, JSON.stringify(tree(workspace.context.renderer.root), null, 2));
      void Bun.write(process.env.T3_TERMINAL_INSPECT! + ".commands", JSON.stringify(workspace.context.keymap.commands().map(command => ({ id: command.id, title: command.title })), null, 2));
      void Bun.write(process.env.T3_TERMINAL_INSPECT! + ".terminal", JSON.stringify({ capabilities: workspace.context.renderer.capabilities, resolution: workspace.context.renderer.resolution }, null, 2));
    }, Number(process.env.T3_TERMINAL_INSPECT_DELAY ?? 1500));
  });
  workspace.context.keymap.layer(() => ({ mode: "global", commands: [
    { id: "t3.sidebar", title: "Toggle project sidebar", group: "Workspace", bind: "ctrl+b", palette: true, slash: { name: "workspace" }, run: () => { setShowSidebar(value => !value); } },
    { id: "t3.new", title: "New thread in…", group: "Workspace", bind: "ctrl+n", palette: true, slash: { name: "new-thread" }, run: () => workspace.chooseNewThread() },
    { id: "t3.new-local", title: "New thread in current project", group: "Workspace", bind: "ctrl+shift+n", palette: true, run: () => workspace.chooseNewThread(true) },
    { id: "t3.project", title: "Add project", group: "Workspace", palette: true, slash: { name: "project" }, run: workspace.addProject },
    { id: "t3.scope", title: "Filter threads by project", group: "Workspace", palette: true, run: async () => {
      const selected = await pick(workspace.context, "Filter threads by project", [
        { title: "All projects", value: "all", description: "Show every project", badge: icons.folder },
        ...projectPickerOptions(workspace.projects(), workspace.directory()),
      ], { section: "Projects", back: true, numbered: true });
      if (selected) workspace.setScope(selected === "all" ? undefined : selected);
    } },
    { id: "t3.projects", title: "Choose draft project", group: "Workspace", bind: "ctrl+shift+p", palette: true, slash: { name: "projects" }, run: workspace.chooseProject },
    { id: "t3.prs", title: "Pull / merge requests", group: "Workspace", palette: true, slash: { name: "prs" }, run: () => workspace.sourceControl.browse() },
    { id: "t3.snooze", title: "Snooze thread", group: "Workspace", palette: true, slash: { name: "snooze" }, enabled: !!workspace.active(), run: async () => { if (workspace.active()) await workspace.snooze(workspace.active()!); } },
    { id: "t3.undo", title: "Undo thread action", group: "Workspace", bind: "ctrl+shift+z", palette: true, enabled: !!workspace.undo.notice(), run: workspace.undo.undo },
    { id: "t3.settle", title: workspace.preferences.settled[workspace.active() ?? ""] ? "Restore thread" : "Settle thread", group: "Workspace",
      bind: "ctrl+shift+s", palette: true, slash: { name: "settle" }, enabled: !!workspace.active(), run: () => workspace.toggleSettle() },
    { id: "t3.rename", title: "Rename thread", group: "Workspace", palette: true, slash: { name: "rename-thread" }, enabled: !!workspace.active(), run: workspace.rename },
    { id: "t3.refresh", title: "Refresh workspace", group: "Workspace", palette: true, slash: { name: "refresh" }, run: workspace.refresh },
    { id: "t3.activity", title: "Thread activity", group: "Workspace", palette: true, run: async () => {
      const selected = await pick(workspace.context, "Thread activity", workspace.sessions().filter(session => workspace.status(session.id) !== "Idle").map(session => ({
        title: session.title || "New thread", value: session.id, badge: icons.working,
        description: `${path.basename(session.location.directory)} · ${workspace.status(session.id)}`,
      })));
      if (selected) await workspace.open(selected);
    } },
    { id: "t3.search", title: "Find thread", group: "Workspace", bind: "ctrl+k", palette: true, slash: { name: "threads" }, run: async () => {
      const selected = await pick(workspace.context, "Threads", workspace.visibleSessions().map(session => ({
        title: session.title || "New thread", value: session.id, badge: projectBadge(path.basename(session.location.directory)).label,
        description: `${path.basename(session.location.directory)} · ${workspace.threads.state.snoozed[session.id] ? "Snoozed" : workspace.preferences.settled[session.id] ? "Settled" : workspace.status(session.id)}`,
      })));
      if (selected) await workspace.open(selected);
    } },
  ] }));
  const title = () => workspace.sessions().find(session => session.id === workspace.active())?.title || "New thread";
  return <>
    <box ref={node => { anchor = node; }} position="absolute" left={0} top={0} width={0} height={0} />
    <Show when={sidebarWidth() || showSidebar()}><Sidebar workspace={workspace} width={sidebarWidth() || Math.min(SIDEBAR_WIDTH, width())} /></Show>
    <box position="absolute" left={sidebarWidth()} right={0} top={0} height={3} border={["bottom"]} borderColor={colors.border}
      paddingLeft={2} paddingRight={2} paddingTop={1} flexDirection="row" gap={1}>
      <Show when={!sidebarWidth()}><Button label={icons.sidebar} width={3} run={() => setShowSidebar(value => !value)} /></Show>
      <SingleLine text={path.basename(workspace.directory())} color={colors.muted} width={Math.min(12, Bun.stringWidth(path.basename(workspace.directory())))} />
      <text selectable={false} fg={colors.muted} width={1} flexShrink={0}>/</text>
      <SingleLine text={title()} color={colors.text} bold flexGrow={1} />
      <Show when={!workspace.active()}><text fg={colors.muted}>New task</text></Show>
    </box>
  </>;
}

export default Plugin.define({
  id: "local.t3-terminal",
  setup(context) {
    // Workspace state lives in a component owner so event listeners clean up on reload.
    const [workspace, setWorkspace] = createSignal<Workspace>();
    context.ui.slot({ append: "app", render: () => {
      const state = untrack(() => createWorkspace(context));
      setWorkspace(state);
      return <WorkspaceShell workspace={state} />;
    } });
    context.ui.slot({ replace: "home.footer", render: () => {
      let footer: Renderable | undefined;
      mountHomeComposer(() => footer);
      return <box ref={node => { footer = node; }} height={1} />;
    } });
    context.ui.slot({ replace: "prompt.footer", render: props => <Composer context={context} workspace={workspace()} {...props} /> });
  },
});
