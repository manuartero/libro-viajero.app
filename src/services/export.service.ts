import type { AppData } from "src/project/project.model";

// "Descargar mis datos": the teacher's own copy of everything the app knows.
// A plain JSON file to keep in Drive, send over WhatsApp, or hand to next
// year's teacher. No server involved — the browser writes the file.

export function buildExport({ data, today }: { data: AppData; today: Date }) {
  const stamp = today.toISOString().slice(0, 10);
  return {
    filename: `libro-viajero-${stamp}.json`,
    content: JSON.stringify(data, null, 2),
  };
}

export function downloadAppData(data: AppData) {
  const { filename, content } = buildExport({ data, today: new Date() });
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
