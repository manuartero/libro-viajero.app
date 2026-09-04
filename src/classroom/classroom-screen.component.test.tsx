import { fireEvent, render, screen } from "@testing-library/react";
import { ClassroomScreen } from "src/classroom/classroom-screen.component";
import type { Project } from "src/project/project.model";
import { describe, expect, it, vi } from "vitest";

const project = (overrides?: Partial<Project>): Project => ({
  id: "p1",
  name: "Los Caracoles 2026/27",
  children: [{ id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" }],
  books: [],
  currentAssignments: [],
  history: [],
  ...overrides,
});

describe("<ClassroomScreen />", () => {
  it("adds a child to the live project", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<ClassroomScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
    fireEvent.click(screen.getByRole("radio", { name: "Zorro" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    );

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const next = onUpdate.mock.calls[0][0];
    expect(next.children).toHaveLength(2);
    expect(next.children[1].tag).toBe("Zorro");
  });

  it("shows the class list, not the form, on arrival", () => {
    render(<ClassroomScreen project={project()} onUpdate={() => true} />);

    expect(screen.getByRole("button", { name: "Rana, editar" })).toBeDefined();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("stays open for the next child after an add", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<ClassroomScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
    fireEvent.click(screen.getByRole("radio", { name: "Zorro" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    );

    // Two taps per child, twenty children: reopening the builder for each one
    // is the whole reason this is a disclosure and not a dialog.
    expect(
      screen.getByRole("button", { name: "Añadir peque a la clase" }),
    ).toBeDefined();
  });

  it("shuts the builder from Listo", () => {
    render(<ClassroomScreen project={project()} onUpdate={() => true} />);

    fireEvent.click(screen.getByRole("button", { name: "Añadir un peque" }));
    fireEvent.click(screen.getByRole("button", { name: "Listo" }));

    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("edits an existing child", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<ClassroomScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cambiar apodo" }));
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Ranita" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    const next = onUpdate.mock.calls[0][0];
    expect(next.children[0].tag).toBe("Ranita");
  });

  it("removes an unassigned child without asking", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(<ClassroomScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].children).toHaveLength(0);
  });

  it("asks before removing a child who has a book at home", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    const withBook = project({
      books: [{ id: "b1", title: "Elmer" }],
      currentAssignments: [
        { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
      ],
    });
    render(<ClassroomScreen project={withBook} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText(/tiene un libro en casa/)).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const next = onUpdate.mock.calls[0][0];
    expect(next.children).toHaveLength(0);
    expect(next.currentAssignments).toHaveLength(0);
    expect(next.history).toBe(withBook.history);
    expect(screen.queryByText(/tiene un libro en casa/)).toBeNull();
  });

  it("keeps the edit form when the save does not persist", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => false);
    render(<ClassroomScreen project={project()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cambiar apodo" }));
    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Ranita" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    // Still in edit mode with the typed tag intact — nothing to retype.
    const input: HTMLInputElement = screen.getByLabelText("Apodo");
    expect(input.value).toBe("Ranita");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDefined();
  });

  it("keeps the confirm panel when the removal does not persist", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => false);
    render(
      <ClassroomScreen
        project={project({
          books: [{ id: "b1", title: "Elmer" }],
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          ],
        })}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, quitarlo" }));

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/tiene un libro en casa/)).toBeDefined();
  });

  it("keeps the child when the removal is cancelled", () => {
    const onUpdate = vi.fn<(next: Project) => boolean>(() => true);
    render(
      <ClassroomScreen
        project={project({
          books: [{ id: "b1", title: "Elmer" }],
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          ],
        })}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Rana, editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Quitar" }));
    fireEvent.click(screen.getByRole("button", { name: "No, mantenerlo" }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.queryByText(/tiene un libro en casa/)).toBeNull();
  });
});
