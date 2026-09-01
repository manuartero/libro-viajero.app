import { fireEvent, render, screen } from "@testing-library/react";
import { Dashboard } from "src/dashboard/dashboard.component";
import type { Project } from "src/project/project.model";
import { describe, expect, it, vi } from "vitest";

const project = (overrides?: Partial<Project>): Project => ({
  id: "p1",
  name: "Los Caracoles 2026/27",
  children: [],
  books: [],
  currentAssignments: [],
  history: [],
  ...overrides,
});

const children = [
  { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" },
  { id: "c2", tag: "Zorro", emoji: "🦊", color: "#ffca3a" },
];
const books = [
  { id: "b1", title: "Elmer" },
  { id: "b2", title: "El Grúfalo" },
];

describe("<Dashboard />", () => {
  it("invites to add children when the class is empty", () => {
    const onNavigate = vi.fn();
    render(
      <Dashboard
        project={project()}
        onNavigate={onNavigate}
        onRepartir={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Añadir peques" }));

    expect(onNavigate).toHaveBeenCalledWith("clase");
  });

  it("invites to add books when the library is empty", () => {
    const onNavigate = vi.fn();
    render(
      <Dashboard
        project={project({ children })}
        onNavigate={onNavigate}
        onRepartir={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Añadir libros" }));

    expect(onNavigate).toHaveBeenCalledWith("biblioteca");
  });

  it("invites to distribute books when nothing is assigned yet", () => {
    const onRepartir = vi.fn();
    render(
      <Dashboard
        project={project({ children, books })}
        onNavigate={() => {}}
        onRepartir={onRepartir}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));

    expect(onRepartir).toHaveBeenCalledTimes(1);
  });

  it("shows the check-in with a repartir banner while some child lacks a book", () => {
    render(
      <Dashboard
        project={project({
          children,
          books,
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          ],
        })}
        onNavigate={() => {}}
        onRepartir={() => {}}
      />,
    );

    expect(screen.getByText("1 peque sin libro")).toBeDefined();
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Zorro" })).toBeDefined();
  });

  it("runs the plain check-in when every child has a book", () => {
    render(
      <Dashboard
        project={project({
          children,
          books,
          currentAssignments: [
            { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
            { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
          ],
        })}
        onNavigate={() => {}}
        onRepartir={() => {}}
      />,
    );

    expect(screen.queryByText(/sin libro/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Rana — Elmer" }));

    expect(screen.getByRole("status").textContent).toContain("1/2");
  });
});
