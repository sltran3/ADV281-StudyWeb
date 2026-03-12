export type MasteryLevel = "not-studied" | "needs-review" | "mastered";

export interface Concept {
  id: string;
  week: number;
  chapter: number;
  topic: string;
  summary: string;
}

export interface Question {
  question: string;
  choices: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  conceptId: string;
}

export interface MasteryRecord {
  correct: number;
  incorrect: number;
  mastery: MasteryLevel;
}

export type MasteryMap = Record<string, MasteryRecord>;
