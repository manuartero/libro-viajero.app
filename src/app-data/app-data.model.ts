import type { Project } from "src/project/project.model";

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};

export function activeProjectOf(appData: AppData) {
  return appData.projects.find((p) => p.id === appData.activeProjectId);
}

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

const PROJECT_LISTS = {
  children: isChild,
  books: isBook,
  currentAssignments: isAssignment,
  history: isAssignment,
};

const isProject = (value: unknown): value is Project =>
  isRecord(value) &&
  hasStrings(value, ["id", "name"]) &&
  Object.entries(PROJECT_LISTS).every(([key, isItem]) => {
    const list = value[key];
    return Array.isArray(list) && list.every(isItem);
  });

// Deep enough that every screen can render what passes; optional fields are
// left to their readers, which already cope with their absence.
export function parseAppData(value: unknown) {
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

export function parseAppDataJson(text: string) {
  try {
    return parseAppData(JSON.parse(text));
  } catch {
    return null;
  }
}
