export type MasteryLevel = "not-studied" | "needs-review" | "mastered";

export type ExamId = 2 | 3;
export type ExamFilter = ExamId;

export interface Concept {
  id: string;
  exam: ExamId;
  week: number;
  chapter: number;
  topic: string;
  summary: string;
}

export interface Question {
  id: string;
  question: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  conceptId: string;
  difficulty?: "easy" | "medium" | "hard";
  week?: number;
}

export interface MasteryRecord {
  correct: number;
  incorrect: number;
  mastery: MasteryLevel;
}

export type MasteryMap = Record<string, MasteryRecord>;

export type ConceptMasteryRow = {
  id: string;
  concept_id: string;
  correct: number;
  incorrect: number;
  mastery: MasteryLevel;
  last_seen: string | null;
  updated_at: string | null;
};
