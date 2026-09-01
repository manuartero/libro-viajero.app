import { useState } from "react";
import type { Book, BookDraft } from "src/book/book.model";
import type { Child, ChildDraft } from "src/child/child.model";
import { newId } from "src/lib/id";
import { mondayOf } from "src/lib/week";
import type { Pairing, Project } from "src/project/project.model";
import {
  currentSchoolYear,
  schoolYearFrom,
} from "src/project/school-year.model";
import { AssignStep } from "src/setup/assign-step.component";
import { BooksStep } from "src/setup/books-step.component";
import { ChildrenStep } from "src/setup/children-step.component";
import { ClassNameStep } from "src/setup/class-name-step.component";

const withoutChild = ({
  pairs,
  childId,
}: {
  pairs: Pairing;
  childId: string;
}): Pairing => {
  const { [childId]: _removed, ...rest } = pairs;
  return rest;
};

const withoutBook = ({
  pairs,
  bookId,
}: {
  pairs: Pairing;
  bookId: string;
}): Pairing =>
  Object.fromEntries(
    Object.entries(pairs).filter(([, pairedBookId]) => pairedBookId !== bookId),
  );

type SetupWizardProps = {
  onCreate: (project: Project) => void;
};

export function SetupWizard({ onCreate }: SetupWizardProps) {
  const [step, setStep] = useState<"name" | "children" | "books" | "assign">(
    "name",
  );
  const [classroomName, setClassroomName] = useState("");
  const [yearStart, setYearStart] = useState(() => currentSchoolYear().start);
  const [childList, setChildList] = useState<Child[]>([]);
  const [bookList, setBookList] = useState<Book[]>([]);
  // Pruned whenever either side is removed.
  const [pairs, setPairs] = useState<Pairing>({});

  const year = schoolYearFrom(yearStart);

  const addChild = (draft: ChildDraft) => {
    setChildList((prev) => [...prev, { id: newId(), ...draft }]);
  };

  const saveChild = (child: Child) => {
    setChildList((prev) => prev.map((c) => (c.id === child.id ? child : c)));
  };

  const removeChild = (childId: string) => {
    setChildList((prev) => prev.filter((c) => c.id !== childId));
    setPairs((prev) => withoutChild({ pairs: prev, childId }));
  };

  const addBook = (draft: BookDraft) => {
    setBookList((prev) => [...prev, { id: newId(), ...draft }]);
  };

  const removeBook = (bookId: string) => {
    setBookList((prev) => prev.filter((b) => b.id !== bookId));
    setPairs((prev) => withoutBook({ pairs: prev, bookId }));
  };

  const assignBook = ({
    childId,
    bookId,
  }: {
    childId: string;
    bookId: string;
  }) => {
    // One book, one child: strip the book from any other pairing first.
    setPairs((prev) => ({
      ...withoutBook({ pairs: prev, bookId }),
      [childId]: bookId,
    }));
  };

  const unassignChild = (childId: string) => {
    setPairs((prev) => withoutChild({ pairs: prev, childId }));
  };

  const createProject = () => {
    const weekStart = mondayOf();
    onCreate({
      id: newId(),
      name: `${classroomName.trim()} ${year.short}`,
      children: childList,
      books: bookList,
      currentAssignments: childList.map((child) => ({
        childId: child.id,
        bookId: pairs[child.id],
        weekStart,
      })),
      history: [],
    });
  };

  if (step === "name") {
    return (
      <ClassNameStep
        classroomName={classroomName}
        yearStart={yearStart}
        onClassroomNameChange={setClassroomName}
        onYearStartChange={setYearStart}
        onNext={() => setStep("children")}
      />
    );
  }

  if (step === "children") {
    return (
      <ChildrenStep
        classroomName={classroomName.trim()}
        yearShort={year.short}
        childList={childList}
        onBack={() => setStep("name")}
        onAdd={addChild}
        onSave={saveChild}
        onRemove={removeChild}
        onNext={() => setStep("books")}
      />
    );
  }

  if (step === "books") {
    return (
      <BooksStep
        classroomName={classroomName.trim()}
        yearShort={year.short}
        childCount={childList.length}
        bookList={bookList}
        onBack={() => setStep("children")}
        onAdd={addBook}
        onRemove={removeBook}
        onNext={() => setStep("assign")}
      />
    );
  }

  return (
    <AssignStep
      classroomName={classroomName.trim()}
      yearShort={year.short}
      childList={childList}
      bookList={bookList}
      pairs={pairs}
      onBack={() => setStep("books")}
      onAssign={assignBook}
      onUnassign={unassignChild}
      onCreate={createProject}
    />
  );
}
