/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import { Show } from "solid-js";
import { Button } from "./controls";
import { colors } from "./palette";
import type { IconName } from "./terminal-icon";

export function ComposerControls(props: { context: Plugin.Context; model: string; modelIcon?: IconName; variant: string; permission: string; agent: string; width: number; resting: boolean; expand(): void }) {
  const narrow = () => props.width < 66;
  const permissionLabel = () => props.permission === "autoaccept" ? "Auto accept" : "Ask";
  const modelWidth = () => Math.min(Bun.stringWidth(props.model) + 3 + (props.modelIcon ? 3 : 0), Math.max(1,
    props.width - (props.resting ? 0 : 8) - Bun.stringWidth(props.agent) - 6 - (narrow() ? 0 : Bun.stringWidth(props.variant) + Bun.stringWidth(permissionLabel()) + 12)));
  const dispatch = (command: string) => () => { props.expand(); props.context.keymap.dispatch(command); };
  const options = () => <>
    <Button id="t3-variant" compact color={colors.secondary} label={props.variant} trailing="chevron-down" run={dispatch("variant.list")} />
    <text selectable={false} height={1} fg={colors.border}>│</text>
    <Button id="t3-permissions" compact color={colors.secondary} label={permissionLabel()} icon={props.permission === "autoaccept" ? "lock-keyhole-open" : "lock-keyhole"} iconWidth={2}
      trailing="chevron-down" run={dispatch("opencode.settings")} />
  </>;
  return <box gap={1} flexShrink={0}>
    <box height={1} flexDirection="row" gap={1}>
      <Button id="t3-model" compact label={props.model} icon={props.modelIcon} iconWidth={2} trailing="chevron-down"
        width={modelWidth()} color={colors.text} run={dispatch("model.list")} />
      <Show when={!narrow()}><text selectable={false} height={1} fg={colors.border}>│</text>{options()}</Show>
      <text selectable={false} height={1} fg={colors.border}>│</text>
      <Button id="t3-agent" compact color={colors.text} label={props.agent} trailing="chevron-down" run={dispatch("agent.list")} />
    </box>
    <Show when={narrow() && !props.resting}><box height={1} flexDirection="row" gap={1}>{options()}</box></Show>
  </box>;
}
