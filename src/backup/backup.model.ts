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

const FILENAME_DATE = /libro-viajero-(\d{4}-\d{2}-\d{2})\.json$/;

// The export names the file after the day; a renamed file falls back to the
// date the file system remembers.
const savedOnOf = (file: File) =>
  FILENAME_DATE.exec(file.name)?.[1] ?? isoDate(new Date(file.lastModified));

export async function readBackup(file: File): Promise<Backup | null> {
  const appData = parseAppData(await file.text());
  if (!appData || appData.projects.length === 0) {
    return null;
  }
  const project =
    appData.projects.find((p) => p.id === appData.activeProjectId) ??
    appData.projects[0];
  return {
    appData: { ...appData, activeProjectId: project.id },
    project,
    savedOn: savedOnOf(file),
  };
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
