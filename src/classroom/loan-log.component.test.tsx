import { fireEvent, render, screen } from "@testing-library/react";
import { LoanLog } from "src/classroom/loan-log.component";
import type { LoanRecord } from "src/project/loan-log.model";
import { describe, expect, it, vi } from "vitest";

const child = { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" };

const records: LoanRecord[] = [
  {
    book: { id: "b2", title: "Elmer" },
    since: "2026-09-11",
    status: "reading",
  },
  {
    book: { id: "b1", title: "El monstruo de colores" },
    since: "2026-09-04",
    status: "returned",
    returnedOn: "2026-09-11",
  },
  { book: undefined, since: "2026-08-28", status: "unreturned" },
];

describe("<LoanLog />", () => {
  it("names the card after the child and adds the loans up", () => {
    render(<LoanLog child={child} records={records} onEdit={() => {}} />);

    expect(screen.getByRole("heading", { name: "Rana" })).toBeDefined();
    expect(screen.getByText("1 libro devuelto, uno en casa")).toBeDefined();
  });

  it("dates every loan by what happened to it", () => {
    render(<LoanLog child={child} records={records} onEdit={() => {}} />);

    expect(screen.getByText("en casa desde el 11 sept")).toBeDefined();
    expect(screen.getByText("del 4 sept al 11 sept")).toBeDefined();
    expect(screen.getByText("se lo llevó el 28 ago y no volvió")).toBeDefined();
    expect(
      screen.getByText("Un libro que ya no está en la biblioteca"),
    ).toBeDefined();
  });

  it("says so when the child has taken nothing home yet", () => {
    render(<LoanLog child={child} records={[]} onEdit={() => {}} />);

    expect(screen.getByText("Aún no se ha llevado ningún libro")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("hands the pencil tap to the screen", () => {
    const onEdit = vi.fn();
    render(<LoanLog child={child} records={records} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar a Rana" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
