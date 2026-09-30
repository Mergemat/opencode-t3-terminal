/** @jsxImportSource @opentui/solid */
import type { Plugin } from "@opencode/plugin/tui";
import type { Renderable, BoxRenderable, TextRenderable, TextareaRenderable } from "@opentui/core";
import { Show, createEffect, createSignal, onCleanup, onMount, untrack } from "solid-js";
import path from "node:path";
import { colors } from "./palette";
import { Button } from "./controls";
import { ComposerSurface } from "./composer-surface";
import { ComposerControls } from "./composer-controls";
import { createComposerResting } from "./composer-resting";
import { mountCompletionMenu } from "./native-completion";
import { fitLabel } from "./single-line";
import { providerIcon } from "./provider-mark";
import type { Workspace } from "./workspace";

export function Composer(props: { context: Plugin.Context; workspace?: Workspace; sessionID?: string; mode: "normal" | "shell" }) {
  let card: Renderable | undefined;
  let editorHost: Renderable | undefined;
  let input: TextareaRenderable | undefined;
  let originalParent: Renderable | undefined;
  let nativeBody: Renderable | undefined;
  let nativeBottom: Renderable | undefined;
  const [labels, setLabels] = createSignal<string[]>([]);
  const [cardWidth, setCardWidth] = createSignal(80);
  const [permission, setPermission] = createSignal("prompt");
  const [nativeEditor, setNativeEditor] = createSignal<TextareaRenderable>();
  const [hasDraft, setHasDraft] = createSignal(false);
  const { resting, expand } = createComposerResting(props.context, () => props.sessionID, () => card, nativeEditor);
  const running = () => !!props.sessionID && props.context.data.session.status(props.sessionID) === "running";
  const location = () => props.sessionID ? props.context.data.session.get(props.sessionID)?.location : props.context.location;
  const model = () => labels()[1] || "Select model";
  const variant = () => labels()[3] || "Default";
  const modelIcon = () => {
    const providers = new Set(props.context.data.location.model.list(location())?.filter(value => value.name === model()).map(value => value.providerID));
    return providers.size === 1 ? providerIcon([...providers][0]) : undefined;
  };
  const descendants = (node: Renderable): Renderable[] => node.getChildren().flatMap(child => [child, ...descendants(child)]);
  createEffect(() => {
    const editor = nativeEditor();
    const drafts = props.workspace?.drafts;
    const directory = location()?.directory;
    if (!editor || !drafts || props.sessionID || !directory) return;
    drafts.selected();
    untrack(() => void drafts.initialize(editor, directory).catch(error => props.context.ui.toast.show({ variant: "error", message: String(error) })));
    const original = editor.onContentChange;
    const detach = untrack(() => drafts.attach(editor, directory));
    editor.onContentChange = event => { original?.(event); drafts.changed(); };
    onCleanup(() => { detach(); if (!editor.isDestroyed) editor.onContentChange = original; });
  });
  createEffect(() => {
    const editor = nativeEditor();
    if (!editor) return;
    editor.minHeight = resting() ? 1 : 4;
    editor.maxHeight = resting() ? 1 : 10;
    editor.wrapMode = resting() ? "none" : "word";
    const placeholder = props.mode === "shell" ? "Run a command…" : "Ask anything, @tag files or / for commands";
    editor.placeholder = resting() ? fitLabel(placeholder, Math.max(1, cardWidth() - 12)) : placeholder;
  });
  onMount(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let restoreCompletion: (() => void) | undefined;
    queueMicrotask(() => {
      const prompt = card?.parent?.parent;
      if (prompt) (prompt as BoxRenderable).backgroundColor = colors.background;
      if (card?.parent) (card.parent as BoxRenderable).backgroundColor = colors.background;
      const native = prompt?.getChildren().filter(child => child.visible) ?? [];
      const body = native[0];
      const bottom = native[1];
      if (!body || !editorHost) return;
      const nodes = descendants(body);
      input = nodes.find(node => node.id.startsWith("textarea-")) as TextareaRenderable | undefined;
      if (!input) return;
      originalParent = input.parent ?? undefined;
      originalParent?.remove(input);
      editorHost.add(input);
      input.width = "100%";
      input.backgroundColor = colors.composer;
      input.focusedBackgroundColor = colors.composer;
      setNativeEditor(input);
      if (prompt?.parent && card) restoreCompletion = mountCompletionMenu(prompt.parent, card);
      nativeBody = body;
      nativeBottom = bottom;
      body.visible = false;
      if (bottom) bottom.visible = false;
      const update = () => {
        setHasDraft(!!input?.plainText.trim());
        if (!restoreCompletion && prompt?.parent && card) restoreCompletion = mountCompletionMenu(prompt.parent, card);
        const textNodes = descendants(body).filter(node => node.id.startsWith("text-")) as TextRenderable[];
        const raw = textNodes.map(node => node.textNode.toChunks().map(chunk => chunk.text).join("").trim());
        setPermission(raw.includes("auto") ? "autoaccept" : "prompt");
        const values = raw.filter(text => text && text !== "·" && text !== "auto");
        setLabels(current => JSON.stringify(current) === JSON.stringify(values) ? current : values);
      };
      update();
      timer = setInterval(update, 250);
      input.focus();
    });
    onCleanup(() => {
      clearInterval(timer);
      restoreCompletion?.();
      if (nativeBody && !nativeBody.isDestroyed) nativeBody.visible = true;
      if (nativeBottom && !nativeBottom.isDestroyed) nativeBottom.visible = true;
      if (input && !input.isDestroyed && originalParent && !originalParent.isDestroyed) {
        input.parent?.remove(input);
        originalParent.add(input);
      }
    });
  });
  return <box id="t3-composer" ref={node => { card = node; }} onSizeChange={function() { setCardWidth(this.width); }} width="100%" flexShrink={0} gap={0}
    onMouseDown={event => { if (event.button === 0) expand(); }}>
    <ComposerSurface>
      <box ref={node => { editorHost = node; }} minHeight={resting() ? 1 : 4} flexShrink={0} paddingRight={resting() ? 8 : 0} />
      <Show when={!resting()}>
        <box paddingRight={8} flexShrink={0}>
          <ComposerControls context={props.context} model={model()} modelIcon={modelIcon()} variant={variant()} permission={permission()} agent={labels()[0] || "Agent"}
            width={cardWidth() - 4} resting={false} expand={expand} />
        </box>
      </Show>
      <box position="absolute" right={2} bottom={1} height={1} flexDirection="row" gap={1} zIndex={1}>
        <Button id="t3-attach" label="" icon="paperclip" width={3} run={() => { expand(); input?.focus(); input?.insertText("@"); }} />
        <Button id="t3-send" label="" icon={running() ? "square" : "arrow-up"} width={3} color={running() ? colors.pink : colors.text}
          background={colors.surface} disabled={!running() && !hasDraft()}
          run={() => props.context.keymap.dispatch(running() ? "session.interrupt" : "prompt.submit")} />
      </box>
    </ComposerSurface>
    <Show when={resting()}>
      <box width={Math.max(0, cardWidth() - 4)} alignSelf="center" flexShrink={0}>
        <ComposerSurface color={colors.surface} paddingTop={0} paddingBottom={0}>
          <ComposerControls context={props.context} model={model()} modelIcon={modelIcon()} variant={variant()} permission={permission()} agent={labels()[0] || "Agent"}
            width={cardWidth() - 8} resting expand={expand} />
        </ComposerSurface>
      </box>
    </Show>
    <Show when={!props.sessionID}>
      <box paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} flexDirection="row" justifyContent="space-between" gap={1}>
        <Button id="t3-composer-project" label={path.basename(location()?.directory ?? "Project")} icon="folder" iconWidth={2} trailing="chevron-down"
          width={Math.min(22, Math.max(12, cardWidth() - 20))} run={() => props.context.keymap.dispatch("t3.projects")} />
      </box>
    </Show>
  </box>;
}
