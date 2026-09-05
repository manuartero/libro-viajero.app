import { render, screen } from "@testing-library/react";
import { MissingSummary } from "src/dashboard/missing-summary.component";
import type { MissingBook } from "src/project/project.model";
import { describe, expect, it } from "vitest";

const rana: MissingBook = {
  child: { id: "c1", tag: "Rana", emoji: "🐸", color: "#ff595e" },
  book: { id: "b1", title: "Elmer" },
};

const zorro: MissingBook = {
  child: { id: "c2", tag: "Zorro", emoji: "🦊", color: "#1982c4" },
  book: { id: "b2", title: "El Grúfalo" },
};

describe("<MissingSummary />", () => {
  it("celebrates when nothing is missing", () => {
    render(<MissingSummary missing={[]} />);

    expect(screen.getByText("¡Todos los libros han vuelto! 🎉")).toBeDefined();
  });

  it("lists every missing child with their book", () => {
    render(<MissingSummary missing={[rana, zorro]} />);

    expect(screen.getByRole("heading", { name: "Faltan 2" })).toBeDefined();
    expect(screen.getByText("Rana")).toBeDefined();
    expect(screen.getByText("Elmer")).toBeDefined();
    expect(screen.getByText("Zorro")).toBeDefined();
    expect(screen.getByText("El Grúfalo")).toBeDefined();
  });
});
