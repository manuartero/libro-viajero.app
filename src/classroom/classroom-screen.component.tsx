import { useState } from "react";
import type { Child } from "src/child/child.model";
import { pluralPeques } from "src/child/child.model";
import { ChildBuilder } from "src/classroom/child-builder.component";
import { LoanLog } from "src/classroom/loan-log.component";
import { Roster } from "src/classroom/roster.component";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { loanLogOf } from "src/project/loan-log.model";
import type { Project } from "src/project/project.model";
import { addChild, removeChild, saveChild } from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./classroom-screen.module.css";

// What sits under the roster is one surface with four states: nothing, the
// add form, a child's loan card, or that child's edit form. A union rather
// than a `selectedId` plus flags, because "adding while a card is open" is
// not a state this screen can be in and separate booleans would allow it.
type Panel =
  | { status: "closed" }
  | { status: "adding" }
  | { status: "viewing"; childId: string }
  | { status: "editing"; childId: string };

type ClassroomScreenProps = {
  project: Project;
  onUpdate: (project: Project) => boolean;
};

export function ClassroomScreen({ project, onUpdate }: ClassroomScreenProps) {
  const [panel, setPanel] = useState<Panel>({ status: "closed" });
  // A child with a book at home is only removed after an explicit confirm.
  const [confirmingRemove, setConfirmingRemove] = useState<Child | null>(null);

  const childList = project.children;
  const selected =
    panel.status === "viewing" || panel.status === "editing"
      ? (childList.find((child) => child.id === panel.childId) ?? null)
      : null;
  const editing = panel.status === "editing" ? selected : null;
  const others = childList.filter((child) => child.id !== editing?.id);
  const usedEmojis = others.map((child) => child.emoji);
  const usedColors = others.map((child) => child.color);

  const close = () => setPanel({ status: "closed" });
  // Back to the card the edit form was opened from.
  const view = (childId: string) => setPanel({ status: "viewing", childId });

  const hasBook = (childId: string) =>
    project.currentAssignments.some((a) => a.childId === childId);

  const remove = (childId: string) => {
    if (onUpdate(removeChild({ project, childId }))) {
      close();
      setConfirmingRemove(null);
    }
  };

  return (
    <div className={styles.screen}>
      <ProjectHeading
        name={project.name}
        dateline={`La clase · ${pluralPeques(childList.length)}`}
      />

      <main className={styles.main}>
        <Roster
          childList={childList}
          selectedId={selected?.id ?? null}
          onSelect={(childId) => {
            setConfirmingRemove(null);
            setPanel((prev) => {
              if (prev.status !== "adding" && prev.status !== "closed") {
                if (prev.childId === childId) {
                  return { status: "closed" };
                }
              }
              return { status: "viewing", childId };
            });
          }}
        />

        {/* Directly above the builder, so it opens where the "Quitar" tap was
            rather than a screenful of chips away from it. */}
        {confirmingRemove && (
          <ConfirmPanel
            label={`Quitar a ${confirmingRemove.tag}`}
            confirmText="Sí, quitarlo"
            cancelText="No, mantenerlo"
            onConfirm={() => remove(confirmingRemove.id)}
            onCancel={() => setConfirmingRemove(null)}
          >
            «{confirmingRemove.tag}» tiene un libro en casa. Si lo quitas, el
            libro vuelve a la biblioteca.
          </ConfirmPanel>
        )}

        {panel.status === "viewing" && selected && (
          <LoanLog
            key={selected.id}
            child={selected}
            records={loanLogOf({ project, childId: selected.id })}
            onEdit={() => setPanel({ status: "editing", childId: selected.id })}
          />
        )}

        {(panel.status === "adding" || editing) && (
          <ChildBuilder
            key={editing?.id ?? `new-${childList.length}`}
            usedEmojis={usedEmojis}
            usedColors={usedColors}
            editing={editing}
            // Stays in "adding": the setup burst is tap-emoji, tap-añadir,
            // twenty times over, and reopening the builder per child doubles it.
            onAdd={(draft) => onUpdate(addChild({ project, draft }))}
            onSave={(child) => {
              if (onUpdate(saveChild({ project, child }))) {
                view(child.id);
              }
            }}
            onRemove={(childId) => {
              if (hasBook(childId)) {
                const child = childList.find((c) => c.id === childId) ?? null;
                setConfirmingRemove(child);
                return;
              }
              remove(childId);
            }}
            onCancel={() => {
              if (editing) {
                view(editing.id);
                return;
              }
              close();
            }}
          />
        )}

        {/* Reading a card is not filling a form: the add bar stays put under
            it, so checking on one peque mid-setup costs no extra tap. */}
        {(panel.status === "closed" || panel.status === "viewing") && (
          <button
            type="button"
            className={styles.addTrigger}
            onClick={() => setPanel({ status: "adding" })}
          >
            <span aria-hidden="true">+</span> Añadir un peque
          </button>
        )}
      </main>
    </div>
  );
}
