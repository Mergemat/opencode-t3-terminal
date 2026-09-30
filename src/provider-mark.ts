import type { IconName } from "./terminal-icon";

export function providerIcon(provider: string | undefined): IconName | undefined {
  switch (provider?.toLowerCase()) {
    case "opencode": return "opencode";
    case "openai": return "openai";
    case "anthropic": return "anthropic";
    case "google": return "google";
  }
}
