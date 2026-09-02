import type { AppData } from "src/project/project.model";

// One phone, one teacher, one namespace. There are no accounts to key by.
const STORAGE_KEY = "libro-viajero";
// Key used while a Google login was still planned; it never shipped.
const LEGACY_STORAGE_KEY = "libro-viajero:anonymous";

const emptyAppData = (): AppData => ({ projects: [], activeProjectId: null });

const isAppData = (value: unknown): value is AppData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<AppData>;
  return Array.isArray(candidate.projects) && "activeProjectId" in candidate;
};

const readRaw = () => {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current !== null) {
    return current;
  }
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy !== null) {
    // Silent one-time migration; the old key stays behind as a backup.
    localStorage.setItem(STORAGE_KEY, legacy);
  }
  return legacy;
};

export function getAppData(): AppData {
  let raw: string | null;
  try {
    raw = readRaw();
  } catch (error) {
    // Storage blocked by the browser (private mode, cookie settings):
    // the app still runs, it just won't persist.
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
  if (!isAppData(parsed)) {
    // Unparseable or wrong-shaped entry: keep the raw payload under a backup
    // key so a bad write stays recoverable, then boot fresh instead of
    // crashing — the next save would otherwise overwrite it.
    console.error(
      `libro-viajero: unreadable data at ${STORAGE_KEY}, backing it up`,
    );
    try {
      localStorage.setItem(`${STORAGE_KEY}:backup-${Date.now()}`, raw);
    } catch {
      // Backup is best-effort; without space the original stays in place.
    }
    return emptyAppData();
  }
  return parsed;
}

export function saveAppData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    // Quota exhausted or storage blocked — the caller must tell the teacher.
    console.error("libro-viajero: cannot save app data", error);
    return false;
  }
}
