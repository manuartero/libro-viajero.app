import { type AppData, parseAppData } from "src/app-data/app-data.model";

const STORAGE_KEY = "libro-viajero";

const emptyAppData = (): AppData => ({ projects: [], activeProjectId: null });

const stashRaw = (raw: string) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}:backup-${Date.now()}`, raw);
  } catch {
    // Backup is best-effort; without space the original stays in place.
  }
};

export function getAppData(): AppData {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    // Storage blocked (private mode, cookie settings): run without persisting.
    console.error("libro-viajero: cannot read localStorage", error);
    return emptyAppData();
  }
  if (!raw) {
    return emptyAppData();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const data = parseAppData(parsed);
  if (!data) {
    // Back the raw payload up before booting fresh: the next save would
    // otherwise overwrite it.
    console.error(
      `libro-viajero: unreadable data at ${STORAGE_KEY}, backing it up`,
    );
    stashRaw(raw);
    return emptyAppData();
  }
  return data;
}

export function saveAppData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("libro-viajero: cannot save app data", error);
    return false;
  }
}

export function backUpAppData() {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return;
  }
  if (raw) {
    stashRaw(raw);
  }
}
