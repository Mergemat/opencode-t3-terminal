import type { Plugin } from "@opencode/plugin/tui";

// Poimandres values for tests and hosts without a resolved theme.
const fallback = {
  background: "#101219", raised: "#1e2330", text: "#e4f0fb", muted: "#8792ae", border: "#303747",
  success: "#5de4c7", info: "#add7ff", error: "#f087bd", warning: "#fffac2", accent: "#a0a7e6",
};

let theme: Plugin.Context["theme"] | undefined;
/** Follow the active OpenCode theme. Reads stay reactive when the theme store changes. */
export function useTheme(context: Plugin.Context) { theme = context.theme; }

const hex = (value: unknown, otherwise: string): string => {
  if (typeof value === "string" && /^#[0-9a-f]{6}/i.test(value)) return value.slice(0, 7);
  const ints = (value as { toInts?: () => number[] } | undefined)?.toInts?.();
  if (!ints) return otherwise;
  return "#" + ints.slice(0, 3).map(part => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0")).join("");
};
export const mix = (color: string, base: string, amount: number) => "#" + [1, 3, 5].map(start => Math.round(
  parseInt(color.slice(start, start + 2), 16) * amount + parseInt(base.slice(start, start + 2), 16) * (1 - amount),
).toString(16).padStart(2, "0")).join("");

const read = (path: string, otherwise: string) => {
  let value: any = theme;
  for (const key of path.split(".")) value = value?.[key];
  return hex(value, otherwise);
};
const tokens = {
  get background() { return read("background.base", fallback.background); },
  get raised() { return read("background.raised.base", fallback.raised); },
  get text() { return read("text.base", fallback.text); },
  get muted() { return read("text.muted", fallback.muted); },
  get border() { return read("border.base", fallback.border); },
  get success() { return read("text.feedback.success.base", fallback.success); },
  get info() { return read("text.feedback.info.base", fallback.info); },
  get error() { return read("text.feedback.error.base", fallback.error); },
  get warning() { return read("text.feedback.warning.base", fallback.warning); },
  get accent() { return read("text.formfield.focused", fallback.accent); },
};

// Sidebar roles, derived from the theme so every state recolors with it.
export const colors = {
  get background() { return tokens.background; },
  get sidebar() { return tokens.background; },
  get surface() { return tokens.raised; },
  get hover() { return mix(tokens.raised, tokens.background, .55); },
  get composer() { return mix(tokens.raised, tokens.background, .6); },
  get composerBorder() { return mix(tokens.border, tokens.background, .7); },
  get border() { return mix(tokens.border, tokens.background, .8); },
  get snoozedBorder() { return mix(tokens.info, tokens.background, .25); },
  get text() { return tokens.text; },
  get secondary() { return mix(tokens.text, tokens.muted, .55); },
  get muted() { return tokens.muted; },
  get faint() { return mix(tokens.muted, tokens.background, .65); },
  get disabled() { return mix(tokens.muted, tokens.background, .45); },
  get mint() { return tokens.success; },
  get blue() { return tokens.info; },
  get indigo() { return tokens.accent; },
  get violet() { return mix(tokens.info, tokens.error, .5); },
  get pink() { return tokens.error; },
  get yellow() { return tokens.warning; },
};

// T3 Code's eighteen project icon colors, in its order, as Poimandres tones.
export const projectColors = [
  "#8792ae", "#f07a8f", "#f2a97f", "#e8c27a", "#fffac2", "#c4e6b4",
  "#9fe0a0", "#5de4c7", "#6fd3c2", "#89ddff", "#a6d8ee", "#add7ff",
  "#a0a7e6", "#bfa3e5", "#d2a6ff", "#e59cf0", "#f087bd", "#d0679d",
];
