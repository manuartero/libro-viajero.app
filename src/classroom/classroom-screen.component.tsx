import { useState } from "react";
import type { Child } from "src/child/child.model";
import { pluralPeques } from "src/child/child.model";
import { ChildBuilder } from "src/classroom/child-builder.component";
import { LoanLog } from "src/classroom/loan-log.component";
import { Roster } from "src/classroom/roster.component";
import { ConfirmPanel } from "src/confirm/confirm-panel.component";
import { loanLogOf } from "src/loan/loan-log.model";
import { Masthead } from "src/masthead/masthead.component";
import type { Project } from "src/project/project.model";
import { addChild, removeChild, saveChild } from "src/project/project.model";
import styles from "./classroom-screen.module.css";

// A union rather than `selectedId` plus flags: "adding while a card is open"
// is not a state this screen can be in.
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
  const view = (childId: string) => setPanel({ status: "viewing", childId });

  const hasBook = (childId: string) =>
    project.currentAssignments.some((a) => a.childId === childId);

  const remove = (childId: string) => {
    if (onUpdate(removeChild({ project, childId }))) {
      close();
      setConfirmingRemove(null);
    }
  };

  const toggleCard = (childId: string) => {
    setConfirmingRemove(null);
    setPanel((prev) => {
      if (prev.status !== "adding" && prev.status !== "closed") {
        if (prev.childId === childId) {
          return { status: "closed" };
        }
      }
      return { status: "viewing", childId };
    });
  };

  const saveEdits = (child: Child) => {
    if (onUpdate(saveChild({ project, child }))) {
      view(child.id);
    }
  };

  const requestRemove = (childId: string) => {
    if (hasBook(childId)) {
      const child = childList.find((c) => c.id === childId) ?? null;
      setConfirmingRemove(child);
      return;
    }
    remove(childId);
  };

  const leaveBuilder = () => {
    if (editing) {
      view(editing.id);
      return;
    }
    close();
  };

  return (
    <div className={styles.screen}>
      <Masthead
        name={project.name}
        dateline={`La clase · ${pluralPeques(childList.length)}`}
      />

      <main className={styles.main}>
        <Roster
          childList={childList}
          selectedId={selected?.id ?? null}
          onSelect={toggleCard}
        />

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
            onAdd={(draft) => onUpdate(addChild({ project, draft }))}
            onSave={saveEdits}
            onRemove={requestRemove}
            onCancel={leaveBuilder}
          />
        )}

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
