import { fireEvent, render, screen } from "@testing-library/react";
import { LibraryScreen } from "src/library/library-screen.component";
import type { Project } from "src/project/project.model";
import { describe, expect, it, vi } from "vitest";

const project = (overrides?: Partial<Project>): Project => ({
  id: "p1",
  name: "Los Caracoles 2026/27",
  children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" }],
  books: [{ id: "b1", title: "Elmer" }],
  currentAssignments: [],
  history: [],
  ...overrides,
});

describe("<LibraryScreen />", () => {
  it("counts the shelf in the dateline", () => {
    render(<LibraryScreen project={project()} onUpdate={() => true} />);

    expect(screen.getByText("La biblioteca · 1 libro")).toBeDefined();
  });

  it("adds a manually entered book to the live project", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<LibraryScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(
      screen.getByRole("button", { name: "¿No lo encuentras? Añádelo a mano" }),
    );
    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "El Grúfalo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Añadir libro" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const next = onUpdate.mock.calls[0][0];
    expect(next.books).toHaveLength(2);
    expect(next.books[1].title).toBe("El Grúfalo");
  });

  it("removes an unassigned book without asking", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<LibraryScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Elmer, quitar" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].books).toHaveLength(0);
  });

  it("asks before removing a book that is at a child's home", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    const assigned = project({
      currentAssignments: [
        { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      ],
    });
    render(<LibraryScreen project={assigned} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Elmer, quitar" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText(/está en casa de «Rana»/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const next = onUpdate.mock.calls[0][0];
    expect(next.books).toHaveLength(0);
    expect(next.currentAssignments).toHaveLength(0);
    expect(screen.queryByText(/está en casa/)).toBeNull();
  });

  it("keeps the confirm panel when the removal does not persist", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => false);
    render(
      <LibraryScreen
        project={project({
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          ],
        })}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Elmer, quitar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/está en casa de «Rana»/)).toBeDefined();
  });

  it("keeps the book when the removal is cancelled", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(
      <LibraryScreen
        project={project({
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          ],
        })}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Elmer, quitar" }));
    fireEvent.click(screen.getByRole("button", { name: "No, mantenerlo" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByText(/está en casa/)).toBeNull();
  });
});
