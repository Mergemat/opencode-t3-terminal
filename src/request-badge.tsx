/** @jsxImportSource @opentui/solid */
import { Button } from "./controls";
import { colors } from "./palette";
import type { PullRequest } from "./git-host";
import type { IconName } from "./terminal-icon";

// T3 Code colors a request by its state alone, with a glyph for each state.
const presentation: Record<"open" | "draft" | "closed" | "merged", { icon: IconName; color: string }> = {
  open: { icon: "git-pull-request", color: colors.mint },
  draft: { icon: "git-pull-request-draft", color: colors.muted },
  closed: { icon: "git-pull-request-closed", color: colors.pink },
  merged: { icon: "git-merge", color: colors.violet },
};

export function requestPresentation(request: PullRequest) {
  return presentation[request.state === "open" && request.draft ? "draft" : request.state];
}

export function RequestBadge(props: { id?: string; request: PullRequest; run(): unknown }) {
  const style = () => requestPresentation(props.request);
  return <Button id={props.id} compact label={`#${props.request.number}`} icon={style().icon} iconWidth={2} iconGap={0}
    color={style().color} run={() => props.run()} />;
}
