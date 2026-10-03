/** @jsxImportSource @opentui/solid */
import { createEffect, onCleanup } from 'solid-js';
import { useRenderer } from '@opentui/solid';
import { NativeImage, resolveRenderLib, type ImageSource, type BoxRenderable, type CliRenderer } from '@opentui/core';
import { deflateSync } from 'node:zlib';

type Entry = { node: BoxRenderable; name(): string; color(): string | undefined; scale(): number; align(): IconAlign; drawn: boolean; placed: boolean; id: number; key?: string };
const sources = new Map<string, NativeImage>();
const pixels = new Map<string, string>();
let nextImage = 400000;
// cmux clears placements on every repaint; other terminals keep them until deleted.
const repaintEveryFrame = Object.keys(process.env).some(name => name.startsWith("CMUX_"));


const command = (header: string, data = '') => `\x1b_G${header}${data ? ';' + data : ''}\x1b\\`;
// Glyphs sit above the middle of a cell: its bottom is reserved for descenders.
// Center icons on the capital letters beside them, not on the cell.
export const DEFAULT_ICON_SCALE = .62;
// Pixel icons (a small grid per image) snap to whole multiples of their grid.
// "start" shares the left edge of a project badge, so a card's leading icons form
// one column; "end" hugs the label that follows; "center" suits icon buttons.
export type IconAlign = "start" | "center" | "end";
export function iconBox(width: number, height: number, rows: number, scale: number, grid?: number, align: IconAlign = "center") {
  const row = height / rows;
  const target = Math.min(row * scale, width * .9);
  const size = grid ? grid * Math.max(1, Math.round(target / grid)) : Math.max(1, Math.round(target));
  const center = height / 2 - row * .06;
  const badge = Math.min(row * .84, width * .9);
  const inset = Math.floor((width - badge) / 2);
  const left = align === "start" ? inset : align === "end" ? width - size - Math.round(row * .18) : Math.floor((width - size) / 2);
  return { size, left: Math.max(0, left), top: Math.max(0, Math.min(height - size, Math.round(center - size / 2))) };
}

function imageData(name: string, color: string | undefined, scale: number, width: number, height: number, rows: number, align: IconAlign) {
  const key = `${name}:${color}:${scale}:${width}:${height}:${rows}:${align}`;
  const cached = pixels.get(key);
  if (cached) return cached;
  const source = sources.get(name);
  if (!source) return;
  const grid = source.width <= 16 ? source.width : undefined;
  const { size, left, top } = iconBox(width, height, rows, scale, grid, align);
  const resized = source.resize({ width: size, height: size, kernel: grid ? "nearest" : "default" });
  const raw = resized.raw();
  const data = new Uint8Array(width * height * 4);
  const rgb = color ? [1,3,5].map(offset => Number.parseInt(color.slice(offset, offset + 2), 16)) : [255,255,255];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const target = ((top + y) * width + left + x) * 4;
    const origin = y * raw.stride + x * 4;
    data[target] = Math.round(rgb[0]! * raw.data[origin]! / 255);
    data[target + 1] = Math.round(rgb[1]! * raw.data[origin + 1]! / 255);
    data[target + 2] = Math.round(rgb[2]! * raw.data[origin + 2]! / 255);
    data[target + 3] = raw.data[y * raw.stride + x * 4 + 3]!;
  }
  resized.dispose();
  const encoded = deflateSync(data).toString('base64');
  if (pixels.size >= 128) pixels.delete(pixels.keys().next().value!);
  pixels.set(key, encoded);
  return encoded;
}

