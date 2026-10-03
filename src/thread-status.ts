import { colors } from "./palette";
import type { IconName } from "./terminal-icon";

// T3 Code's sidebar states, in priority order. Color is reserved for work that
// needs you, work in motion and failures; a seen, finished thread shows its age.
export type ThreadStatus = "Approval" | "Input" | "Working" | "Failed" | "Woke" | "Done" | "Idle";

export function statusBadge(status: ThreadStatus): { icon: IconName; color: string } | undefined {
  switch (status) {
    case "Approval": return { icon: "shield-question", color: colors.yellow };
    case "Input": return { icon: "message-circle-question", color: colors.indigo };
    case "Working": return { icon: "circle-dashed", color: colors.blue };
    case "Failed": return { icon: "circle-alert", color: colors.pink };
    case "Woke": return { icon: "alarm-clock", color: colors.yellow };
    case "Done": return { icon: "circle-check", color: colors.mint };
  }
}

/** Background work and threads you have already read recede, so rows that need you stand out. */
export function shouldRecede(status: ThreadStatus, active: boolean) {
  return !active && (status === "Working" || status === "Approval" || status === "Idle");
}

export function needsAttention(status: ThreadStatus) {
  return status === "Input" || status === "Woke" || status === "Done";
}

export function age(timestamp: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  return minutes < 1 ? "now" : minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${Math.floor(minutes / 60)}h` : `${Math.floor(minutes / 1440)}d`;
}
