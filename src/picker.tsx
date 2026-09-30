/** @jsxImportSource @opentui/solid */
import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import type { BoxRenderable, InputRenderable } from "@opentui/core";
import type { Plugin } from "@opencode/plugin/tui";
import { colors } from "./palette";
import { Button, containsPointer } from "./controls";
import { SingleLine } from "./single-line";
import { ProjectMark } from "./project-mark";
import { TerminalIcon } from "./terminal-icon";
import { PickerFooter } from "./picker-footer";

export type PickerOption = { value: string; title: string; description: string; badge: string; project?: string };
type PickerPresentation = { section?: string; back?: boolean; numbered?: boolean };

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

function Picker(props: { context: Plugin.Context; title: string; options: PickerOption[]; presentation: PickerPresentation; select(value: string): void }) {
  let input: InputRenderable | undefined;
  let panel: BoxRenderable | undefined;
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal(0);
  const [width, setWidth] = createSignal(60);
  const [height, setHeight] = createSignal(props.context.renderer.height);
  const filtered = createMemo(() => {
    const terms = query().toLocaleLowerCase().trim().split(/\s+/);
    return props.options.filter(option => terms.every(term => `${option.title} ${option.description}`.toLocaleLowerCase().includes(term)));
  });
  const limit = () => Math.max(1, Math.min(6, Math.floor((height() - 12) / (props.presentation.section === "Projects" ? 2 : 3))));
  const start = () => Math.max(0, selected() - limit() + 1);
  const rows = () => filtered().slice(start(), start() + limit());
  onMount(() => {
    const resize = () => setHeight(props.context.renderer.height);
    props.context.renderer.on("resize", resize);
    onCleanup(() => props.context.renderer.off("resize", resize));
    // This host wrapper adds a leading blank stripe. The picker owns its chrome.
    let restore: (() => void) | undefined;
    queueMicrotask(() => {
      const shell = panel?.parent as BoxRenderable | undefined;
      if (shell) {
        const padding = shell.paddingTop;
        const background = shell.backgroundColor;
        shell.paddingTop = 0;
        shell.backgroundColor = colors.sidebar;
        restore = () => { if (!shell.isDestroyed) { shell.paddingTop = padding; shell.backgroundColor = background; } };
      }
      input?.focus();
    });
    onCleanup(() => restore?.());
  });
  const select = () => { const option = filtered()[selected()]; if (option) props.select(option.value); };
  const back = () => { props.context.ui.dialog.clear(); setTimeout(() => props.context.keymap.dispatch("command.palette.show"), 0); };
  return <box id="t3-picker" ref={node => { panel = node; }} backgroundColor={colors.sidebar} border borderStyle="single" borderColor={colors.composerBorder}
    onSizeChange={function() { setWidth(this.width); }}>
    <box paddingTop={1} paddingBottom={1} paddingLeft={1} paddingRight={1} flexDirection="row" gap={1}>
      <Show when={props.presentation.back} fallback={<TerminalIcon name="search" color={colors.muted} width={2} />}>
        <Button id="t3-picker-back" label="" icon="arrow-left" width={2} run={back} />
      </Show>
      <input ref={node => { input = node; }} flexGrow={1} placeholder="Search…" textColor={colors.text}
        backgroundColor={colors.sidebar} focusedBackgroundColor={colors.sidebar} placeholderColor={colors.muted}
        onInput={value => { setQuery(value); setSelected(0); }}
        onKeyDown={event => {
          if (props.presentation.numbered && event.ctrl && /^[1-9]$/.test(event.name)) {
            event.preventDefault(); event.stopPropagation();
            const option = filtered()[Number(event.name) - 1]; if (option) props.select(option.value);
          } else if (props.presentation.back && event.name === "backspace" && !query()) {
            event.preventDefault(); event.stopPropagation(); back();
          } else if (event.name === "down" || event.name === "up") {
            event.preventDefault(); event.stopPropagation();
            setSelected(value => Math.max(0, Math.min(filtered().length - 1, value + (event.name === "down" ? 1 : -1))));
          } else if (event.name === "return") { event.preventDefault(); event.stopPropagation(); select(); }
          else if (event.name === "escape") { event.preventDefault(); event.stopPropagation(); props.context.ui.dialog.clear(); }
        }} />
    </box>
    <box paddingLeft={1} paddingBottom={1} height={2}><text fg={colors.muted}>{props.presentation.section ?? props.title}</text></box>
    <For each={rows()}>{(option, index) => <PickerRow option={option} selected={selected() === start() + index()}
      shortcut={props.presentation.numbered && start() + index() < 9 ? start() + index() + 1 : undefined}
      hover={() => setSelected(start() + index())} select={() => props.select(option.value)} />}</For>
    <Show when={!filtered().length}><text fg={colors.muted} padding={1}>No results</text></Show>
    <PickerFooter back={!!props.presentation.back} width={width() - 2} />
  </box>;
}

function PickerRow(props: { option: PickerOption; selected: boolean; shortcut?: number; hover(): void; select(): void }) {
  let row: BoxRenderable | undefined;
  let pressed = false;
  return <box ref={node => { row = node; }} flexDirection="row" gap={1} paddingLeft={1} paddingRight={1} paddingBottom={props.option.project ? 0 : 1}
    backgroundColor={props.selected ? colors.surface : undefined} onMouseOver={props.hover}
    onMouseDown={event => { event.preventDefault(); event.stopPropagation(); pressed = event.button === 0; }}
    onMouseOut={event => { if (!containsPointer(row, event)) pressed = false; }}
    onMouseUp={event => {
      event.stopPropagation();
      const activate = pressed && event.button === 0 && !event.isDragging && containsPointer(row, event);
      pressed = false;
      if (activate) props.select();
    }}>
    <Show when={props.option.project} fallback={<Show when={props.option.badge}><text selectable={false} fg={colors.muted} width={2} flexShrink={0}>{props.option.badge}</text></Show>}>
      <ProjectMark name={props.option.project!} height={2} />
    </Show>
    <box flexGrow={1} minWidth={0}>
      <box flexDirection="row" gap={1} height={1}>
        <SingleLine text={props.option.title} color={colors.text} flexGrow={1} />
        <Show when={props.shortcut}><text selectable={false} fg={colors.muted} width={6} flexShrink={0}>Ctrl {props.shortcut}</text></Show>
      </box>
      <Show when={props.option.project} fallback={<SingleLine text={props.option.description} color={colors.muted} width="100%" />}>
        <text height={1} width="100%" wrapMode="none" truncate fg={colors.muted}>{props.option.description}</text>
      </Show>
    </box>
  </box>;
}
