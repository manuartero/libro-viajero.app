import type { AppData } from "src/app-data/app-data.model";
import { isoDate } from "src/lib/week";

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
  // Firefox and Safari abort a download from a detached anchor.
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
