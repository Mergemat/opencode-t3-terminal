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

export function SingleLine(props: { text: string; color: string; bold?: boolean; width?: number | "100%"; flexGrow?: number }) {
  const [width, setWidth] = createSignal(0);
  return <box height={1} width={props.width} flexGrow={props.flexGrow} flexShrink={1} minWidth={0}
    onSizeChange={function() { setWidth(this.width); }}>
    <text selectable={false} height={1} width="100%" fg={props.color} wrapMode="none">
      {props.bold ? <b>{fitLabel(props.text, width())}</b> : fitLabel(props.text, width())}
    </text>
  </box>;
}
