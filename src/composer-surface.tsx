/** @jsxImportSource @opentui/solid */
import type { JSX } from "@opentui/solid";
import { colors } from "./palette";

export function ComposerSurface(props: { children: JSX.Element; color?: string; paddingTop?: number; paddingBottom?: number }) {
  return <box width="100%" flexShrink={0} backgroundColor={props.color ?? colors.composer}
    paddingLeft={2} paddingRight={2} paddingTop={props.paddingTop ?? 1} paddingBottom={props.paddingBottom ?? 1}>
    {props.children}
  </box>;
}
