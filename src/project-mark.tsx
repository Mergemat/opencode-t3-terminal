/** @jsxImportSource @opentui/solid */
import { createMemo } from "solid-js";
import { Resvg } from "@resvg/resvg-js";
import { projectBadge } from "./project-badge";
import { TerminalImage } from "./terminal-image";

const escapeXml = (text: string) => text.replace(/[&<>"']/g, value => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[value]!);

export function ProjectMark(props: { name: string; height?: number }) {
  const badge = createMemo(() => projectBadge(props.name));
  const source = createMemo(() => new Resvg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="32" height="32" fill="${badge().background}"/>
    <text x="16" y="21" text-anchor="middle" font-family="Arial" font-size="14" font-weight="600" fill="${badge().color}">${escapeXml(badge().label)}</text>
  </svg>`, { font: { loadSystemFonts: false, fontFiles: ["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] } }).render().asPng());
  return <TerminalImage name={`project:${props.name}`} source={source()} width={2} height={props.height} scale={.84} />;
}
