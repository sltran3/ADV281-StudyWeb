"use client";

import * as React from "react";
import type { Concept, MasteryMap } from "@/lib/types";
import { applyAnswerResult, getRecord } from "@/lib/mastery";
import type { ExamAnswer, ExamSession } from "@/components/PracticeExam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

function percent(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function weekForConcept(concepts: readonly Concept[], conceptId: string) {
  return concepts.find((c) => c.id === conceptId)?.week ?? null;
}

export function ExamResults({
  concepts,
  masteryMap,
  session,
  onApplyMastery,
  onReviewConcept,
  onRetakeWeakSpots,
  onBackHome,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  session: ExamSession;
  onApplyMastery: (nextMap: MasteryMap) => void;
  onReviewConcept: (conceptId: string) => void;
  onRetakeWeakSpots: () => void;
  onBackHome: () => void;
}) {
  const correctCount = session.answers.filter((a) => a.isCorrect).length;
  const total = session.answers.length;
  const scorePct = percent(correctCount, total);

  const byWeek = React.useMemo(() => {
    const weeks = [1, 2, 3] as const;
    return weeks.map((w) => {
      const subset = session.answers.filter((a) => weekForConcept(concepts, a.question.conceptId) === w);
      const c = subset.filter((a) => a.isCorrect).length;
      const t = subset.length;
      return { week: w, correct: c, total: t, pct: percent(c, t) };
    });
  }, [session.answers, concepts]);

  const wrongConceptIds = React.useMemo(() => {
    const ids = new Set<string>();
    session.answers.forEach((a) => {
      if (!a.isCorrect) ids.add(a.question.conceptId);
    });
    return [...ids];
  }, [session.answers]);

  const appliedRef = React.useRef(false);
  React.useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    // Apply mastery updates once per session.
    let next = masteryMap;
    for (const a of session.answers as ExamAnswer[]) {
      next = applyAnswerResult(next, a.question.conceptId, a.isCorrect);
    }
    onApplyMastery(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Results & Weak Spots
          </h1>
          <div className="mt-1 text-sm text-zinc-600">
            Score: {correctCount}/{total} ({scorePct}%)
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBackHome}>
            Back to Dashboard
          </Button>
          <Button onClick={onRetakeWeakSpots}>Retake exam on weak spots</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {byWeek.map((w) => (
          <Card key={w.week}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Week {w.week}</CardTitle>
              <div className="text-xs text-zinc-500">
                {w.correct}/{w.total} correct
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Progress value={w.pct} />
              <div className="text-xs text-zinc-500">{w.pct}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Concept breakdown</CardTitle>
          <Badge variant={scorePct >= 80 ? "success" : scorePct >= 60 ? "warning" : "danger"}>
            {scorePct >= 80 ? "Strong" : scorePct >= 60 ? "Improving" : "Needs work"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-4">Concept</th>
                  <th className="py-2 pr-4">Week</th>
                  <th className="py-2 pr-4">Result</th>
                  <th className="py-2 pr-4">Mastery</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {session.answers.map((a, idx) => {
                  const concept = concepts.find((c) => c.id === a.question.conceptId);
                  const r = getRecord(masteryMap, a.question.conceptId);
                  const masteryLabel =
                    r.mastery === "mastered"
                      ? "🟢 Mastered"
                      : r.mastery === "needs-review"
                        ? "🟡 Needs review"
                        : "🔴 Not studied";
                  return (
                    <tr key={`${a.question.conceptId}-${idx}`} className="border-b last:border-b-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-zinc-900">
                          {concept?.topic ?? a.question.conceptId}
                        </div>
                        <div className="text-xs text-zinc-500">{a.question.conceptId}</div>
                      </td>
                      <td className="py-3 pr-4 text-zinc-700">{concept?.week ?? "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={a.isCorrect ? "success" : "danger"}>
                          {a.isCorrect ? "Correct" : "Wrong"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-zinc-700">{masteryLabel}</td>
                      <td className="py-3 pr-0 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onReviewConcept(a.question.conceptId)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Study these concepts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {wrongConceptIds.length === 0 ? (
            <div className="text-sm text-zinc-600">
              Nice work—no missed concepts this round.
            </div>
          ) : (
            wrongConceptIds.map((id) => {
              const c = concepts.find((x) => x.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onReviewConcept(id)}
                  className="rounded-lg border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50"
                >
                  <div className="text-sm font-medium text-zinc-900">
                    {c?.topic ?? id}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-600">
                    Week {c?.week ?? "—"} • {id}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

