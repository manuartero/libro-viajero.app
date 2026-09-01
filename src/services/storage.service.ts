import type { AppData } from "src/project/project.model";

// Placeholder namespace until Google auth lands; then payload.sub takes over.
// TODO(auth): on first login, migrate `libro-viajero:anonymous` into the
// user's own namespace — otherwise every pre-auth classroom disappears.
export const ANONYMOUS_USER_ID = "anonymous";

// Bump on AppData shape changes and add the matching migration below —
// isAppData() alone cannot tell an old-shaped payload from a broken one.
const STORAGE_VERSION = "v1";

const storageKey = (googleId: string) =>
  `libro-viajero:${STORAGE_VERSION}:${googleId}`;

// Pre-versioning key used by installs before v1.
const legacyKey = (googleId: string) => `libro-viajero:${googleId}`;

// One-time move of a pre-versioned entry into the current key.
const migrateLegacyEntry = (googleId: string): string | null => {
  const raw = localStorage.getItem(legacyKey(googleId));
  if (raw === null) {
    return null;
  }
  try {
    localStorage.setItem(storageKey(googleId), raw);
    localStorage.removeItem(legacyKey(googleId));
  } catch {
    // Best effort: the legacy entry stays in place and is used as-is.
  }
  return raw;
};

const emptyAppData = (): AppData => ({ projects: [], activeProjectId: null });

const isAppData = (value: unknown): value is AppData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Partial<AppData>;
  return Array.isArray(candidate.projects) && "activeProjectId" in candidate;
};

export function getAppData(googleId: string): AppData {
  let raw: string | null;
  try {
    raw =
      localStorage.getItem(storageKey(googleId)) ??
      migrateLegacyEntry(googleId);
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
    // crashing — the next save would otherwise overwrite it. One fixed key:
    // a timestamped key per failed read would accumulate full-size copies.
    console.error(
      `libro-viajero: unreadable data at ${storageKey(googleId)}, backing it up`,
    );
    try {
      localStorage.setItem(`${storageKey(googleId)}:backup`, raw);
    } catch {
      // Backup is best-effort; without space the original stays in place.
    }
    return emptyAppData();
  }
  return parsed;
}

export function saveAppData({
  googleId,
  data,
}: {
  googleId: string;
  data: AppData;
}): boolean {
  try {
    localStorage.setItem(storageKey(googleId), JSON.stringify(data));
    return true;
  } catch (error) {
    // Quota exhausted or storage blocked — the caller must tell the teacher.
    console.error("libro-viajero: cannot save app data", error);
    return false;
  }
}
