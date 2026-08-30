export type Child = {
  id: string;
  tag: string; // teacher-chosen nickname, max 20 chars — never a real name
  emoji: string;
  color: string;
};

// A child being composed in the setup flow: identity is assigned on creation.
export type ChildDraft = Omit<Child, "id">;
