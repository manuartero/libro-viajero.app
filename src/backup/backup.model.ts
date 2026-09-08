import { type AppData, parseAppData } from "src/app-data/app-data.model";
import { pluralLibros } from "src/book/book.model";
import { pluralPeques } from "src/child/child.model";
import { isoDate, parseIsoDate } from "src/lib/week";
import type { Project } from "src/project/project.model";

export type Backup = {
  appData: AppData;
  project: Project;
  savedOn: string; // ISO date the copy was made
};

// Anywhere in the name: a second download becomes "libro-viajero-<date> (1).json".
const FILENAME_DATE = /(\d{4}-\d{2}-\d{2})/;

// The export names the file after the day; a name without one falls back to
// the date the file system remembers.
export function backupDateOf({
  filename,
  lastModified,
}: {
  filename: string;
  lastModified: number;
}): string {
  const fromName = FILENAME_DATE.exec(filename)?.[1];
  if (fromName) {
    return fromName;
  }
  return isoDate(new Date(lastModified));
}

export function parseBackup({
  text,
  filename,
  lastModified,
}: {
  text: string;
  filename: string;
  lastModified: number;
}): Backup | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const appData = parseAppData(parsed);
  if (!appData || appData.projects.length === 0) {
    return null;
  }
  const project =
    appData.projects.find((p) => p.id === appData.activeProjectId) ??
    appData.projects[0];
  return {
    appData: { ...appData, activeProjectId: project.id },
    project,
    savedOn: backupDateOf({ filename, lastModified }),
  };
}

export async function readBackup(file: File): Promise<Backup | null> {
  return parseBackup({
    text: await file.text(),
    filename: file.name,
    lastModified: file.lastModified,
  });
}

const longDateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function backupDateline(backup: Backup) {
  return `Copia del ${longDateFormat.format(parseIsoDate(backup.savedOn))}`;
}

export function backupSummary(project: Project) {
  const atHome = project.currentAssignments.filter((a) => !a.returnedOn);
  const parts = [
    pluralPeques(project.children.length),
    pluralLibros(project.books.length),
  ];
  if (atHome.length > 0) {
    parts.push(`${atHome.length} en casa`);
  }
  return parts.join(" · ");
}
