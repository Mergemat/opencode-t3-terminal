/** @jsxImportSource @opentui/solid */
import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import type { BoxRenderable, InputRenderable } from "@opentui/core";
import type { Plugin } from "@opencode/plugin/tui";
import { colors } from "./palette";
import { containsPointer } from "./controls";
import { SingleLine } from "./single-line";
import { ProjectMark } from "./project-mark";
import { TerminalIcon } from "./terminal-icon";

import { rankOptions, type PickerOption } from "./picker-rank";
export type { PickerOption } from "./picker-rank";
type PickerPresentation = { section?: string; numbered?: boolean; current?: string };

export function pick(context: Plugin.Context, title: string, options: PickerOption[], presentation: PickerPresentation = {}): Promise<string | undefined> {
  return new Promise(resolve => {
    let chosen: string | undefined;
    context.ui.dialog.show(() => <Picker context={context} title={title} options={options} presentation={presentation} select={value => {
      chosen = value;
      context.ui.dialog.clear();
    }} />, () => resolve(chosen));
    context.ui.dialog.set({ size: "medium", centered: true });
  });
}

// T3 Code's palette in a terminal: a search field, a group label, one line per result.
export function Picker(props: { context: Plugin.Context; title: string; options: PickerOption[]; presentation: PickerPresentation; select(value: string): void }) {
  let input: InputRenderable | undefined;
  let panel: BoxRenderable | undefined;
  const initial = Math.max(0, props.options.findIndex(option => option.value === props.presentation.current));
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal(initial);
  const [height, setHeight] = createSignal(props.context.renderer.height);
  const filtered = createMemo(() => rankOptions(props.options, query()));
  const limit = () => Math.max(3, Math.min(12, height() - 14));
  const [start, setStart] = createSignal(Math.max(0, initial - limit() + 1));
  const rows = () => filtered().slice(start(), start() + limit());
  // The window moves only when the selection leaves it.
  const move = (index: number) => {
    const next = Math.max(0, Math.min(filtered().length - 1, index));
    setSelected(next);
    if (next < start()) setStart(next);
    else if (next >= start() + limit()) setStart(next - limit() + 1);
  };
  onMount(() => {
    const resize = () => setHeight(props.context.renderer.height);
    props.context.renderer.on("resize", resize);
    onCleanup(() => props.context.renderer.off("resize", resize));
    // The host dialog is the only frame: take over its padding and color.
    let restore: (() => void) | undefined;
    queueMicrotask(() => {
      const shell = panel?.parent as BoxRenderable | undefined;
      if (shell) {
        const saved = { paddingTop: shell.paddingTop, paddingBottom: shell.paddingBottom, backgroundColor: shell.backgroundColor };
        shell.paddingTop = 0;
        shell.paddingBottom = 0;
        shell.backgroundColor = colors.composer;
        restore = () => { if (!shell.isDestroyed) Object.assign(shell, saved); };
      }
      input?.focus();
    });
    onCleanup(() => restore?.());
  });
  const select = () => { const option = filtered()[selected()]; if (option) props.select(option.value); };
  const label = () => props.presentation.section ?? props.title;
  return <box id="t3-picker" ref={node => { panel = node; }} backgroundColor={colors.composer} paddingTop={1} paddingBottom={1}
    onMouseScroll={event => { if (event.scroll?.direction === "down") move(selected() + 1); else if (event.scroll?.direction === "up") move(selected() - 1); }}>
    <box height={1} paddingLeft={2} paddingRight={2} flexDirection="row" gap={1}>
      <TerminalIcon name="search" color={colors.muted} width={2} />
      <input ref={node => { input = node; }} flexGrow={1} placeholder={`Search ${(props.presentation.section ?? props.title).toLocaleLowerCase().replace(/…$/, "")}…`} textColor={colors.text}
        backgroundColor={colors.composer} focusedBackgroundColor={colors.composer} placeholderColor={colors.faint}
        onInput={value => { setQuery(value); setSelected(0); setStart(0); }}
        onKeyDown={event => {
          const step = { pageup: -limit(), pagedown: limit(), up: -1, down: 1 }[event.name as "up"];
          const stop = () => { event.preventDefault(); event.stopPropagation(); };
          if (props.presentation.numbered && event.ctrl && /^[1-9]$/.test(event.name)) {
            stop(); const option = filtered()[Number(event.name) - 1]; if (option) props.select(option.value);
          } else if (step !== undefined) { stop(); move(selected() + step); }
          else if (event.name === "return") { stop(); select(); }
          else if (event.name === "escape") { stop(); props.context.ui.dialog.clear(); }
        }} />
      <text selectable={false} fg={colors.faint} flexShrink={0}>esc</text>
    </box>
    <box height={1} marginLeft={2} marginRight={2} border={["bottom"]} borderColor={colors.composerBorder} />
    <box height={1} marginTop={1} paddingLeft={2} paddingRight={2} flexDirection="row">
      <text selectable={false} fg={colors.muted} flexGrow={1}>{label()}</text>
      <Show when={filtered().length > limit()}><text selectable={false} fg={colors.faint}>{selected() + 1} of {filtered().length}</text></Show>
    </box>
    <For each={rows()}>{(option, index) => <PickerRow option={option} selected={selected() === start() + index()}
      hover={() => setSelected(start() + index())} select={() => props.select(option.value)} />}</For>
    <Show when={!filtered().length}><box height={3} paddingLeft={2} paddingTop={1}><text fg={colors.faint}>No matches</text></box></Show>
  </box>;
}

function PickerRow(props: { option: PickerOption; selected: boolean; hover(): void; select(): void }) {
  let row: BoxRenderable | undefined;
  let pressed = false;
  return <box ref={node => { row = node; }} height={1} flexDirection="row" paddingRight={2}
    backgroundColor={props.selected ? colors.surface : undefined} onMouseOver={props.hover}
    onMouseDown={event => { event.preventDefault(); event.stopPropagation(); pressed = event.button === 0; }}
    onMouseOut={event => { if (!containsPointer(row, event)) pressed = false; }}
    onMouseUp={event => {
      event.stopPropagation();
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(row, event);
      pressed = false;
      if (activate) props.select();
    }}>
    <text selectable={false} width={2} flexShrink={0} fg={colors.indigo}>{props.selected ? "▌" : " "}</text>
    <box flexDirection="row" gap={1} flexGrow={1} minWidth={0}>
      <Show when={props.option.project} fallback={<Show when={props.option.icon}>{icon =>
        <TerminalIcon name={icon()} color={props.option.iconColor ?? (props.selected ? colors.text : colors.muted)} width={2} />}</Show>}>
        <ProjectMark name={props.option.project!} />
      </Show>
      <SingleLine text={props.option.title} color={props.selected ? colors.text : colors.secondary} flexGrow={1} />
      <Show when={props.option.description}>
        <box width={Math.min(Bun.stringWidth(props.option.description!), 36)} flexShrink={1} minWidth={6}>
          <SingleLine text={props.option.description!} color={colors.faint} tail align="right" width="100%" />
        </box>
      </Show>
    </box>
  </box>;
}
