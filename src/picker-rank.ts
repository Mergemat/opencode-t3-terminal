import type { IconName } from "./terminal-icon";

export type PickerOption = { value: string; title: string; description?: string; icon?: IconName; iconColor?: string; project?: string };

// Every term must match. Title prefixes rank first, then title matches, then details.
export function rankOptions(options: PickerOption[], query: string) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return options;
  return options.flatMap((option, index) => {
    const title = option.title.toLocaleLowerCase();
    const text = `${title} ${(option.description ?? "").toLocaleLowerCase()}`;
    if (!terms.every(term => text.includes(term))) return [];
    const score = terms.reduce((sum, term) => sum + (title.startsWith(term) ? 0 : title.includes(term) ? 1 : 2), 0);
    return [{ option, score, index }];
  }).sort((a, b) => a.score - b.score || a.index - b.index).map(entry => entry.option);
}
