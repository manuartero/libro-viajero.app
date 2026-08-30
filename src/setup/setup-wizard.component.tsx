import { useState } from "react";
import type { Child } from "src/child/child.model";
import type { Project } from "src/project/project.model";
import { currentSchoolYear, schoolYearFrom } from "src/project/school-year";
import type { ChildDraft } from "src/setup/child-builder.component";
import { ChildrenStep } from "src/setup/children-step.component";
import { ClassNameStep } from "src/setup/class-name-step.component";

type SetupWizardProps = {
  onCreate: (project: Project) => void;
};

export function SetupWizard({ onCreate }: SetupWizardProps) {
  const [step, setStep] = useState<"name" | "children">("name");
  const [classroomName, setClassroomName] = useState("");
  const [yearStart, setYearStart] = useState(() => currentSchoolYear().start);
  const [childList, setChildList] = useState<Child[]>([]);

  const year = schoolYearFrom(yearStart);

  const addChild = (draft: ChildDraft) => {
    setChildList((prev) => [...prev, { id: crypto.randomUUID(), ...draft }]);
  };

  const saveChild = (child: Child) => {
    setChildList((prev) => prev.map((c) => (c.id === child.id ? child : c)));
  };

  const removeChild = (childId: string) => {
    setChildList((prev) => prev.filter((c) => c.id !== childId));
  };

  const createProject = () => {
    onCreate({
      id: crypto.randomUUID(),
      name: `${classroomName.trim()} ${year.short}`,
      children: childList,
      books: [],
      currentAssignments: [],
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

  return (
    <ChildrenStep
      classroomName={classroomName.trim()}
      yearShort={year.short}
      childList={childList}
      onBack={() => setStep("name")}
      onAdd={addChild}
      onSave={saveChild}
      onRemove={removeChild}
      onCreate={createProject}
    />
  );
}
