// Navigation is a single serializable value — no router (see SPEC.md).
export type Tab = "semana" | "clase" | "biblioteca";

// "repartir" is a full-screen flow launched from the dashboard: the tab bar
// hides while it is active and its back button returns to "semana".
export type View = Tab | "repartir";
