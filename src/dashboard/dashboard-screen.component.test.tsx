import { fireEvent, render, screen } from "@testing-library/react";
import { DashboardScreen } from "src/dashboard/dashboard-screen.component";
import type { Tab } from "src/navigation/navigation.model";
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

const renderDashboard = ({
  overrides,
  returnedChildIds = [],
  onToggleReturned = () => {},
  onNavigate = () => {},
  onRepartir = () => {},
}: {
  overrides?: Partial<Project>;
  returnedChildIds?: string[];
  onToggleReturned?: (childId: string) => void;
  onNavigate?: (tab: Tab) => void;
  onRepartir?: () => void;
}) =>
  render(
    <DashboardScreen
      project={project(overrides)}
      returnedChildIds={returnedChildIds}
      onToggleReturned={onToggleReturned}
      onNavigate={onNavigate}
      onRepartir={onRepartir}
      onDownloadData={() => {}}
    />,
  );

describe("<DashboardScreen />", () => {
  it("invites to add children when the class is empty", () => {
    const onNavigate = vi.fn();
    renderDashboard({ onNavigate });

    fireEvent.click(screen.getByRole("button", { name: "Añadir peques" }));

    expect(onNavigate).toHaveBeenCalledWith("clase");
  });

  it("invites to add books when the library is empty", () => {
    const onNavigate = vi.fn();
    renderDashboard({ overrides: { children }, onNavigate });

    fireEvent.click(screen.getByRole("button", { name: "Añadir libros" }));

    expect(onNavigate).toHaveBeenCalledWith("biblioteca");
  });

  it("invites to distribute books when nothing is assigned yet", () => {
    const onRepartir = vi.fn();
    renderDashboard({ overrides: { children, books }, onRepartir });

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));

    expect(onRepartir).toHaveBeenCalledTimes(1);
  });

  it("checks in only children with a book and lists the rest apart", () => {
    const onRepartir = vi.fn();
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
        ],
      },
      onRepartir,
    });

    // Zorro never took a book home: out of the count, not a check-in card.
    expect(screen.getByRole("status").textContent).toContain("0/1");
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Zorro" })).toBeNull();
    expect(screen.getByText("Sin libro esta semana")).toBeDefined();
    expect(screen.getByText("Zorro")).toBeDefined();

    expect(screen.getByText("1 peque sin libro")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    expect(onRepartir).toHaveBeenCalledTimes(1);
  });

  it("runs the plain check-in when every child has a book", () => {
    const onToggleReturned = vi.fn();
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
        ],
      },
      returnedChildIds: ["c1"],
      onToggleReturned,
    });

    expect(screen.queryByText(/peques? sin libro/)).toBeNull();
    expect(screen.getByRole("status").textContent).toContain("1/2");

    fireEvent.click(screen.getByRole("button", { name: "Zorro — El Grúfalo" }));

    expect(onToggleReturned).toHaveBeenCalledWith("c2");
  });

  it("still offers the reparto when every child has a book", () => {
    const onRepartir = vi.fn();
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          { childId: "c1", bookId: "b1", weekStart: "2026-08-31" },
          { childId: "c2", bookId: "b2", weekStart: "2026-08-31" },
        ],
      },
      onRepartir,
    });

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));

    expect(onRepartir).toHaveBeenCalledTimes(1);
  });
});
