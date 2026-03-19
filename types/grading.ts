import type { AssignmentType, GradebookEntry, Student, Assignment } from "./database";

// Assignment type options for forms
export const ASSIGNMENT_TYPES: Array<{ value: AssignmentType; label: string }> = [
  { value: "classwork", label: "Classwork" },
  { value: "homework", label: "Homework" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "exit_ticket", label: "Exit Ticket" },
];

// Gradebook category options
export const GRADEBOOK_CATEGORIES = [
  { value: "classwork", label: "Classwork" },
  { value: "homework", label: "Homework" },
  { value: "assessment", label: "Assessment" },
  { value: "project", label: "Project" },
  { value: "participation", label: "Participation" },
] as const;

export type GradebookCategoryValue = (typeof GRADEBOOK_CATEGORIES)[number]["value"];

// Composite type for a single cell in the gradebook grid
export interface GradebookCell {
  entryId: string | null;
  studentId: string;
  assignmentId: string;
  rawScore: number | null;
  pctScore: number | null;
  displayLabel: string | null;
  isMissing: boolean;
  isExtraCredit: boolean;
  isDropped: boolean;
}

// Composite type for a full row (one student) in the gradebook grid
export interface GradebookRow {
  student: Pick<Student, "id" | "display_name">;
  cells: Record<string, GradebookCell>; // keyed by assignment_id
  periodAverage: number | null;
}

// Data shape returned by the gradebook API
export interface GradebookData {
  students: Array<Pick<Student, "id" | "display_name">>;
  assignments: Array<Pick<Assignment, "id" | "title" | "type" | "category" | "points_possible" | "due_at" | "extra_credit" | "rubric_id">>;
  entries: GradebookEntry[];
  categoryWeights: Array<{ category_name: string; weight_pct: number }>;
}
