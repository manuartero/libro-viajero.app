import { fireEvent, render, screen } from "@testing-library/react";
import { DashboardScreen } from "src/dashboard/dashboard-screen.component";
import type { Tab } from "src/navigation/navigation.model";
import type { Project } from "src/project/project.model";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  { id: "c3", tag: "Búho", emoji: "🦉", color: "#1982c4" },
];
const books = [
  { id: "b1", title: "Elmer" },
  { id: "b2", title: "El Grúfalo" },
  { id: "b3", title: "La oruga glotona" },
];

// Judged on Fri 11 Sep 2026 with one-week loans: a book from the week of
// 31 Aug is due today, one from 7 Sep is still out, one from 24 Aug is late.
const TODAY = new Date(2026, 8, 11);
const due = { childId: "c1", bookId: "b1", weekStart: "2026-08-31" };
const reading = { childId: "c2", bookId: "b2", weekStart: "2026-09-07" };
const overdue = { childId: "c3", bookId: "b3", weekStart: "2026-08-24" };

const renderDashboard = ({
  overrides,
  onUpdate = () => true,
  onNavigate = () => {},
  onRepartir = () => {},
}: {
  overrides?: Partial<Project>;
  onUpdate?: (project: Project) => boolean;
  onNavigate?: (tab: Tab) => void;
  onRepartir?: () => void;
}) =>
  render(
    <DashboardScreen
      project={project(overrides)}
      onUpdate={onUpdate}
      onNavigate={onNavigate}
      onRepartir={onRepartir}
      onDownloadData={() => {}}
    />,
  );

// The assignments the screen asked to save, from the last onUpdate call.
const savedAssignments = (onUpdate: ReturnType<typeof vi.fn>) => {
  const [saved] = onUpdate.mock.lastCall as [Project];
  return saved.currentAssignments;
};

describe("<DashboardScreen />", () => {
  beforeEach(() => {
    vi.setSystemTime(TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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
      overrides: { children, books, currentAssignments: [due] },
      onRepartir,
    });

    // Zorro and Búho never took a book home: out of the count, no card.
    expect(screen.getByRole("status").textContent).toContain("0/1");
    expect(screen.getByRole("button", { name: "Rana — Elmer" })).toBeDefined();
    expect(screen.queryByRole("button", { name: /Zorro/ })).toBeNull();
    expect(screen.getByText("Sin libro esta semana")).toBeDefined();
    expect(screen.getByText("Zorro")).toBeDefined();

    expect(screen.getByText("2 peques sin libro")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));
    expect(onRepartir).toHaveBeenCalledTimes(1);
  });

  it("groups the class by where each loan stands, most urgent first", () => {
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [due, reading, overdue],
      },
    });

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(headings.slice(0, 3)).toEqual([
      "No volvió el viernes pasado1 libro",
      "Vuelve este viernes1 libro",
      "Sigue leyendo1 libro",
    ]);

    // Overdue and due are expected today; Zorro is still reading and is not.
    expect(screen.getByRole("status").textContent).toContain("0/2");
    expect(screen.getByText("Faltan 2 de 2")).toBeDefined();
    expect(
      screen.getByText("1 peque vuelve el viernes 18 de septiembre"),
    ).toBeDefined();
  });

  it("records a return that was due with one tap, dated today", () => {
    const onUpdate = vi.fn(() => true);
    renderDashboard({
      overrides: { children, books, currentAssignments: [due, overdue] },
      onUpdate,
    });

    fireEvent.click(screen.getByRole("button", { name: "Rana — Elmer" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Búho — La oruga glotona" }),
    );

    // Late or on time alike: the teacher has the book in hand, no questions.
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(onUpdate).toHaveBeenCalledTimes(2);
    expect(savedAssignments(onUpdate)).toContainEqual({
      ...overdue,
      returnedOn: "2026-09-11",
    });
  });

  it("asks before recording a return that comes early", () => {
    const onUpdate = vi.fn(() => true);
    renderDashboard({
      overrides: { children, books, currentAssignments: [due, reading] },
      onUpdate,
    });

    fireEvent.click(screen.getByRole("button", { name: "Zorro — El Grúfalo" }));

    const panel = screen.getByRole("alertdialog", {
      name: "Devolución anticipada de Zorro",
    });
    expect(panel.textContent).toContain("hasta el viernes 18 de septiembre");
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "No, sigue leyendo" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(onUpdate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Zorro — El Grúfalo" }));
    fireEvent.click(screen.getByRole("button", { name: "Sí, lo devuelve" }));

    expect(savedAssignments(onUpdate)).toContainEqual({
      ...reading,
      returnedOn: "2026-09-11",
    });
  });

  it("counts a return only when the book was expected", () => {
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [due, { ...reading, returnedOn: "2026-09-11" }],
      },
    });

    // Zorro brought the book back early: the card shows it, the count does not.
    expect(
      screen
        .getByRole("button", { name: "Zorro — El Grúfalo" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.getByRole("status").textContent).toContain("0/1");
  });

  it("undoes a return with a second tap, whatever the section", () => {
    const onUpdate = vi.fn(() => true);
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          { ...due, returnedOn: "2026-09-11" },
          { ...reading, returnedOn: "2026-09-11" },
        ],
      },
      onUpdate,
    });

    fireEvent.click(screen.getByRole("button", { name: "Zorro — El Grúfalo" }));

    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(savedAssignments(onUpdate)).toEqual([
      { ...due, returnedOn: "2026-09-11" },
      reading,
    ]);
  });

  it("shows nothing to check in while everybody is still reading", () => {
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          reading,
          { childId: "c1", bookId: "b1", weekStart: "2026-09-07" },
          { childId: "c3", bookId: "b3", weekStart: "2026-09-07" },
        ],
      },
    });

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("No toca devolver ningún libro.")).toBeDefined();
    expect(
      screen.getByText("3 peques vuelven el viernes 18 de septiembre"),
    ).toBeDefined();
  });

  it("celebrates once everything expected is back", () => {
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [
          { ...due, returnedOn: "2026-09-11" },
          { ...overdue, returnedOn: "2026-09-11" },
        ],
      },
    });

    expect(screen.getByRole("status").textContent).toContain("2/2");
    expect(screen.getByText("¡Todos los libros han vuelto! 🎉")).toBeDefined();
  });

  it("still offers the reparto when every child has a book", () => {
    const onRepartir = vi.fn();
    renderDashboard({
      overrides: {
        children,
        books,
        currentAssignments: [due, reading, overdue],
      },
      onRepartir,
    });

    fireEvent.click(screen.getByRole("button", { name: "Repartir libros" }));

    expect(onRepartir).toHaveBeenCalledTimes(1);
  });
});
