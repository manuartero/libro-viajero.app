import type { Project } from "src/project/project.model";

export type AppData = {
  projects: Project[];
  activeProjectId: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const withStrings =
  (...keys: string[]) =>
  (value: unknown): value is Record<string, unknown> =>
    isRecord(value) && keys.every((key) => typeof value[key] === "string");

const listOf =
  <T>(isItem: (value: unknown) => value is T) =>
  (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(isItem);

const areChildren = listOf(withStrings("id", "tag", "emoji", "color"));
const areBooks = listOf(withStrings("id", "title"));
const areAssignments = listOf(withStrings("childId", "bookId", "weekStart"));
const hasProjectFields = withStrings("id", "name");

const isProject = (value: unknown): value is Project =>
  hasProjectFields(value) &&
  areChildren(value.children) &&
  areBooks(value.books) &&
  areAssignments(value.currentAssignments) &&
  areAssignments(value.history);

const areProjects = listOf(isProject);

// Deep enough that every screen can render what passes; optional fields are
// left to their readers, which already cope with their absence.
export function parseAppData(text: string): AppData | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isRecord(value)) {
    return null;
  }
  const { projects, activeProjectId } = value;
  if (typeof activeProjectId !== "string" && activeProjectId !== null) {
    return null;
  }
  if (!areProjects(projects)) {
    return null;
  }
  return { projects, activeProjectId };
}
