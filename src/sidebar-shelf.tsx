/** @jsxImportSource @opentui/solid */
import { For, Show } from "solid-js";
import type { SessionInfo } from "@opencode/client";
import { Button } from "./controls";
import { colors } from "./palette";
import { ThreadCard } from "./thread-card";
import type { Workspace } from "./workspace";

export function SidebarShelf(props: {
  workspace: Workspace; kind: "settled" | "snoozed"; sessions: SessionInfo[];
  expanded: boolean; height: number; now: number; toggle(): unknown;
}) {
  const snoozed = () => props.kind === "snoozed";
  const title = () => snoozed() ? "Snoozed" : "Settled";
  const visible = () => props.expanded ? props.sessions : props.sessions.filter(session => session.id === props.workspace.active());
  return <box flexShrink={0} paddingTop={1} paddingBottom={1}>
    <Button id={`t3-${props.kind}-shelf`} label={props.expanded ? title() : `${title()} (${props.sessions.length})`}
      width="100%" color={snoozed() ? colors.blue : colors.muted}
      separator={snoozed() ? colors.snoozedBorder : colors.border}
      trailing={props.expanded ? "chevron-up" : "chevron-down"} run={props.toggle} />
    <Show when={visible().length}>
      <scrollbox height={props.height} flexShrink={0} marginTop={1}
        horizontalScrollbarOptions={{ visible: false }} verticalScrollbarOptions={{ visible: false }}>
        <For each={visible()}>{session => <ThreadCard workspace={props.workspace} session={session}
          now={props.now} settled={props.kind === "settled"} snoozed={snoozed()} />}</For>
      </scrollbox>
    </Show>
  </box>;
}
