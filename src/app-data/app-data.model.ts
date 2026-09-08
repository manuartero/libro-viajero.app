import type { Project } from "src/project/project.model";

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasStrings = (record: Record<string, unknown>, keys: string[]) =>
  keys.every((key) => typeof record[key] === "string");

const isChild = (value: unknown) =>
  isRecord(value) && hasStrings(value, ["id", "tag", "emoji", "color"]);

const isBook = (value: unknown) =>
  isRecord(value) && hasStrings(value, ["id", "title"]);

const isAssignment = (value: unknown) =>
  isRecord(value) && hasStrings(value, ["childId", "bookId", "weekStart"]);

const isProject = (value: unknown): value is Project =>
  isRecord(value) &&
  hasStrings(value, ["id", "name"]) &&
  Array.isArray(value.children) &&
  value.children.every(isChild) &&
  Array.isArray(value.books) &&
  value.books.every(isBook) &&
  Array.isArray(value.currentAssignments) &&
  value.currentAssignments.every(isAssignment) &&
  Array.isArray(value.history) &&
  value.history.every(isAssignment);

// Deep enough that every screen can render what passes; optional fields are
// left to their readers, which already cope with their absence.
export function parseAppData(value: unknown): AppData | null {
  if (!isRecord(value) || !Array.isArray(value.projects)) {
    return null;
  }
  const { projects, activeProjectId } = value;
  if (!projects.every(isProject)) {
    return null;
  }
  if (typeof activeProjectId !== "string" && activeProjectId !== null) {
    return null;
  }
  return { projects, activeProjectId };
}
