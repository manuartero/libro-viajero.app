import { type AppData, parseAppDataJson } from "src/app-data/app-data.model";

const STORAGE_KEY = "libro-viajero";

const emptyAppData = (): AppData => ({ projects: [], activeProjectId: null });

const readRaw = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    // Storage blocked (private mode, cookie settings): run without persisting.
    console.error("libro-viajero: cannot read localStorage", error);
    return null;
  }
};

const stashRaw = (raw: string) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}:backup-${Date.now()}`, raw);
  } catch {
    // Backup is best-effort; without space the original stays in place.
  }
};

export function getAppData() {
  const raw = readRaw();
  if (!raw) {
    return emptyAppData();
  }
  const data = parseAppDataJson(raw);
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

export function saveAppData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("libro-viajero: cannot save app data", error);
    return false;
  }
}

export function backUpAppData() {
  const raw = readRaw();
  if (raw) {
    stashRaw(raw);
  }
}
