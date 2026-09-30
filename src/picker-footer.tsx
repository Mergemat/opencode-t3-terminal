/** @jsxImportSource @opentui/solid */
import { Show } from "solid-js";
import { colors } from "./palette";

function Key(props: { label: string }) {
  return <text selectable={false} fg={colors.secondary} bg={colors.surface}>{props.label}</text>;
}

export function PickerFooter(props: { back: boolean; width: number }) {
  const narrow = () => props.width < (props.back ? 55 : 40);
  return <box backgroundColor={colors.composer} border={["top"]} borderColor={colors.composerBorder} paddingLeft={1} paddingRight={1} gap={narrow() ? 1 : 0}>
    <box flexDirection="row" gap={2}>
      <box flexDirection="row" gap={1}><Key label="↑" /><Key label="↓" /><text fg={colors.muted}>Navigate</text></box>
      <box flexDirection="row" gap={1}><Key label="Enter" /><text fg={colors.muted}>Select</text></box>
      <Show when={!narrow()}>
        <Show when={props.back}><box flexDirection="row" gap={1}><Key label="Backspace" /><text fg={colors.muted}>Back</text></box></Show>
        <box flexDirection="row" gap={1}><Key label="Esc" /><text fg={colors.muted}>Close</text></box>
      </Show>
    </box>
    <Show when={narrow()}><box flexDirection="row" gap={2}>
      <Show when={props.back}><box flexDirection="row" gap={1}><Key label="Backspace" /><text fg={colors.muted}>Back</text></box></Show>
      <box flexDirection="row" gap={1}><Key label="Esc" /><text fg={colors.muted}>Close</text></box>
    </box></Show>
  </box>;
}
