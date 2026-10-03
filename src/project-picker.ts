import { homedir } from "node:os";
import type { PickerOption } from "./picker";

export const tildePath = (directory: string) => directory === homedir() || directory.startsWith(homedir() + "/") ? "~" + directory.slice(homedir().length) : directory;

export function projectPickerOptions(projects: { name: string; directory: string }[], current: string): PickerOption[] {
  return [...projects.filter(project => project.directory === current), ...projects.filter(project => project.directory !== current)]
    .map(project => ({ title: project.name, value: project.directory, description: tildePath(project.directory), project: project.name }));
}
