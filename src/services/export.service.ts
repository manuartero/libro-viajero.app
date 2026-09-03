import { isoDate } from "src/lib/week";
import type { AppData } from "src/project/project.model";

// "Descargar mis datos": the teacher's own copy of everything the app knows.
// A plain JSON file to keep in Drive, send over WhatsApp, or hand to next
// year's teacher. No server involved — the browser writes the file.

export function downloadAppData(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  // isoDate, not toISOString: the file is named after the teacher's own day.
  anchor.download = `libro-viajero-${isoDate(new Date())}.json`;
  // Firefox and Safari abort the download if the anchor is detached or the
  // URL is revoked before the click has been dispatched.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
