/** @jsxImportSource @opentui/solid */
import { Show, createSignal } from "solid-js";
import type { BoxRenderable } from "@opentui/core";
import type { SessionInfo } from "@opencode/client";
import path from "node:path";
import { ProjectMark } from "./project-mark";
import { colors } from "./palette";
import { Button, containsPointer, ownsPointer } from "./controls";
import { SingleLine } from "./single-line";
import { providerIcon } from "./provider-mark";
import { TerminalIcon, type IconName } from "./terminal-icon";
import type { Workspace } from "./workspace";
import { createWorkingClock, workingLabel } from "./working-status";
import { wakeLabel } from "./thread-lifecycle";

const statusColor = (status: string) => status === "Working" ? colors.blue
  : status === "Approval" ? colors.yellow : status === "Input" || status === "Failed" ? colors.pink
  : status === "Done" ? colors.mint : colors.muted;
const statusIcon = (status: string): IconName | undefined => status === "Working" ? "circle-dashed"
  : status === "Approval" || status === "Input" || status === "Failed" ? "circle-alert"
  : status === "Done" ? "check" : status === "Woke" ? "clock" : undefined;
const age = (timestamp: number, now: number) => {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  return minutes < 1 ? "now" : minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
};

export const THREAD_CARD_HEIGHT = 5;

