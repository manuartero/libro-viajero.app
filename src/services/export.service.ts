import { isoDate } from "src/lib/week";
import type { AppData } from "src/project/project.model";

// "Descargar mis datos": the teacher's own copy of everything the app knows.
// A plain JSON file to keep in Drive, send over WhatsApp, or hand to next
// year's teacher. No server involved — the browser writes the file.
//
// The file is the same shape as the stored value, so importing one back is
// only a validated saveAppData() when we get there.

export function buildExport({ data, today }: { data: AppData; today: Date }) {
  return {
    filename: `libro-viajero-${isoDate(today)}.json`,
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
  // Firefox and Safari abort the download if the anchor is detached or the
  // URL is revoked before the click has been dispatched.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
