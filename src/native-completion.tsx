import type { BoxRenderable, Renderable, ScrollBoxRenderable, TextRenderable } from "@opentui/core";
import { Yoga } from "@opentui/core";
import type { Value } from "@opentui/core/yoga";
import { colors } from "./palette";
import { fitLabel } from "./single-line";

const { Edge, Unit } = Yoga;

const children = (node: Renderable): Renderable[] => node.getChildren().flatMap(child => [child, ...children(child)]);
const text = (node: TextRenderable) => node.textNode.toChunks().map(chunk => chunk.text).join("");
const displayedText = (node: TextRenderable) => node.chunks.map(chunk => chunk.text).join("");
const dimension = (value: Value): number | "auto" | `${number}%` => value.unit === Unit.Point ? value.value
  : value.unit === Unit.Percent ? `${value.value}%` : "auto";
const padding = (value: Value): number | `${number}%` => value.unit === Unit.Percent ? `${value.value}%`
  : value.unit === Unit.Point ? value.value : 0;
const saveBox = (box: BoxRenderable) => {
  const layout = box.getLayoutNode();
  return { width: dimension(layout.getWidth()), height: dimension(layout.getHeight()), backgroundColor: box.backgroundColor,
    paddingLeft: padding(layout.getPadding(Edge.Left)), paddingRight: padding(layout.getPadding(Edge.Right)),
    paddingTop: padding(layout.getPadding(Edge.Top)), paddingBottom: padding(layout.getPadding(Edge.Bottom)) };
};

// The host owns filtering, selection, keyboard handling and command execution.
// Its completion popup has no plugin slot; change only that popup's presentation.
export function mountCompletionMenu(prompt: Renderable, composer: Renderable) {
  const list = children(prompt).find(node => node.id.startsWith("scrollbox-")
    && node.getChildren().some(row => {
      const label = row.getChildren()[0] as TextRenderable | undefined;
      return label?.id.startsWith("text-") && text(label).startsWith("/");
    })) as ScrollBoxRenderable | undefined;
  const popup = list?.parent as BoxRenderable | undefined;
  if (!list || !popup) return;
  const before = popup.onLifecyclePass;
  const saved = { ...saveBox(popup), border: popup.border, left: popup.left, top: popup.top, bottom: popup.bottom };
  const savedList = saveBox(list);
  const rows = new Map<Renderable, () => void>();
  let selected: Renderable | undefined;
  popup.border = false;
  popup.backgroundColor = colors.composer;
  popup.paddingLeft = popup.paddingRight = popup.paddingTop = popup.paddingBottom = 1;
  list.height = "100%";
  (list as BoxRenderable).backgroundColor = colors.composer;
  popup.onLifecyclePass = function() {
    before?.call(this);
    for (const row of rows.keys()) if (row.isDestroyed) rows.delete(row);
    const left = composer.x + 2 - (popup.parent?.x ?? 0);
    const width = Math.max(1, composer.width - 4);
    const height = Math.max(2, Math.min(16, list.getChildren().filter(row => row.visible).length * 2 + 2, composer.y - 4));
    const top = composer.y - height - (popup.parent?.y ?? 0);
    if (popup.left !== left) popup.left = left;
    // Width/height getters report the previous frame, while the host may have
    // queued new dimensions. Set the desired values before the layout pass.
    popup.width = width;
    popup.height = height;
    list.height = height - 2;
    if (popup.bottom !== "auto") popup.bottom = "auto";
    if (popup.top !== top) popup.top = top;
    const options = list.getChildren();
    const active = options.find(row => (row as BoxRenderable).backgroundColor?.a);
    if (active && active !== selected) {
      selected = active;
      const itemTop = options.indexOf(active) * 2;
      if (itemTop < list.scrollTop) list.scrollTop = itemTop;
      else if (itemTop + 2 > list.scrollTop + list.viewport.height) list.scrollTop = itemTop + 2 - list.viewport.height;
    }
    for (const node of list.getChildren()) {
      if (rows.has(node)) continue;
      const row = node as BoxRenderable;
      const labels = row.getChildren() as TextRenderable[];
      if (labels.length !== 2 || !labels[0]?.id.startsWith("text-")) continue;
      const savedRow = saveBox(row);
      const savedLabels = labels.map(label => ({ content: text(label), fg: label.fg, wrapMode: label.wrapMode,
        width: dimension(label.getLayoutNode().getWidth()) }));
      const original = row.onLifecyclePass;
      rows.set(row, () => {
        row.onLifecyclePass = original;
        if (!original) row.ctx.unregisterLifecyclePass(row);
        Object.assign(row, savedRow);
        labels.forEach((label, index) => { if (!label.isDestroyed) Object.assign(label, savedLabels[index]); });
      });
      row.height = 2;
      row.paddingLeft = row.paddingRight = 1;
      row.paddingBottom = 1;
      row.onLifecyclePass = function() {
        original?.call(this);
        // Native selection still controls which row has an opaque background.
        if (row.backgroundColor?.a) row.backgroundColor = colors.surface;
        const name = text(labels[0]!).trimEnd();
        if (displayedText(labels[0]!) !== name) labels[0]!.content = name;
        labels[0]!.width = Bun.stringWidth(name) + 1;
        labels[0]!.fg = colors.text;
        const description = fitLabel(text(labels[1]!).trimStart(), Math.max(1, composer.width - Bun.stringWidth(name) - 9));
        if (displayedText(labels[1]!) !== description) labels[1]!.content = description;
        labels[1]!.fg = colors.secondary;
        labels[1]!.wrapMode = "none";
      };
      row.ctx.registerLifecyclePass(row);
    }
  };
  // Lifecycle passes run before Yoga and clipping. Render hooks run after them,
  // exposing one frame of the host geometry whenever filtering replaces rows.
  popup.ctx.registerLifecyclePass(popup);
  return () => {
    if (!popup.isDestroyed) {
      popup.onLifecyclePass = before;
      if (!before) popup.ctx.unregisterLifecyclePass(popup);
      Object.assign(popup, saved);
    }
    if (!list.isDestroyed) Object.assign(list, savedList);
    for (const [row, restore] of rows) if (!row.isDestroyed) restore();
  };
}
