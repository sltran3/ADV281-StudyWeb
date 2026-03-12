import type { Concept, MasteryLevel, MasteryMap, MasteryRecord } from "@/lib/types";

export function computeMasteryLevel(record: Pick<MasteryRecord, "correct" | "incorrect">): MasteryLevel {
  const { correct, incorrect } = record;

  if (correct >= 3 && correct > incorrect) return "mastered";
  if (correct >= 1 || incorrect >= 1) return "needs-review";
  return "not-studied";
}

export function getEmptyRecord(): MasteryRecord {
  return { correct: 0, incorrect: 0, mastery: "not-studied" };
}

export function getRecord(map: MasteryMap, conceptId: string): MasteryRecord {
  return map[conceptId] ?? getEmptyRecord();
}

export function upsertRecord(map: MasteryMap, conceptId: string, record: MasteryRecord): MasteryMap {
  return { ...map, [conceptId]: record };
}

export function applyAnswerResult(
  map: MasteryMap,
  conceptId: string,
  isCorrect: boolean,
): MasteryMap {
  const prev = getRecord(map, conceptId);
  const nextCounts = {
    correct: prev.correct + (isCorrect ? 1 : 0),
    incorrect: prev.incorrect + (isCorrect ? 0 : 1),
  };
  const mastery = computeMasteryLevel(nextCounts);
  return upsertRecord(map, conceptId, { ...nextCounts, mastery });
}

export function getWeekMastery(concepts: readonly Concept[], map: MasteryMap, week: number) {
  const weekConcepts = concepts.filter((c) => c.week === week);
  const mastered = weekConcepts.filter((c) => getRecord(map, c.id).mastery === "mastered").length;
  return { mastered, total: weekConcepts.length, percent: weekConcepts.length ? (mastered / weekConcepts.length) * 100 : 0 };
}

export function getOverallMastery(concepts: readonly Concept[], map: MasteryMap) {
  const mastered = concepts.filter((c) => getRecord(map, c.id).mastery === "mastered").length;
  return { mastered, total: concepts.length, percent: concepts.length ? (mastered / concepts.length) * 100 : 0 };
}

export function sortByWeakness(concepts: readonly Concept[], map: MasteryMap): Concept[] {
  return [...concepts].sort((a, b) => {
    const ar = getRecord(map, a.id);
    const br = getRecord(map, b.id);
    const aRank = ar.mastery === "mastered" ? 2 : ar.mastery === "needs-review" ? 1 : 0;
    const bRank = br.mastery === "mastered" ? 2 : br.mastery === "needs-review" ? 1 : 0;
    if (aRank !== bRank) return aRank - bRank;
    if (ar.correct !== br.correct) return ar.correct - br.correct;
    return a.topic.localeCompare(b.topic);
  });
}

