import { fireEvent, render, screen } from "@testing-library/react";
import { EmojiPicker } from "src/classroom/emoji-picker.component";
import { describe, expect, it, vi } from "vitest";

// Arrow keys and the single tab stop are the browser's (real radios), so
// they are not asserted here.
const renderPicker = (props?: Partial<Parameters<typeof EmojiPicker>[0]>) => {
  const onPick = vi.fn();
  render(
    <EmojiPicker
      selectedEmoji={null}
      usedEmojis={[]}
      onPick={onPick}
      {...props}
    />,
  );
  return onPick;
};

describe("<EmojiPicker />", () => {
  it("marks the chosen emoji as checked", () => {
    renderPicker({ selectedEmoji: "🦊" });

    expect(
      screen.getByRole("radio", { name: "Zorro", checked: true }),
    ).toBeDefined();
    expect(
      screen.getByRole("radio", { name: "Rana", checked: false }),
    ).toBeDefined();
  });

  it("says which emojis another child already took", () => {
    renderPicker({ usedEmojis: ["🐸"] });

    expect(screen.getByRole("radio", { name: "Rana (en uso)" })).toBeDefined();
  });

  it("hands the whole catalog entry over, so the nickname can follow", () => {
    const onPick = renderPicker();

    fireEvent.click(screen.getByRole("radio", { name: "Zorro" }));

    expect(onPick).toHaveBeenCalledWith({ emoji: "🦊", name: "Zorro" });
  });
});
