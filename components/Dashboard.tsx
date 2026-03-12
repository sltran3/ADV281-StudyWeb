"use client";

import type { Concept, ExamFilter, MasteryMap } from "@/lib/types";
import { getOverallMastery, getWeekMastery, getRecord } from "@/lib/mastery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function Dashboard({
  concepts,
  masteryMap,
  examFilter,
  onStartExam,
  onReviewAll,
  onQuizConcept,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  examFilter: ExamFilter;
  onStartExam: () => void;
  onReviewAll: () => void;
  onQuizConcept: (conceptId: string) => void;
}) {
  const exam2Concepts = concepts.filter((c) => c.exam === 2);
  const exam3Concepts = concepts.filter((c) => c.exam === 3);

  const activeConcepts = examFilter === 2 ? exam2Concepts : exam3Concepts;
  const overall = getOverallMastery(activeConcepts, masteryMap);

  const weak = [...activeConcepts]
    .filter((c) => getRecord(masteryMap, c.id).mastery !== "mastered")
    .sort(
      (a, b) => getRecord(masteryMap, a.id).correct - getRecord(masteryMap, b.id).correct,
    )
    .slice(0, 5);

  const examWeeks = (list: readonly Concept[]) =>
    Array.from(new Set(list.map((c) => c.week))).sort((a, b) => a - b);

  const weeksForActive = examWeeks(activeConcepts);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-[#4E6B63]">
            {examFilter === 2 ? "ADV 281 • Exam 2" : "ADV 281 • Exam 3"}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Study Dashboard
          </h1>
          <div className="mt-1 text-sm text-zinc-600">
            {overall.mastered} / {overall.total} concepts mastered •{" "}
            {Math.round(overall.percent)}%
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onStartExam}>Start Practice Exam</Button>
          <Button variant="outline" onClick={onReviewAll}>
            Review All Concepts
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {weeksForActive.map((w) => {
          const m = getWeekMastery(activeConcepts, masteryMap, w);
          return (
            <Card key={w}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Week {w}</CardTitle>
                <div className="text-xs text-zinc-500">
                  {m.mastered} / {m.total} mastered
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={m.percent} />
                <div className="text-xs text-zinc-500">
                  {Math.round(m.percent)}% mastery
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Weak Spots</CardTitle>
          <Badge variant="indigo">Focus list</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {weak.map((c) => {
              const r = getRecord(masteryMap, c.id);
              const mastery =
                r.mastery === "mastered"
                  ? "🟢 Mastered"
                  : r.mastery === "needs-review"
                    ? "🟡 Needs review"
                    : "🔴 Not studied";
              return (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{c.topic}</div>
                    <div className="mt-0.5 text-xs text-zinc-600">
                      Week {c.week} • Exam {c.exam} • {mastery} • Correct {r.correct} / Incorrect{" "}
                      {r.incorrect}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => onQuizConcept(c.id)}>
                    Quiz me
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

