/** @jsxImportSource @opentui/solid */
import { Show, createSignal } from "solid-js";
import type { BoxRenderable } from "@opentui/core";
import type { SessionInfo } from "@opencode/client";
import path from "node:path";
import { ProjectMark } from "./project-mark";
import { colors } from "./palette";
import { Button, containsPointer, ownsPointer } from "./controls";
import { SingleLine } from "./single-line";
import { TerminalIcon } from "./terminal-icon";
import { providerIcon } from "./provider-mark";
import type { Workspace } from "./workspace";
import { createWorkingClock, workingLabel } from "./working-status";
import { wakeLabel } from "./thread-lifecycle";
import { age, needsAttention, shouldRecede, statusBadge } from "./thread-status";
import { RequestBadge } from "./request-badge";
import { threadMenu } from "./thread-menu";

export const THREAD_CARD_HEIGHT = 5;

// Shared pointer handling: left click opens, right click opens the thread menu.
function usePointer(workspace: Workspace, session: () => SessionInfo) {
  let card: BoxRenderable | undefined;
  let pressed = false;
  const [hovered, setHovered] = createSignal(false);
  return {
    hovered,
    props: {
      ref: (node: BoxRenderable) => { card = node; },
      onMouseOver: () => setHovered(true),
      onMouseMove: () => setHovered(true),
      onMouseOut: (event: any) => { if (!ownsPointer(card, event, workspace.context.renderer)) { setHovered(false); pressed = false; } },
      onMouseDown: (event: any) => { event.preventDefault(); pressed = event.button === 0 || event.button === 2; },
      onMouseUp: (event: any) => {
        const activate = pressed && !event.isDragging && containsPointer(card, event);
        pressed = false;
        if (!activate) return;
        if (event.button === 2) { event.stopPropagation(); void threadMenu(workspace, session()); }
        else if (event.button === 0) void workspace.open(session().id);
      },
    },
  };
}

export function ThreadCard(props: { workspace: Workspace; session: SessionInfo; now: number }) {
  const workspace = props.workspace;
  const pointer = usePointer(workspace, () => props.session);
  const active = () => workspace.active() === props.session.id;
  const status = () => workspace.status(props.session.id);
  const badge = () => statusBadge(status());
  const workingNow = createWorkingClock(() => status() === "Working");
  const name = () => path.basename(props.session.location.directory);
  const pinned = () => !!workspace.threads.state.pinned[props.session.id];
  const recede = () => shouldRecede(status(), active());
  const request = () => workspace.sourceControl.get(props.session);
  const diff = () => workspace.diffStat(props.session);
  const branch = () => workspace.branch(props.session);
  const queued = () => workspace.context.data.session.pending.list(props.session.id).length > 0;
  // T3 offers only the actions that can succeed.
  const canSnooze = () => !["Approval", "Input"].includes(status()) && !queued();
  const canSettle = () => !["Working", "Approval", "Input"].includes(status()) && !queued();
  const hasActions = () => canSnooze() || canSettle();
  const showActions = () => pointer.hovered() && hasActions();
  const label = () => status() === "Working" ? workingLabel(workspace.working.startedAt(props.session.id), workingNow())
    : badge() ? status() : age(workspace.activityAt(props.session), props.now);
  const actionsWidth = () => (canSnooze() ? 3 : 0) + (canSettle() ? 8 : 0);
  const titleColor = () => active() || needsAttention(status()) ? colors.text : recede() ? colors.muted : colors.secondary;
  return <box id={`t3-thread-${props.session.id}`} {...pointer.props} height={THREAD_CARD_HEIGHT}
    flexShrink={0} paddingLeft={1} paddingRight={1} paddingTop={1} paddingBottom={1}
    backgroundColor={active() ? colors.surface : pointer.hovered() ? colors.hover : undefined}>
    <box flexDirection="row" gap={1} height={1}>
      <ProjectMark name={name()} />
      <SingleLine text={name()} color={recede() ? colors.faint : colors.muted} flexGrow={1} />
      <Show when={pinned()}>
        <Button id={`t3-unpin-${props.session.id}`} label="" icon="pin" width={2} color={colors.faint} run={() => void workspace.togglePin(props.session.id)} />
      </Show>
      <Show when={showActions()} fallback={
        <box height={1} flexShrink={0} flexDirection="row" gap={1}>
          <Show when={badge()}>{value => status() === "Woke"
            ? <Button id={`t3-woke-${props.session.id}`} compact label="Woke" icon="alarm-clock" iconWidth={2} iconGap={0} color={value().color}
              run={() => void workspace.threads.acknowledge(props.session.id)} />
            : <box flexDirection="row" height={1} flexShrink={0}>
              <TerminalIcon name={value().icon} color={value().color} width={2} align="end" />
              <text selectable={false} fg={value().color}>{label()}</text>
            </box>}</Show>
          <Show when={!badge()}><text selectable={false} fg={colors.muted}>{label()}</text></Show>
        </box>
      }>
        <box height={1} width={actionsWidth()} flexShrink={0} flexDirection="row" gap={1}>
          <Show when={canSnooze()}><Button id={`t3-snooze-${props.session.id}`} label="" icon="clock" width={2} compact run={() => void workspace.snooze(props.session.id)} /></Show>
          <Show when={canSettle()}><Button id={`t3-settle-${props.session.id}`} label="Settle" icon="check" iconWidth={2} iconGap={0} width={8} compact run={() => void workspace.toggleSettle(props.session.id)} /></Show>
        </box>
      </Show>
    </box>
    <box height={1}>
      <SingleLine text={props.session.title || "New thread"} color={titleColor()} bold={needsAttention(status()) && !active()} width="100%" />
    </box>
    <box height={1} flexDirection="row" gap={1}>
      <box flexDirection="row" flexGrow={1} minWidth={0} gap={1}>
        <Show when={branch()}>
          <TerminalIcon name="git-branch" color={colors.faint} width={2} />
          <SingleLine text={branch()!} color={colors.faint} flexGrow={1} />
        </Show>
      </box>
      <Show when={request()}>{value => <RequestBadge request={value()} run={() => workspace.sourceControl.openRequest(props.session)} />}</Show>
      <Show when={diff()}>{value => <box flexDirection="row" flexShrink={0} height={1}>
        <text selectable={false} fg={colors.mint}>+{value().additions}</text>
        <text selectable={false} fg={colors.pink}> −{value().deletions}</text>
      </box>}</Show>
      <Show when={providerIcon(props.session.model?.providerID)}>{icon => <TerminalIcon name={icon()} color={colors.faint} width={2} align="end" />}</Show>
    </box>
  </box>;
}

