export type OrderedThread = { id: string; time: { created: number }; location: { directory: string } };

export function orderActive<T extends OrderedThread>(sessions: T[], pinned: Record<string, boolean>, anchors: Record<string, number>) {
  return [...sessions].sort((a, b) => Number(!!pinned[b.id]) - Number(!!pinned[a.id])
    || Math.max(b.time.created, anchors[b.id] ?? 0) - Math.max(a.time.created, anchors[a.id] ?? 0)
    || a.id.localeCompare(b.id));
}

export function nextAfterPark(sessions: OrderedThread[], id: string): string | undefined {
  const index = sessions.findIndex(session => session.id === id);
  if (index < 0) return;
  return [...sessions.slice(index + 1), ...sessions.slice(0, index)].find(session => session.id !== id)?.id;
}

export function snoozePresets(now: Date) {
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
  const evening = new Date(now); evening.setHours(18, 0, 0, 0);
  const monday = new Date(now); monday.setDate(monday.getDate() + ((8 - now.getDay()) % 7 || 7)); monday.setHours(9, 0, 0, 0);
  return [
    { title: "In 1 hour", time: now.getTime() + 3600000 },
    { title: "In 3 hours", time: now.getTime() + 10800000 },
    ...(evening.getTime() - now.getTime() > 3600000 ? [{ title: "This evening", time: evening.getTime() }] : []),
    { title: "Tomorrow", time: tomorrow.getTime() },
    ...(monday.getTime() !== tomorrow.getTime() ? [{ title: "Next week", time: monday.getTime() }] : []),
  ];
}

export function parseWakeTime(input: string, now: number): number | undefined {
  const duration = /^\s*(\d+(?:\.\d+)?)\s*(m|h|d)\s*$/i.exec(input);
  const time = duration ? now + Number(duration[1]) * ({ m: 60000, h: 3600000, d: 86400000 }[duration[2]!.toLowerCase()]!) : Date.parse(input);
  return Number.isFinite(time) && time > now ? time : undefined;
}

export function wakeLabel(until: number, now: number) {
  const minutes = Math.max(1, Math.ceil((until - now) / 60000));
  return minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.ceil(minutes / 60)}h` : `${Math.ceil(minutes / 1440)}d`;
}

const timeOfDay = (date: Date) => date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

/** T3's human wake time: "17:30" today, "tomorrow 9:00", "Mon 9:00", "Oct 12, 9:00". */
export function wakeDescription(until: number, now: Date) {
  const wake = new Date(until);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const days = Math.floor((wake.getTime() - today.getTime()) / 86400000);
  if (days === 0) return timeOfDay(wake);
  if (days === 1) return `tomorrow ${timeOfDay(wake)}`;
  if (days < 7) return `${wake.toLocaleDateString(undefined, { weekday: "short" })} ${timeOfDay(wake)}`;
  return `${wake.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${timeOfDay(wake)}`;
}
