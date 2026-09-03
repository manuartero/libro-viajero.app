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

type ClassroomScreenProps = {
  project: Project;
  onUpdate: (project: Project) => boolean;
};

export function ClassroomScreen({ project, onUpdate }: ClassroomScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  // A child with a book at home is only removed after an explicit confirm.
  const [confirmingRemove, setConfirmingRemove] = useState<Child | null>(null);

  const childList = project.children;
  const editing = childList.find((child) => child.id === editingId) ?? null;
  const others = childList.filter((child) => child.id !== editingId);
  const usedEmojis = others.map((child) => child.emoji);
  const usedColors = others.map((child) => child.color);

  const hasBook = (childId: string) =>
    project.currentAssignments.some((a) => a.childId === childId);

  const remove = (childId: string) => {
    if (onUpdate(removeChild({ project, childId }))) {
      setEditingId(null);
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

        <ChildBuilder
          key={editing?.id ?? `new-${childList.length}`}
          usedEmojis={usedEmojis}
          usedColors={usedColors}
          editing={editing}
          onAdd={(draft) => onUpdate(addChild({ project, draft }))}
          onSave={(child) => {
            if (onUpdate(saveChild({ project, child }))) {
              setEditingId(null);
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
          onCancel={() => setEditingId(null)}
        />

        <Roster
          childList={childList}
          editingId={editingId}
          onSelect={(childId) => {
            setConfirmingRemove(null);
            setEditingId((prev) => (prev === childId ? null : childId));
          }}
        />
      </main>
    </div>
  );
}
