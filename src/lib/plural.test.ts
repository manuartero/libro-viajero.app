import { describe, expect, it } from "vitest";
import { plural } from "./plural";

describe("plural()", () => {
  it("drops the s only for exactly one", () => {
    expect(plural({ count: 1, noun: "peque" })).toBe("1 peque");
    expect(plural({ count: 0, noun: "peque" })).toBe("0 peques");
    expect(plural({ count: 12, noun: "libro" })).toBe("12 libros");
  });
});
