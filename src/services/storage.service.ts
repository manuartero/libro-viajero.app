import type { AppData } from "src/project/project.model";

// Placeholder namespace until Google auth lands; then payload.sub takes over.
// TODO(auth): on first login, migrate `libro-viajero:anonymous` into the
// user's own namespace — otherwise every pre-auth classroom disappears.
export const ANONYMOUS_USER_ID = "anonymous";

// Bump on AppData shape changes, then append the outgoing key builder to
// PREVIOUS_KEYS so existing installs are moved forward instead of booting
// empty. isAppData() alone cannot tell an old-shaped payload from a broken
// one, so a shape change also needs its transform applied to the moved raw.
const STORAGE_VERSION = "v1";

const storageKey = (googleId: string) =>
  `libro-viajero:${STORAGE_VERSION}:${googleId}`;

// Keys used by earlier installs, newest first. Before v1 the key was unversioned.
const PREVIOUS_KEYS: ReadonlyArray<(googleId: string) => string> = [
  (googleId) => `libro-viajero:${googleId}`,
];

// Unreadable payloads are parked here so a bad write stays recoverable.
// Two slots: a second incident must not destroy the first backup, and a
// third one may — anything more would accumulate full-size copies.
const backupKey = (googleId: string) => `${storageKey(googleId)}:backup`;
const previousBackupKey = (googleId: string) => `${backupKey(googleId)}-prev`;

// One-time move of the newest earlier-version entry into the current key.
const migratePreviousEntry = (googleId: string): string | null => {
  for (const keyOf of PREVIOUS_KEYS) {
    const key = keyOf(googleId);
    const raw = localStorage.getItem(key);
    if (raw === null) {
      continue;
    }
    try {
      localStorage.setItem(storageKey(googleId), raw);
      localStorage.removeItem(key);
    } catch (error) {
      // The old entry stays in place and is read from there on every boot.
      console.error(
        `libro-viajero: cannot move ${key} to ${storageKey(googleId)}`,
        error,
      );
    }
    return raw;
  }
  return null;
};

// Moves (not copies) the unreadable raw out of the live key: the recovery
// path then runs once per incident and the next save cannot overwrite it.
const backUpUnreadableEntry = ({
  googleId,
  raw,
}: {
  googleId: string;
  raw: string;
}) => {
  try {
    const previous = localStorage.getItem(backupKey(googleId));
    if (previous !== null && previous !== raw) {
      localStorage.setItem(previousBackupKey(googleId), previous);
    }
    localStorage.setItem(backupKey(googleId), raw);
    localStorage.removeItem(storageKey(googleId));
  } catch (error) {
    // The unreadable raw stays under the live key, so the next save will
    // overwrite it — the only place the loss can be traced is this log.
    console.error(
      `libro-viajero: cannot back up ${storageKey(googleId)}, the next save will overwrite it`,
      error,
    );
  }
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
      migratePreviousEntry(googleId);
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
    // Unparseable or wrong-shaped entry: park it under the backup key and
    // boot fresh instead of crashing.
    console.error(
      `libro-viajero: unreadable data at ${storageKey(googleId)}, backing it up`,
    );
    backUpUnreadableEntry({ googleId, raw });
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
