"use client";

import type { Concept, MasteryMap } from "@/lib/types";
import { getOverallMastery, getWeekMastery, sortByWeakness, getRecord } from "@/lib/mastery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function Dashboard({
  concepts,
  masteryMap,
  onStartExam,
  onReviewAll,
  onQuizConcept,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  onStartExam: () => void;
  onReviewAll: () => void;
  onQuizConcept: (conceptId: string) => void;
}) {
  const overall = getOverallMastery(concepts, masteryMap);
  const weak = sortByWeakness(concepts, masteryMap).slice(0, 5);

  const weeks = [1, 2, 3] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-rose-700">ADV 281 • Exam 2</div>
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
        {weeks.map((w) => {
          const m = getWeekMastery(concepts, masteryMap, w);
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
                      Week {c.week} • {mastery} • Correct {r.correct} / Incorrect {r.incorrect}
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

