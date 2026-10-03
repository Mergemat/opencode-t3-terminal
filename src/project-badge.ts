import { colors, mix, projectColors } from "./palette";

export function projectBadge(name: string, dim = false) {
  // T3 Code's generated project identity (projectIdentity.ts), using Poimandres tones.
  const normalized = name.normalize("NFKC").trim();
  const words = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
  const letters = Array.from(words[0] ?? "PR");
  const first = letters[0]!;
  const second = letters.slice(1).find(letter => /\p{N}/u.test(letter))
    ?? (words.length > 1 ? Array.from(words.at(-1)!)[0] : letters.at(-1)) ?? first;
  const label = Array.from(`${first}${second}`.toUpperCase()).slice(0, 2).join("");
  let index = 0;
  for (const letter of normalized.toLocaleLowerCase("en-US") || "project") index = (index * 31 + letter.codePointAt(0)!) % projectColors.length;
  const tone = projectColors[index]!;
  // Parked rows recede: T3 greys their favicon until hover.
  const color = dim ? mix(colors.muted, colors.sidebar, .7) : tone;
  return { label, color, background: mix(dim ? colors.muted : tone, colors.sidebar, dim ? .1 : .14) };
}
