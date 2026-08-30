// crypto.randomUUID only exists in secure contexts (https / localhost).
// Dev on the reference phone runs over LAN http, so fall back gracefully.
export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
