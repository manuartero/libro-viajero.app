import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseBackup } from "src/backup/backup.model";
import { EMOJI_PANELS } from "src/child/avatar-catalog.data";
import { PALETTE } from "src/palette/palette.data";
import { describe, expect, it } from "vitest";

// The sample classrooms in samples/ are what the restore is tried with on a
// real phone; this keeps them restorable as the model moves on.
const SAMPLES_DIR = join(import.meta.dirname, "../../samples");
const samples = readdirSync(SAMPLES_DIR).filter((name) =>
  name.endsWith(".json"),
);

const colors = new Set(PALETTE.map(({ color }) => color));
const emojis = new Set(
  EMOJI_PANELS.flatMap((panel) => panel.emojis.map(({ emoji }) => emoji)),
);

describe("samples/", () => {
  it.each(samples)("%s restores as a backup", (filename) => {
    const backup = parseBackup({
      text: readFileSync(join(SAMPLES_DIR, filename), "utf8"),
      filename,
      lastModified: 0,
    });

    expect(backup).not.toBeNull();
    expect(backup?.project.children.length).toBeGreaterThan(0);
    expect(backup?.project.books.length).toBeGreaterThan(0);
  });

  it.each(samples)(
    "%s only uses avatars and colors the app still offers",
    (filename) => {
      const backup = parseBackup({
        text: readFileSync(join(SAMPLES_DIR, filename), "utf8"),
        filename,
        lastModified: 0,
      });

      for (const child of backup?.project.children ?? []) {
        expect(colors.has(child.color), `${child.tag}: ${child.color}`).toBe(
          true,
        );
        expect(emojis.has(child.emoji), `${child.tag}: ${child.emoji}`).toBe(
          true,
        );
      }
    },
  );

  it.each(samples)(
    "%s keeps every loan pointing at a child and a book of its class",
    (filename) => {
      const backup = parseBackup({
        text: readFileSync(join(SAMPLES_DIR, filename), "utf8"),
        filename,
        lastModified: 0,
      });
      const project = backup?.project;
      const childIds = new Set(project?.children.map(({ id }) => id));
      const bookIds = new Set(project?.books.map(({ id }) => id));

      for (const loan of [
        ...(project?.currentAssignments ?? []),
        ...(project?.history ?? []),
      ]) {
        expect(childIds.has(loan.childId), loan.childId).toBe(true);
        expect(bookIds.has(loan.bookId), loan.bookId).toBe(true);
      }
    },
  );
});
