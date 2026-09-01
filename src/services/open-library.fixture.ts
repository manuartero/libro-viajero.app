// Minimal Open Library search response stub shared by service and UI tests.
export const okResponse = (docs: unknown[]) =>
  ({ ok: true, json: async () => ({ docs }) }) as Response;
