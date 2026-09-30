import type { PickerOption } from "./picker";

export function projectPickerOptions(projects: { name: string; directory: string }[], current: string): PickerOption[] {
  return [...projects.filter(project => project.directory === current), ...projects.filter(project => project.directory !== current)]
    .map(project => ({ title: project.name, value: project.directory, description: `Local · ${project.directory}`, badge: "", project: project.name }));
}
