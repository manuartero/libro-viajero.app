import { render, screen } from "@testing-library/react";
import { WeekSummary } from "src/dashboard/week-summary.component";
import type { ChildLoan } from "src/project/loan.model";
import { describe, expect, it } from "vitest";

const rana: ChildLoan = {
  child: { id: "c1", tag: "Rana", emoji: "🐸", color: "#ff595e" },
  book: { id: "b1", title: "Elmer" },
  loan: { status: "overdue", dueFriday: "2026-09-04", daysAtHome: 11 },
};

const zorro: ChildLoan = {
  child: { id: "c2", tag: "Zorro", emoji: "🦊", color: "#1982c4" },
  book: { id: "b2", title: "El Grúfalo" },
  loan: { status: "due", dueFriday: "2026-09-11", daysAtHome: 6 },
};

describe("<WeekSummary />", () => {
  it("says so when nobody has to return a book this week", () => {
    render(<WeekSummary pending={[]} expectedCount={0} upcoming={[]} />);

    expect(screen.getByText("No toca devolver ningún libro.")).toBeDefined();
  });

  it("celebrates when everything expected is back", () => {
    render(<WeekSummary pending={[]} expectedCount={2} upcoming={[]} />);

    expect(screen.getByText("¡Todos los libros han vuelto! 🎉")).toBeDefined();
  });

  it("lists who still has to bring a book back, with how long they have had it", () => {
    render(
      <WeekSummary pending={[rana, zorro]} expectedCount={3} upcoming={[]} />,
    );

    expect(screen.getByText("Faltan 2 de 3")).toBeDefined();
    expect(screen.getByText("Rana")).toBeDefined();
    expect(screen.getByText("Elmer")).toBeDefined();
    expect(screen.getByText("11 días en casa")).toBeDefined();
    expect(screen.getByText("Zorro")).toBeDefined();
    expect(screen.getByText("El Grúfalo")).toBeDefined();
    expect(screen.getByText("6 días en casa")).toBeDefined();
  });

  it("names the later Fridays the rest of the class is due", () => {
    render(
      <WeekSummary
        pending={[]}
        expectedCount={0}
        upcoming={[
          { dueFriday: "2026-09-18", count: 3 },
          { dueFriday: "2026-09-25", count: 1 },
        ]}
      />,
    );

    expect(
      screen.getByText("3 peques vuelven el viernes 18 de septiembre"),
    ).toBeDefined();
    expect(
      screen.getByText("1 peque vuelve el viernes 25 de septiembre"),
    ).toBeDefined();
  });
});
