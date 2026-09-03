import { CONTENT_SECURITY_POLICY } from "src/lib/csp";
import { describe, expect, it } from "vitest";

const directives = Object.fromEntries(
  CONTENT_SECURITY_POLICY.split("; ").map((directive) => {
    const [name, ...sources] = directive.split(" ");
    return [name, sources];
  }),
);

describe("CONTENT_SECURITY_POLICY", () => {
  it("denies everything by default", () => {
    expect(directives["default-src"]).toEqual(["'none'"]);
  });

  it("allows the inline style attributes that colour avatars and covers", () => {
    expect(directives["style-src"]).toContain("'unsafe-inline'");
  });

  it("lets the app talk to Open Library and nothing else", () => {
    expect(directives["connect-src"]).toEqual([
      "'self'",
      "https://openlibrary.org",
    ]);
  });

  it("lets covers load through the archive.org redirect chain", () => {
    expect(directives["img-src"]).toEqual(
      expect.arrayContaining([
        "data:",
        "https://covers.openlibrary.org",
        "https://archive.org",
        "https://*.archive.org",
      ]),
    );
  });
});
