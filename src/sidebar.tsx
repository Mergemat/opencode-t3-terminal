/** @jsxImportSource @opentui/solid */
import { For, Show, createMemo, createSignal, onCleanup } from "solid-js";
import { colors } from "./palette";
import { Button } from "./controls";
import { ThreadCard, THREAD_CARD_HEIGHT } from "./thread-card";
import { SidebarShelf } from "./sidebar-shelf";
import type { Workspace } from "./workspace";
import { DraftCard } from "./thread-draft-card";

export const SIDEBAR_WIDTH = 30;

export function Sidebar(props: { workspace: Workspace; width: number }) {
  const workspace = props.workspace;
  const [height, setHeight] = createSignal(workspace.context.renderer.height);
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 60000);
  onCleanup(() => clearInterval(timer));
  const threads = workspace.activeSessions;
  const drafts = createMemo(() => workspace.drafts.sidebarEntries().filter(draft => !workspace.scope() || workspace.scope() === draft.directory).sort((a, b) => b.created - a.created));
  const running = createMemo(() => workspace.sessions().filter(session => workspace.status(session.id) === "Working").length);
  const activeHeight = () => threads().length ? Math.min(THREAD_CARD_HEIGHT * 2, threads().length * THREAD_CARD_HEIGHT) : 1;
  const shelfRows = (kind: "settled" | "snoozed") => {
    const sessions = kind === "snoozed" ? workspace.snoozed() : workspace.settled();
    const expanded = kind === "snoozed" ? workspace.preferences.showSnoozed : workspace.preferences.showSettled;
    return expanded ? sessions.length * 2 : sessions.some(session => session.id === workspace.active()) ? 2 : 0;
  };
  const shelfHeight = (kind: "settled" | "snoozed") => {
    const other = kind === "settled" ? "snoozed" : "settled";
    const headers = workspace.snoozed().length ? 6 : 3;
    const margins = Number(shelfRows(kind) > 0) + Number(shelfRows(other) > 0);
    const available = Math.max(2, height() - 8 - activeHeight() - headers - margins);
    return Math.max(2, Math.min(shelfRows(kind), available - Math.min(shelfRows(other), Math.floor(available / 2))));
  };
  const dispatch = (command: string) => () => workspace.context.keymap.dispatch(command);
  return <box id="t3-sidebar" position="absolute" left={0} top={0} bottom={0} width={props.width} zIndex={20}
    backgroundColor={colors.sidebar} border={["right"]} borderColor={colors.border} paddingLeft={1} paddingRight={1}
    onSizeChange={function() { setHeight(this.height); }}>
    <box height={3} flexShrink={0} paddingTop={1} flexDirection="row" gap={1}>
      <Button id="t3-sidebar-toggle" label="" icon="panel-left-close" width={3} run={dispatch("t3.sidebar")} />
      <text selectable={false} fg={colors.text}><b>OpenCode</b></text>
    </box>
    <box height={2} flexShrink={0} flexDirection="row" justifyContent="space-between">
      <Button id="t3-search" label="Search" icon="search" width={11} color={colors.secondary} run={dispatch("t3.search")} />
      <box flexDirection="row" flexShrink={0}>
        <Button id="t3-projects" label="" icon="folder" width={3} color={workspace.scope() ? colors.blue : colors.muted} run={dispatch("t3.scope")} />
        <Button id="t3-new-project" label="" icon="folder-plus" width={3} run={() => void workspace.addProject()} />
        <Button id="t3-new-thread" label="" icon="square-pen" width={3} color={colors.text} run={event => void workspace.chooseNewThread(!!event?.modifiers.shift)} />
      </box>
    </box>
    <scrollbox flexGrow={1} minHeight={activeHeight()} horizontalScrollbarOptions={{ visible: false }} verticalScrollbarOptions={{ visible: false }}>
      <Show when={workspace.loadError()}><text fg={colors.pink} wrapMode="word">Could not load threads. /refresh</text></Show>
      <For each={drafts()}>{draft => <DraftCard workspace={workspace} draft={draft} />}</For>
      <Show when={drafts().length}><box id="t3-draft-divider" height={2} flexShrink={0} marginLeft={1} marginRight={1}
        border={["top"]} borderColor={colors.border} /></Show>
      <For each={threads()}>{session => <ThreadCard workspace={workspace} session={session} now={now()} />}</For>
      <Show when={!threads().length && !drafts().length}><text fg={colors.muted} paddingLeft={1} paddingTop={1}>No active threads</text></Show>
    </scrollbox>
    <Show when={workspace.snoozed().length}>
      <SidebarShelf workspace={workspace} kind="snoozed" sessions={workspace.snoozed()} now={now()}
        expanded={workspace.preferences.showSnoozed} height={shelfHeight("snoozed")}
        toggle={() => void workspace.persist(draft => { draft.showSnoozed = !draft.showSnoozed; })} />
    </Show>
    <SidebarShelf workspace={workspace} kind="settled" sessions={workspace.settled()} now={now()}
      expanded={workspace.preferences.showSettled} height={shelfHeight("settled")}
      toggle={() => void workspace.persist(draft => { draft.showSettled = !draft.showSettled; })} />
    <Show when={workspace.undo.notice()}>{notice => <box height={2} flexShrink={0} paddingLeft={1} paddingRight={1} flexDirection="row" gap={1}>
      <text fg={colors.secondary} flexGrow={1}>{notice().label}</text>
      <Button id="t3-undo" label="Undo" width={6} color={colors.blue} run={workspace.undo.undo} />
    </box>}</Show>
    <box height={3} flexShrink={0} paddingTop={1} paddingBottom={1} flexDirection="row" justifyContent="space-between">
      <box flexDirection="row" gap={1}>
        <Button id="t3-settings" label="" icon="settings" width={3} run={dispatch("opencode.settings")} />
        <Button id="t3-pull-requests" label="" icon="git-pull-request" width={3} run={dispatch("t3.prs")} />
        <Button label="" icon="chart-no-axes-column" width={3} color={running() ? colors.blue : colors.muted} run={dispatch("stats.open")} />
      </box>
      <Button id="t3-refresh" label="" icon="refresh-cw" width={3} run={() => void workspace.refresh()} />
    </box>
  </box>;
}
