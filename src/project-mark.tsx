/** @jsxImportSource @opentui/solid */
import { createMemo } from "solid-js";
import { existsSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { projectBadge } from "./project-badge";
import { TerminalImage } from "./terminal-image";
import { colors } from "./palette";

const escapeXml = (text: string) => text.replace(/[&<>"']/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[value]!);
// A bold sans face for the monogram. Without one, resvg falls back to system fonts.
const fontFiles = [
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
].filter(file => existsSync(file));
const rendered = new Map<string, Buffer>();

function markPng(name: string, dim: boolean, key: string) {
  const cached = rendered.get(key);
  if (cached) return cached;
  const badge = projectBadge(name, dim);
  const png = new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="32" height="32" fill="${badge.background}"/>
    <text x="16" y="21" text-anchor="middle" font-family="Arial, DejaVu Sans, Liberation Sans, sans-serif" font-size="14" font-weight="700" fill="${badge.color}">${escapeXml(badge.label)}</text>
  </svg>`, { font: { loadSystemFonts: !fontFiles.length, fontFiles } }).render().asPng();
  rendered.set(key, png);
  return png;
}

export function ProjectMark(props: { name: string; height?: number; dim?: boolean }) {
  // The badge blends into the sidebar, so a theme change renders a new image.
  const key = createMemo(() => `project:${colors.sidebar}:${colors.muted}:${props.dim ? "dim:" : ""}${props.name}`);
  const source = createMemo(() => markPng(props.name, !!props.dim, key()));
  return <TerminalImage name={key()} source={source()} width={2} height={props.height} scale={.84} />;
}
