import type { AppData } from "src/project/project.model";

// Placeholder namespace until Google auth lands; then payload.sub takes over.
export const ANONYMOUS_USER_ID = "anonymous";

const storageKey = (googleId: string) => `libro-viajero:${googleId}`;

const emptyAppData = (): AppData => ({ projects: [], activeProjectId: null });

export function getAppData(googleId: string): AppData {
  const raw = localStorage.getItem(storageKey(googleId));
  if (!raw) {
    return emptyAppData();
  }
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    // Corrupted entry: starting fresh beats crashing on boot.
    return emptyAppData();
  }
}

export function saveAppData({
  googleId,
  data,
}: {
  googleId: string;
  data: AppData;
}) {
  localStorage.setItem(storageKey(googleId), JSON.stringify(data));
}
