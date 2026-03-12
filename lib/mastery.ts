import type { Concept, MasteryLevel, MasteryMap, MasteryRecord } from "@/lib/types";

const STORAGE_KEY = "adv281_mastery_v1";

export function computeMasteryLevel(record: Pick<MasteryRecord, "correct" | "incorrect">): MasteryLevel {
  const { correct, incorrect } = record;

  if (correct === 0 && incorrect === 0) return "not-studied";
  if (correct >= 3 && correct > incorrect) return "mastered";
  if (correct < 2 || incorrect > correct) return "needs-review";
  return "needs-review";
}

export function getEmptyRecord(): MasteryRecord {
  return { correct: 0, incorrect: 0, mastery: "not-studied" };
}

export function readMasteryMap(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as MasteryMap;
  } catch {
    return {};
  }
}

export function writeMasteryMap(map: MasteryMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
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
  const weaknessScore = (c: Concept) => {
    const r = getRecord(map, c.id);
    const masteryRank: Record<MasteryLevel, number> = {
      "not-studied": 0,
      "needs-review": 1,
      "mastered": 2,
    };
    // Lower mastery first, then fewer correct, then more incorrect.
    return [masteryRank[r.mastery], r.correct, -r.incorrect] as const;
  };

  return [...concepts].sort((a, b) => {
    const [am, ac, ai] = weaknessScore(a);
    const [bm, bc, bi] = weaknessScore(b);
    if (am !== bm) return am - bm;
    if (ac !== bc) return ac - bc;
    if (ai !== bi) return ai - bi;
    return a.topic.localeCompare(b.topic);
  });
}

