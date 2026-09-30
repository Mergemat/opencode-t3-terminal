/** @jsxImportSource @opentui/solid */
import { TerminalImage } from "./terminal-image";

export type IconName = "search" | "folder" | "folder-plus" | "square-pen" | "settings" | "chart-no-axes-column"
  | "circle-dashed" | "circle-alert" | "refresh-cw" | "clock" | "check" | "undo-2" | "arrow-up" | "square" | "paperclip"
  | "chevron-down" | "chevron-up" | "pin" | "git-branch" | "lock-keyhole-open" | "lock-keyhole" | "panel-left-close"
  | "git-pull-request" | "arrow-left" | "opencode" | "openai" | "anthropic" | "google";

export function TerminalIcon(props: { name: IconName; color: string; width?: number }) {
  return <TerminalImage name={props.name} source={new URL(`../assets/icons/${props.name}.png`, import.meta.url)}
    color={props.color} width={props.width ?? 3} />;
}