export function ThreadCard(props: { workspace: Workspace; session: SessionInfo; now: number; settled?: boolean; snoozed?: boolean }) {
  const workspace = props.workspace;
  let card: BoxRenderable | undefined;
  let pressed = false;
  const [hovered, setHovered] = createSignal(false);
  const active = () => workspace.active() === props.session.id;
  const status = () => workspace.status(props.session.id);
  const workingNow = createWorkingClock(() => status() === "Working");
  const name = () => path.basename(props.session.location.directory);
  const branch = () => workspace.context.data.location.vcs.info(props.session.location)?.branch.current;
  const pinned = () => workspace.threads.state.pinned[props.session.id];
  const snoozed = () => workspace.threads.state.snoozed[props.session.id];
  const blocked = () => ["Working", "Approval", "Input"].includes(status());
  const snoozeBlocked = () => ["Approval", "Input"].includes(status());
  const request = () => workspace.sourceControl.get(props.session);
  const compact = () => props.settled || props.snoozed;
  const action = () => props.snoozed ? "Wake" : props.settled ? "Restore" : "Settle";
  const statusLabel = () => status() === "Working"
    ? workingLabel(workspace.working.startedAt(props.session.id), workingNow())
    : age(props.session.time.updated, props.now);
  const statusWidth = () => Math.max(10, Bun.stringWidth(statusLabel()) + (statusIcon(status()) ? 2 : 0));
  const menu = async () => {
    const choice = await workspace.context.ui.dialog.select({ title: "Thread actions", options: [
      { title: pinned() ? "Unpin" : "Pin", value: "pin" },
      { title: "Rename", value: "rename" },
      { title: action(), value: props.snoozed ? "wake" : "settle" },
      ...(!compact() ? [{ title: "Snooze", value: "snooze" }] : []),
      { title: "Pull / merge requests", value: "prs" },
    ] });
    if (choice === "pin") await workspace.togglePin(props.session.id);
    if (choice === "rename") await workspace.rename(props.session.id);
    if (choice === "settle") await workspace.toggleSettle(props.session.id);
    if (choice === "wake") await workspace.wake(props.session.id);
    if (choice === "snooze") await workspace.snooze(props.session.id);
    if (choice === "prs") await workspace.sourceControl.browse(props.session.location.directory, props.session.id);
  };
  return <box id={`t3-thread-${props.session.id}`} ref={node => { card = node; }}
    flexShrink={0} paddingLeft={1} paddingRight={1} paddingTop={compact() ? 0 : 1} paddingBottom={1}
    backgroundColor={active() || hovered() ? colors.surface : undefined}
    onMouseOver={() => setHovered(true)} onMouseMove={() => setHovered(true)}
    onMouseOut={event => { if (!ownsPointer(card, event, workspace.context.renderer)) { setHovered(false); pressed = false; } }}
    onMouseDown={event => { event.preventDefault(); pressed = event.button === 0 || event.button === 2; }}
    onMouseUp={event => {
      const activate = pressed && !event.isDragging && containsPointer(card, event);
      pressed = false;
      if (!activate) return;
      if (event.button === 2) { event.stopPropagation(); void menu(); }
      else if (event.button === 0) void workspace.open(props.session.id);
    }}>
    <Show when={!compact()} fallback={
      <box flexDirection="row" gap={1}>
        <ProjectMark name={name()} />
        <SingleLine text={props.session.title || "New thread"} color={colors.muted} flexGrow={1} />
        <Show when={props.snoozed && snoozed()}><text fg={colors.blue}>{wakeLabel(snoozed()!, props.now)}</text></Show>
        <box width={3} flexShrink={0}><Button id={`t3-${props.snoozed ? "wake" : "restore"}-${props.session.id}`} label="" icon="undo-2" width={3}
          color={props.snoozed ? colors.blue : colors.muted}
          run={() => void (props.snoozed ? workspace.wake(props.session.id) : workspace.toggleSettle(props.session.id))} /></box>
      </box>
    }>
      <box flexDirection="row" gap={1}>
        <ProjectMark name={name()} />
        <SingleLine text={name()} color={colors.muted} flexGrow={1} />
        <box width={statusWidth()} height={1} flexShrink={0}>
          <box visible={!hovered()} height={1} width="100%" flexDirection="row" justifyContent="flex-end">
            <Show when={statusIcon(status())}>{name => <TerminalIcon name={name()} color={statusColor(status())} width={2} />}</Show>
            <text selectable={false} fg={statusColor(status())}>{statusLabel()}</text>
          </box>
          <box visible={hovered()} position="absolute" right={0} top={0} width={10} height={1} flexDirection="row">
            <Button id={`t3-snooze-${props.session.id}`} label="" icon="clock" width={2} compact disabled={snoozeBlocked()} run={() => void workspace.snooze(props.session.id)} />
            <Button id={`t3-settle-${props.session.id}`} label="Settle" icon="check" iconWidth={2} iconGap={0} width={8} compact disabled={blocked()} run={() => void workspace.toggleSettle(props.session.id)} />
          </box>
        </box>
      </box>
      <box><SingleLine text={props.session.title || "New thread"} color={active() ? colors.text : colors.secondary} width="100%" /></box>
      <box minHeight={1} flexDirection="row" justifyContent="space-between" gap={1}>
        <Show when={pinned()}><TerminalIcon name="pin" color={colors.muted} width={2} /></Show>
        <box flexDirection="row" flexGrow={1} minWidth={0} gap={1}>
          <Show when={snoozed() || branch()}>
            <TerminalIcon name={snoozed() ? "clock" : "git-branch"} color={colors.muted} width={2} />
            <SingleLine text={snoozed() ? "Snoozed" : branch()!} color={colors.muted} flexGrow={1} />
          </Show>
        </box>
        <Show when={request()}>{request => <Button label={`#${request().number}`} icon="git-pull-request" iconWidth={2} compact width={Math.min(9, Bun.stringWidth(String(request().number)) + 4)}
          color={request().state === "merged" ? colors.blue : request().state === "closed" || request().checks === "failed" ? colors.pink : request().checks === "pending" ? colors.yellow : colors.mint}
          run={() => void workspace.sourceControl.openRequest(props.session)} />}</Show>
        <Show when={providerIcon(props.session.model?.providerID)}>{name => <TerminalIcon name={name()} color={colors.muted} width={2} />}</Show>
      </box>
    </Show>
  </box>;
}
