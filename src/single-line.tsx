/** @jsxImportSource @opentui/solid */
import { createSignal } from "solid-js";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// OpenTUI's truncate option removes the middle. Keep the recognizable beginning
// of labels instead, and measure terminal cells rather than UTF-16 characters.
export function fitLabel(text: string, width: number) {
  if (width <= 0 || Bun.stringWidth(text) <= width) return text;
  let result = "";
  let used = 0;
  for (const { segment } of graphemes.segment(text)) {
    const cells = Bun.stringWidth(segment);
    if (used + cells > width - 1) break;
    result += segment;
    used += cells;
  }
  return result + "…";
}

// Paths read best from the end: "…/projects/fluenc".
export function fitTail(text: string, width: number) {
  if (width <= 0 || Bun.stringWidth(text) <= width) return text;
  const parts = [...graphemes.segment(text)].map(part => part.segment);
  let result = "";
  let used = 0;
  for (let index = parts.length - 1; index >= 0; index--) {
    const cells = Bun.stringWidth(parts[index]!);
    if (used + cells > width - 1) break;
    result = parts[index] + result;
    used += cells;
  }
  return "…" + result;
}

export function SingleLine(props: { text: string; color: string; bold?: boolean; width?: number | "100%"; flexGrow?: number; tail?: boolean; align?: "left" | "right" }) {
  const fit = (text: string, width: number) => props.tail ? fitTail(text, width) : fitLabel(text, width);
  const [width, setWidth] = createSignal(0);
  return <box height={1} width={props.width} flexGrow={props.flexGrow} flexShrink={1} minWidth={0}
    onSizeChange={function() { setWidth(this.width); }}>
    <box height={1} width="100%" flexDirection="row" justifyContent={props.align === "right" ? "flex-end" : "flex-start"}>
      <text selectable={false} height={1} fg={props.color} wrapMode="none">
        {props.bold ? <b>{fit(props.text, width())}</b> : fit(props.text, width())}
      </text>
    </box>
  </box>;
}
