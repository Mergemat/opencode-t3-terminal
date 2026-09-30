/** @jsxImportSource @opentui/solid */
import type { BoxRenderable } from "@opentui/core";
import path from "node:path";
import { createSignal } from "solid-js";
import type { ThreadDraft } from "./drafts";
import type { Workspace } from "./workspace";
import { containsPointer, ownsPointer } from "./controls";
import { colors } from "./palette";
import { ProjectMark } from "./project-mark";
import { SingleLine } from "./single-line";
import { TerminalIcon } from "./terminal-icon";

export function DraftCard(props: { workspace: Workspace; draft: ThreadDraft }) {
  let card: BoxRenderable | undefined;
  let pressed = false;
  const [hovered, setHovered] = createSignal(false);
  const active = () => !props.workspace.active() && props.workspace.drafts.selected() === props.draft.id;
  return <box id={`t3-draft-${props.draft.id}`} ref={node => { card = node; }} height={4} flexShrink={0} padding={1}
    backgroundColor={active() || hovered() ? colors.surface : undefined}
    onMouseOver={() => setHovered(true)} onMouseMove={() => setHovered(true)}
    onMouseOut={event => { if (!ownsPointer(card, event, props.workspace.context.renderer)) { pressed = false; setHovered(false); } }}
    onMouseDown={event => { event.preventDefault(); pressed = event.button === 0; }}
    onMouseUp={event => { const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(card, event); pressed = false;
      if (activate) void props.workspace.drafts.select(props.draft.directory, props.draft.id).catch(error => props.workspace.context.ui.toast.show({ variant: "error", message: String(error) })); }}>
    <box flexDirection="row" gap={1} height={1}>
      <TerminalIcon name="square-pen" color={colors.yellow} width={1} />
      <ProjectMark name={path.basename(props.draft.directory)} />
      <SingleLine text={path.basename(props.draft.directory)} color={colors.muted} flexGrow={1} /></box>
    <SingleLine text={props.draft.text.split("\n").find(line => line.trim()) || "New thread"} color={colors.secondary} />
  </box>;
}
