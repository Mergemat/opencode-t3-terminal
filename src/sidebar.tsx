/** @jsxImportSource @opentui/solid */
import { For, Show, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";
import path from "node:path";
import { colors } from "./palette";
import { Button } from "./controls";
import { CompactThreadRow, ThreadCard } from "./thread-card";
import type { Workspace } from "./workspace";
import { DraftCard } from "./thread-draft-card";

export const SIDEBAR_WIDTH = 30;
// T3 Code pages settled history: recent lookups are common, the tail is not.
const SETTLED_INITIAL = 10;
const SETTLED_PAGE = 25;

const shortcutLabel = (shortcut: string | undefined) => shortcut?.split("+")
  .map(key => ({ ctrl: "⌃", shift: "⇧", alt: "⌥", option: "⌥", meta: "⌘", super: "⌘", cmd: "⌘" })[key.toLowerCase()] ?? key.toUpperCase()).join("");

function ShelfHeader(props: { id: string; title: string; count: number; expanded: boolean; snoozed?: boolean; toggle(): void }) {
  return <box flexShrink={0} height={1} marginTop={1} marginBottom={props.expanded ? 1 : 0} paddingLeft={1} paddingRight={1}>
    <Button id={props.id} label={props.expanded ? props.title : `${props.title} (${props.count})`} width="100%"
      color={props.snoozed ? colors.blue : colors.muted} separator={props.snoozed ? colors.snoozedBorder : colors.border}
      trailing={props.expanded ? "chevron-up" : "chevron-down"} run={props.toggle} />
  </box>;
}

export function Sidebar(props: { workspace: Workspace; width: number }) {
  const workspace = props.workspace;
  const [now, setNow] = createSignal(Date.now());
  const timer = setInterval(() => setNow(Date.now()), 60000);
  onCleanup(() => clearInterval(timer));
  const [viewport, setViewport] = createSignal(0);
  const [settledCount, setSettledCount] = createSignal(SETTLED_INITIAL);
  createEffect(on(workspace.scope, () => setSettledCount(SETTLED_INITIAL), { defer: true }));
  const threads = workspace.activeSessions;
  const drafts = createMemo(() => workspace.drafts.sidebarEntries().filter(draft => !workspace.scope() || workspace.scope() === draft.directory).sort((a, b) => b.created - a.created));
  // A collapsed shelf still shows the thread you have open.
  const shelf = (sessions: ReturnType<typeof workspace.settled>, expanded: boolean) =>
    expanded ? sessions : sessions.filter(session => session.id === workspace.active());
  const snoozedRows = createMemo(() => shelf(workspace.snoozed(), workspace.preferences.showSnoozed));
  const settledRows = createMemo(() => {
    const all = workspace.settled();
    if (!workspace.preferences.showSettled) return shelf(all, false);
    const visible = all.slice(0, settledCount());
    const open = all.slice(settledCount()).find(session => session.id === workspace.active());
    return open ? [...visible, open] : visible;
  });
  const hiddenSettled = () => workspace.preferences.showSettled ? workspace.settled().length - settledRows().length : 0;
  const scopeName = () => workspace.scope() ? path.basename(workspace.scope()!) : undefined;
  const empty = () => !threads().length && !drafts().length && !workspace.snoozed().length && !workspace.settled().length;
  const dispatch = (command: string) => () => workspace.context.keymap.dispatch(command);
  const undoShortcut = () => shortcutLabel(workspace.context.keymap.shortcuts?.("t3.undo")[0]);
  return <box id="t3-sidebar" position="absolute" left={0} top={0} bottom={0} width={props.width} zIndex={20}
    backgroundColor={colors.sidebar} border={["right"]} borderColor={colors.border}>
    <box height={3} flexShrink={0} paddingTop={1} paddingLeft={1} paddingRight={1} flexDirection="row" gap={1}>
      <Button id="t3-sidebar-toggle" label="" icon="panel-left-close" width={3} run={dispatch("t3.sidebar")} />
      <text selectable={false} fg={colors.text}><b>OpenCode</b></text>
    </box>
    <box height={2} flexShrink={0} paddingLeft={1} paddingRight={1} flexDirection="row" justifyContent="space-between">
      <Button id="t3-search" label="Search" icon="search" width={11} color={colors.secondary} run={dispatch("t3.search")} />
      <box flexDirection="row" flexShrink={0}>
        {/* The scope control shows the project it filters to, as T3 Code does. */}
        <Show when={workspace.scope()} fallback={<Button id="t3-projects" label="" icon="folder" width={3} run={dispatch("t3.scope")} />}>
          {scope => <Button id="t3-projects" label="" mark={path.basename(scope())} compact width={3} run={dispatch("t3.scope")} />}
        </Show>
        <Button id="t3-new-project" label="" icon="folder-plus" width={3} run={() => void workspace.addProject()} />
        <Button id="t3-new-thread" label="" icon="square-pen" width={3} color={colors.text} run={event => void workspace.chooseNewThread(!!event?.modifiers.shift)} />
      </box>
    </box>
    <scrollbox flexGrow={1} paddingLeft={1} paddingRight={1} horizontalScrollbarOptions={{ visible: false }} verticalScrollbarOptions={{ visible: false }}
      onSizeChange={function() { setViewport(this.height); }}>
      {/* One list, as in T3 Code: the shelves sit at the bottom until the list outgrows the view. */}
      <box minHeight={viewport()} flexShrink={0}>
        <Show when={workspace.loadError()}><text fg={colors.pink} wrapMode="word" paddingLeft={1}>Could not load threads. /refresh</text></Show>
        <For each={drafts()}>{draft => <DraftCard workspace={workspace} draft={draft} />}</For>
        <Show when={drafts().length}><box id="t3-draft-divider" height={1} flexShrink={0} marginLeft={1} marginRight={1}
          border={["bottom"]} borderColor={colors.border} /></Show>
        <For each={threads()}>{session => <ThreadCard workspace={workspace} session={session} now={now()} />}</For>
        <Show when={empty()}>
          <text fg={colors.muted} paddingLeft={1} paddingTop={1}>{scopeName() ? `No threads in ${scopeName()} yet` : "No threads yet"}</text>
        </Show>
        <box flexGrow={1} minHeight={0} />
        <Show when={workspace.snoozed().length}>
          <ShelfHeader id="t3-snoozed-shelf" title="Snoozed" count={workspace.snoozed().length} snoozed
            expanded={workspace.preferences.showSnoozed} toggle={() => void workspace.persist(draft => { draft.showSnoozed = !draft.showSnoozed; })} />
          <For each={snoozedRows()}>{session => <CompactThreadRow workspace={workspace} session={session} now={now()} kind="snoozed" />}</For>
        </Show>
        <Show when={!empty()}>
          <ShelfHeader id="t3-settled-shelf" title="Settled" count={workspace.settled().length}
            expanded={workspace.preferences.showSettled} toggle={() => void workspace.persist(draft => { draft.showSettled = !draft.showSettled; })} />
          <For each={settledRows()}>{session => <CompactThreadRow workspace={workspace} session={session} now={now()} kind="settled" />}</For>
          <Show when={hiddenSettled() > 0}>
            <box height={1} flexShrink={0} paddingLeft={1}>
              <Button id="t3-settled-more" label={`Show ${Math.min(hiddenSettled(), SETTLED_PAGE)} more`} icon="plus" iconWidth={2} compact
                run={() => setSettledCount(count => count + SETTLED_PAGE)} />
            </box>
          </Show>
        </Show>
      </box>
    </scrollbox>
    <Show when={workspace.undo.notice()}>{notice => <box height={2} flexShrink={0} paddingTop={1} paddingLeft={2} paddingRight={1} flexDirection="row" gap={1}>
      <text selectable={false} fg={colors.secondary} flexGrow={1}>{notice().label}</text>
      <Button id="t3-undo" compact label={undoShortcut() ? `${undoShortcut()} undo` : "Undo"} color={colors.blue} run={workspace.undo.undo} />
    </box>}</Show>
    <box height={3} flexShrink={0} paddingTop={1} paddingBottom={1} paddingLeft={1} paddingRight={1} flexDirection="row" gap={1}>
      <Button id="t3-settings" label="" icon="settings" width={3} run={dispatch("opencode.settings")} />
      <Button id="t3-pull-requests" label="" icon="git-pull-request" width={3} run={dispatch("t3.prs")} />
      <Button id="t3-stats" label="" icon="chart-no-axes-column" width={3} run={dispatch("stats.open")} />
    </box>
  </box>;
}