// OpenTUI currently uses virtual Kitty placements; cmux needs ordinary placements.
// Keep images in the renderer's frame lifecycle so clipping, dialogs and cleanup agree.
const layers = new WeakMap<CliRenderer, ReturnType<typeof createLayer>>();
function createLayer(renderer: CliRenderer) {
  const entries = new Set<Entry>();
  // A resize can clear the screen, and with it every placement.
  const invalidate = () => { for (const entry of entries) entry.key = undefined; };
  const flush = () => {
    if (!renderer.capabilities?.kitty_graphics || !renderer.resolution) return;
    let output = '';
    for (const entry of entries) {
      const node = entry.node;
      const visible = entry.drawn && !node.isDestroyed && node.height > 0 && node.width > 0
        && node.x >= 0 && node.y >= 0 && node.x + node.width <= renderer.width && node.y + node.height <= renderer.height
        && renderer.hitTest(node.x + Math.floor(node.width / 2), node.y) === node.num;
      entry.drawn = false;
      if (!visible) {
        if (entry.placed) output += command(`a=d,d=I,i=${entry.id},q=2`);
        entry.placed = false; entry.key = undefined; continue;
      }
      const key = `${node.x},${node.y},${node.width},${node.height},${entry.name()},${entry.color()},${entry.scale()},${entry.align()}`;
      if (entry.placed && entry.key === key && !repaintEveryFrame) continue;
      const width = Math.max(1, Math.round(node.width * renderer.resolution.width / renderer.terminalWidth));
      const height = Math.max(1, Math.round(node.height * renderer.resolution.height / renderer.terminalHeight));
      const encoded = imageData(entry.name(), entry.color(), entry.scale(), width, height, node.height, entry.align());
      if (!encoded) continue;
      // cmux clears placements on repaint and caches reused image IDs. Replace
      // each placement with a fresh ID; cached compressed pixels keep writes small.
      if (entry.placed) output += command(`a=d,d=I,i=${entry.id},q=2`);
      entry.id = nextImage++;
      output += `\x1b[${node.y + 1};${node.x + 1}H`;
      for (let offset = 0; offset < encoded.length; offset += 4096) {
        const more = offset + 4096 < encoded.length ? 1 : 0;
        output += command(offset === 0
          ? `a=T,f=32,o=z,t=d,q=2,i=${entry.id},p=1,s=${width},v=${height},c=${node.width},r=${node.height},z=1,C=1,m=${more}`
          : `m=${more}`, encoded.slice(offset, offset + 4096));
      }
      entry.placed = true;
      entry.key = key;
    }
    if (output) resolveRenderLib().writeOut(renderer.rendererPtr, '\x1b7' + output + '\x1b8');
  };
  renderer.on('frame', flush);
  renderer.on('resize', invalidate);
  return {
    add(entry: Entry) { entries.add(entry); },
    remove(entry: Entry) {
      entries.delete(entry);
      if (entry.placed && !renderer.isDestroyed) resolveRenderLib().writeOut(renderer.rendererPtr, command(`a=d,d=I,i=${entry.id},q=2`));
      if (!entries.size) { renderer.off('frame', flush); renderer.off('resize', invalidate); layers.delete(renderer); }
    },
  };
}

export function TerminalImage(props: { name: string; source: ImageSource; color?: string; scale?: number; width: number; height?: number; align?: IconAlign }) {
  const renderer = useRenderer();
  let entry: Entry | undefined;
  const layer = layers.get(renderer) ?? createLayer(renderer);
  layers.set(renderer, layer);
  createEffect(() => {
    const name = props.name;
    if (!sources.has(name)) void NativeImage.load(props.source).then(source => {
      if (sources.has(name)) source.dispose(); else sources.set(name, source);
      renderer.requestRender();
    });
  });
  onCleanup(() => { if (entry) layer.remove(entry); });
  return <box width={props.width} height={props.height ?? 1} flexShrink={0} ref={node => {
    entry = { node, name: () => props.name, color: () => props.color, scale: () => props.scale ?? DEFAULT_ICON_SCALE, align: () => props.align ?? (props.width >= 3 ? "center" : "start"), drawn: false, placed: false, id: 0 };
    // Lets scripts/preview.tsx draw icons that the test renderer cannot show.
    (node as BoxRenderable & { t3Image?: unknown }).t3Image = { name: () => props.name, color: () => props.color, source: () => props.source, scale: () => props.scale ?? DEFAULT_ICON_SCALE, align: () => props.align ?? (props.width >= 3 ? "center" : "start") };
    layer.add(entry);
    node.renderAfter = () => { if (entry) entry.drawn = true; };
  }} />;
}
