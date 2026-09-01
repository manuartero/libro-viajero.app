import { fireEvent, render, screen } from "@testing-library/react";
import { AssignBooks } from "src/assign/assign-books.component";
import type { Project } from "src/project/project.model";
import { describe, expect, it, vi } from "vitest";

const project = (overrides?: Partial<Project>): Project => ({
  id: "p1",
  name: "Los Caracoles 2026/27",
  children: [
    { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
    { id: "c2", tag: "Zorro", emoji: "🦊", color: "#ffca3a" },
  ],
  books: [
    { id: "b1", title: "Elmer" },
    { id: "b2", title: "El Grúfalo" },
  ],
  currentAssignments: [],
  history: [],
  ...overrides,
});

describe("<AssignBooks />", () => {
  it("assigns tray books to children in order and saves them", () => {
    const onConfirm = vi.fn();
    render(
      <AssignBooks
        project={project()}
        onConfirm={onConfirm}
        onBack={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "El Grúfalo, asignar" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    const assignments = onConfirm.mock.calls[0][0];
    expect(assignments).toHaveLength(2);
    expect(assignments[0]).toMatchObject({ childId: "c1", bookId: "b1" });
    expect(assignments[1]).toMatchObject({ childId: "c2", bookId: "b2" });
  });

  it("seeds from the live assignments and keeps their weekStart", () => {
    const onConfirm = vi.fn();
    render(
      <AssignBooks
        project={project({
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-24" },
          ],
        })}
        onConfirm={onConfirm}
        onBack={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Rana, tiene Elmer" }),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", { name: "El Grúfalo, asignar" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar reparto" }));

    const assignments = onConfirm.mock.calls[0][0];
    expect(assignments).toEqual([
      { childId: "c1", bookId: "b1", weekStart: "2026-08-24" },
      expect.objectContaining({ childId: "c2", bookId: "b2" }),
    ]);
    expect(assignments[1].weekStart).not.toBe("2026-08-24");
  });

  it("allows saving a partial reparto but not an empty one", () => {
    const onConfirm = vi.fn();
    render(
      <AssignBooks
        project={project()}
        onConfirm={onConfirm}
        onBack={() => {}}
      />,
    );

    const save = screen.getByRole("button", { name: "Guardar reparto" });
    expect(save.hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Elmer, asignar" }));
    expect(save.hasAttribute("disabled")).toBe(false);

    fireEvent.click(save);
    expect(onConfirm.mock.calls[0][0]).toHaveLength(1);
  });

  it("unassigns a child's book back to the tray", () => {
    render(
      <AssignBooks
        project={project({
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-24" },
          ],
        })}
        onConfirm={() => {}}
        onBack={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rana, quitar libro" }));

    expect(
      screen.getByRole("button", { name: "Rana, sin libro" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Elmer, asignar" }),
    ).toBeDefined();
  });

  it("goes back without saving", () => {
    const onBack = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AssignBooks project={project()} onConfirm={onConfirm} onBack={onBack} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Volver a la semana" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
