/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js";
import { useRenderer } from "@opentui/solid";
import type { BoxRenderable, CliRenderer, MouseEvent, Renderable } from "@opentui/core";
import { colors } from "./palette";
import { SingleLine } from "./single-line";
import { TerminalIcon, type IconName } from "./terminal-icon";

export const containsPointer = (node: BoxRenderable | undefined, event: MouseEvent) => !!node
  && event.x >= node.x && event.x < node.x + node.width
  && event.y >= node.y && event.y < node.y + node.height;

export function ownsPointer(node: BoxRenderable | undefined, event: MouseEvent, renderer: CliRenderer) {
  if (!containsPointer(node, event)) return false;
  const hit = renderer.hitTest(event.x, event.y);
  const owns = (child: Renderable): boolean => child.num === hit || child.getChildren().some(owns);
  return owns(node!);
}

export function Button(props: { id?: string; label: string; icon?: IconName; iconWidth?: number; iconGap?: number; trailing?: IconName; separator?: string; width?: number | `${number}%`; color?: string; background?: string; compact?: boolean; disabled?: boolean; run(event?: MouseEvent): unknown }) {
  const renderer = useRenderer();
  let node: BoxRenderable | undefined;
  let pressed = false;
  const [hovered, setHovered] = createSignal(false);
  const color = () => props.disabled ? colors.border : hovered() ? colors.text : props.color ?? colors.muted;
  return <box id={props.id} ref={value => { node = value; }} height={1}
    width={props.width ?? Bun.stringWidth(props.label) + (props.icon ? (props.iconWidth ?? 3) + (props.label ? props.iconGap ?? 1 : 0) : props.compact ? 0 : 2) + (props.trailing ? 3 : 0)}
    flexDirection="row" gap={props.icon && props.label ? props.iconGap ?? 1 : props.trailing ? 1 : 0}
    flexShrink={0} paddingLeft={props.compact || props.icon ? 0 : 1} paddingRight={props.compact || props.icon ? 0 : 1} backgroundColor={hovered() && !props.disabled ? colors.surface : props.background}
    onMouseOver={() => setHovered(true)}
    onMouseOut={event => { if (!ownsPointer(node, event, renderer)) { setHovered(false); pressed = false; } }}
    onMouseDown={event => {
      event.stopPropagation(); event.preventDefault();
      pressed = event.button === 0 && !props.disabled;
    }}
    onMouseUp={event => {
      event.stopPropagation();
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(node, event);
      pressed = false;
      if (activate) props.run(event);
    }}>
    {props.icon && <TerminalIcon name={props.icon} color={color()} width={props.label ? props.iconWidth ?? 3 : typeof props.width === "number" ? props.width : 3} />}
    {props.label && <SingleLine text={props.label} color={color()} width={props.separator ? Bun.stringWidth(props.label) : undefined} flexGrow={props.separator ? 0 : 1} />}
    {props.separator && <box flexGrow={1} minWidth={1} border={["bottom"]} borderColor={props.separator} height={1} />}
    {props.trailing && <TerminalIcon name={props.trailing} color={color()} width={2} />}
  </box>;
}