// Snoozed and settled rows: one line, the return time or settle age, and one action on hover.
export function CompactThreadRow(props: { workspace: Workspace; session: SessionInfo; now: number; kind: "snoozed" | "settled" }) {
  const workspace = props.workspace;
  const pointer = usePointer(workspace, () => props.session);
  const active = () => workspace.active() === props.session.id;
  const snoozed = () => props.kind === "snoozed";
  const until = () => workspace.threads.state.snoozed[props.session.id];
  const woke = () => !!workspace.threads.state.woke[props.session.id];
  const request = () => workspace.sourceControl.get(props.session);
  const label = () => snoozed() && until() ? wakeLabel(until()!, props.now)
    : age(workspace.preferences.settled[props.session.id] ?? workspace.activityAt(props.session), props.now);
  return <box id={`t3-thread-${props.session.id}`} {...pointer.props} height={1} flexShrink={0} paddingLeft={1} paddingRight={1}
    backgroundColor={active() ? colors.surface : pointer.hovered() ? colors.hover : undefined}>
    <box flexDirection="row" gap={1} height={1}>
      <ProjectMark name={path.basename(props.session.location.directory)} dim={!active() && !pointer.hovered()} />
      <SingleLine text={props.session.title || "New thread"} color={active() || pointer.hovered() || woke() ? colors.text : colors.muted} flexGrow={1} />
      <Show when={workspace.threads.state.pinned[props.session.id]}><TerminalIcon name="pin" color={colors.faint} width={2} /></Show>
      <Show when={request()}>{value => <RequestBadge request={value()} run={() => workspace.sourceControl.openRequest(props.session)} />}</Show>
      <Show when={pointer.hovered()} fallback={
        <Show when={woke()} fallback={<text selectable={false} flexShrink={0} fg={snoozed() ? colors.blue : colors.faint}>{label()}</text>}>
          <Button compact label="Woke" icon="alarm-clock" iconWidth={2} iconGap={0} color={colors.yellow} run={() => void workspace.threads.acknowledge(props.session.id)} />
        </Show>
      }>
        <Button id={`t3-${snoozed() ? "wake" : "restore"}-${props.session.id}`} label="" icon={snoozed() ? "alarm-clock-off" : "undo-2"} width={3}
          run={() => void (snoozed() ? workspace.wake(props.session.id) : workspace.toggleSettle(props.session.id))} />
      </Show>
    </box>
  </box>;
}
