import { render, screen } from "@testing-library/react";
import { ReaderLog } from "src/library/reader-log.component";
import type { ReaderRecord } from "src/loan/loan-log.model";
import { describe, expect, it } from "vitest";

const elmer = { id: "b1", title: "Elmer" };
const rana = { id: "c1", tag: "Rana", emoji: "🐸", color: "#8ac926" };
const zorro = { id: "c2", tag: "Zorro", emoji: "🦊", color: "#f3722c" };

const records: ReaderRecord[] = [
  { child: zorro, since: "2026-09-11", status: "reading" },
  {
    child: rana,
    since: "2026-09-04",
    status: "returned",
    returnedOn: "2026-09-11",
  },
  { child: undefined, since: "2026-08-28", status: "unreturned" },
];

describe("<ReaderLog />", () => {
  it("counts the trips and names who has the book now", () => {
    render(<ReaderLog book={elmer} records={records} />);

    expect(
      screen.getByRole("region", { name: "Viajes de Elmer" }),
    ).toBeDefined();
    expect(
      screen.getByText("3 viajes, ahora en casa de «Zorro»"),
    ).toBeDefined();
  });

  it("dates every trip by what happened to it", () => {
    render(<ReaderLog book={elmer} records={records} />);

    expect(screen.getByText("en casa desde el 11 sept")).toBeDefined();
    expect(screen.getByText("del 4 sept al 11 sept")).toBeDefined();
    expect(screen.getByText("se lo llevó el 28 ago y no volvió")).toBeDefined();
    expect(
      screen.getByText("Un peque que ya no está en la clase"),
    ).toBeDefined();
  });

  it("only names the reader on the first trip", () => {
    render(<ReaderLog book={elmer} records={records.slice(0, 1)} />);

    expect(screen.getByText("En casa de «Zorro»")).toBeDefined();
  });

  it("says so when the book has not left the class yet", () => {
    render(<ReaderLog book={elmer} records={[]} />);

    expect(screen.getByText("Aún no ha salido de la clase")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
