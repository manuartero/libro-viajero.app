import { useState } from "react";
import type { Child } from "src/child/child.model";
import { pluralPeques } from "src/child/child.model";
import { ChildBuilder } from "src/classroom/child-builder.component";
import { Roster } from "src/classroom/roster.component";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import type { Project } from "src/project/project.model";
import { addChild, removeChild, saveChild } from "src/project/project.model";
import { ProjectHeading } from "src/project/project-heading.component";
import styles from "./classroom-screen.module.css";

// The builder is one surface with three states. A union rather than an
// `editingId` plus an `adding` flag, because "adding while editing one child"
// is not a state this screen can be in and two booleans would allow it.
type BuilderState =
  | { status: "closed" }
  | { status: "adding" }
  | { status: "editing"; childId: string };

type ClassroomScreenProps = {
  project: Project;
  onUpdate: (project: Project) => boolean;
};

export function ClassroomScreen({ project, onUpdate }: ClassroomScreenProps) {
  const [builder, setBuilder] = useState<BuilderState>({ status: "closed" });
  // A child with a book at home is only removed after an explicit confirm.
  const [confirmingRemove, setConfirmingRemove] = useState<Child | null>(null);

  const childList = project.children;
  const editing =
    builder.status === "editing"
      ? (childList.find((child) => child.id === builder.childId) ?? null)
      : null;
  const others = childList.filter((child) => child.id !== editing?.id);
  const usedEmojis = others.map((child) => child.emoji);
  const usedColors = others.map((child) => child.color);

  const close = () => setBuilder({ status: "closed" });

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
          editingId={editing?.id ?? null}
          onSelect={(childId) => {
            setConfirmingRemove(null);
            setBuilder((prev) => {
              if (prev.status === "editing" && prev.childId === childId) {
                return { status: "closed" };
              }
              return { status: "editing", childId };
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

        {builder.status === "closed" && (
          <button
            type="button"
            className={styles.addTrigger}
            onClick={() => setBuilder({ status: "adding" })}
          >
            <span aria-hidden="true">+</span> Añadir un peque
          </button>
        )}

        {builder.status !== "closed" && (
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
                close();
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
            onCancel={close}
          />
        )}
      </main>
    </div>
  );
}
