import { colors } from "./palette";

export function projectBadge(name: string) {
  // Match T3's generated project identity, using Poimandres tones.
  const normalized = name.normalize("NFKC").trim();
  const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const letters = Array.from(words[0] ?? "PR");
  const first = letters[0]!;
  const second = letters.slice(1).find(letter => /\p{N}/u.test(letter))
    ?? (words.length > 1 ? Array.from(words.at(-1)!)[0] : letters.at(-1)) ?? first;
  const label = Array.from(`${first}${second}`.toUpperCase()).slice(0, 2).join("");
  const palette = [colors.muted, colors.pink, "#dca4a4", "#e8d5a0", colors.yellow,
    "#c4e6b4", colors.mint, colors.mint, "#91d9d1", "#89ddff", "#a6d8ee", colors.blue,
    "#a0a7e6", "#bfa3e5", "#d2a6ff", colors.pink, colors.pink, "#d0679d"];
  let index = 0;
  for (const letter of normalized.toLocaleLowerCase("en-US") || "project") index = (index * 31 + letter.codePointAt(0)!) % palette.length;
  const color = palette[index]!;
  const blend = (start: number) => Math.round(parseInt(color.slice(start, start + 2), 16) * .14
    + parseInt(colors.sidebar.slice(start, start + 2), 16) * .86).toString(16).padStart(2, "0");
  return { label, color, background: `#${blend(1)}${blend(3)}${blend(5)}` };
}
