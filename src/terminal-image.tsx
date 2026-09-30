/** @jsxImportSource @opentui/solid */
import { createEffect, onCleanup } from 'solid-js';
import { useRenderer } from '@opentui/solid';
import { NativeImage, resolveRenderLib, type ImageSource, type BoxRenderable, type CliRenderer } from '@opentui/core';
import { deflateSync } from 'node:zlib';

type Entry = { node: BoxRenderable; name(): string; color(): string | undefined; scale(): number; drawn: boolean; placed: boolean; id: number };
const sources = new Map<string, NativeImage>();
const pixels = new Map<string, string>();
let nextImage = 400000;


const command = (header: string, data = '') => `\x1b_G${header}${data ? ';' + data : ''}\x1b\\`;
function imageData(name: string, color: string | undefined, scale: number, width: number, height: number) {
  const key = `${name}:${color}:${scale}:${width}:${height}`;
  const cached = pixels.get(key);
  if (cached) return cached;
  const source = sources.get(name);
  if (!source) return;
  const size = Math.max(1, Math.round(Math.min(height * scale, width * .9)));
  const resized = source.resize({ width: size, height: size });
  const raw = resized.raw();
  const data = new Uint8Array(width * height * 4);
  const rgb = color ? [1,3,5].map(offset => Number.parseInt(color.slice(offset, offset + 2), 16)) : [255,255,255];
  const left = Math.floor((width - size) / 2), top = Math.floor((height - size) / 2);
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
        entry.placed = false; continue;
      }
      const width = Math.max(1, Math.round(node.width * renderer.resolution.width / renderer.terminalWidth));
      const height = Math.max(1, Math.round(node.height * renderer.resolution.height / renderer.terminalHeight));
      const encoded = imageData(entry.name(), entry.color(), entry.scale(), width, height);
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
    }
    if (output) resolveRenderLib().writeOut(renderer.rendererPtr, '\x1b7' + output + '\x1b8');
  };
  renderer.on('frame', flush);
  return {
    add(entry: Entry) { entries.add(entry); },
    remove(entry: Entry) {
      entries.delete(entry);
      if (entry.placed && !renderer.isDestroyed) resolveRenderLib().writeOut(renderer.rendererPtr, command(`a=d,d=I,i=${entry.id},q=2`));
      if (!entries.size) { renderer.off('frame', flush); layers.delete(renderer); }
    },
  };
}

export function TerminalImage(props: { name: string; source: ImageSource; color?: string; scale?: number; width: number; height?: number }) {
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
    entry = { node, name: () => props.name, color: () => props.color, scale: () => props.scale ?? .72, drawn: false, placed: false, id: 0 };
    layer.add(entry);
    node.renderAfter = () => { if (entry) entry.drawn = true; };
  }} />;
}
