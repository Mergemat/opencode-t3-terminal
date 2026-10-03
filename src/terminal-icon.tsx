/** @jsxImportSource @opentui/solid */
import { TerminalImage, type IconAlign } from "./terminal-image";

export type IconName = "search" | "folder" | "folder-plus" | "square-pen" | "settings" | "chart-no-axes-column"
  | "circle-dashed" | "circle-alert" | "circle-check" | "shield-question" | "message-circle-question"
  | "refresh-cw" | "clock" | "alarm-clock" | "alarm-clock-off" | "check" | "undo-2" | "arrow-up" | "square" | "paperclip"
  | "chevron-down" | "chevron-up" | "pin" | "x" | "plus" | "git-branch" | "lock-keyhole-open" | "lock-keyhole"
  | "panel-left-close" | "panel-left-open"
  | "git-pull-request" | "git-pull-request-draft" | "git-pull-request-closed" | "git-merge"
  | "arrow-left" | "opencode" | "openai" | "anthropic" | "google";

export function TerminalIcon(props: { name: IconName; color: string; width?: number; align?: IconAlign }) {
  return <TerminalImage name={props.name} source={new URL(`../assets/icons/${props.name}.png`, import.meta.url)}
    color={props.color} width={props.width ?? 3} align={props.align} />;
}
