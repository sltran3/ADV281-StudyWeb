"use client";

import * as React from "react";
import type { Concept, MasteryMap, Question } from "@/lib/types";
import { sortByWeakness } from "@/lib/mastery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/QuestionCard";

type Scope = "all" | "week-1" | "week-2" | "week-3" | "weak";

export type ExamAnswer = {
  question: Question;
  selected: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
};

export type ExamSession = {
  config: { count: 5 | 10 | 15; scope: Scope; timed: boolean };
  questions: Question[];
  answers: ExamAnswer[];
};

function buildConceptIds({
  concepts,
  masteryMap,
  scope,
  weakCount,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  scope: Scope;
  weakCount: number;
}) {
  if (scope === "all") return concepts.map((c) => c.id);
  if (scope === "week-1") return concepts.filter((c) => c.week === 1).map((c) => c.id);
  if (scope === "week-2") return concepts.filter((c) => c.week === 2).map((c) => c.id);
  if (scope === "week-3") return concepts.filter((c) => c.week === 3).map((c) => c.id);
  const weak = sortByWeakness(concepts, masteryMap).slice(0, weakCount);
  return weak.map((c) => c.id);
}

export function PracticeExam({
  concepts,
  masteryMap,
  initialConceptIds,
  onFinished,
  onCancel,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  initialConceptIds?: string[] | null;
  onFinished: (session: ExamSession) => void;
  onCancel: () => void;
}) {
  const [count, setCount] = React.useState<5 | 10 | 15>(10);
  const [scope, setScope] = React.useState<Scope>("all");
  const [timed, setTimed] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<"A" | "B" | "C" | "D" | null>(null);
  const [reveal, setReveal] = React.useState(false);
  const [answers, setAnswers] = React.useState<ExamAnswer[]>([]);

  const [secondsLeft, setSecondsLeft] = React.useState<number | null>(null);

  const examCount: 5 | 10 | 15 =
    initialConceptIds && initialConceptIds.length === 1 ? 5 : count;

  const effectiveTimed = Boolean(timed && !(initialConceptIds && initialConceptIds.length === 1));

  const conceptIds = React.useMemo(() => {
    if (initialConceptIds && initialConceptIds.length) return initialConceptIds;
    return buildConceptIds({ concepts, masteryMap, scope, weakCount: 8 });
  }, [concepts, masteryMap, scope, initialConceptIds]);

  const start = React.useCallback(async () => {
    setLoading(true);
    setQuestions(null);
    setActiveIdx(0);
    setSelected(null);
    setReveal(false);
    setAnswers([]);
    setSecondsLeft(effectiveTimed ? 60 : null);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptIds, count: examCount }),
      });

      if (!res.ok) {
        throw new Error(`Question generation failed (${res.status})`);
      }

      const data = (await res.json()) as unknown;
      if (!Array.isArray(data)) throw new Error("Invalid response shape");
      setQuestions(data as Question[]);
    } catch (e) {
      console.error(e);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [conceptIds, examCount, effectiveTimed]);

  React.useEffect(() => {
    if (!initialConceptIds?.length) return;
    start();
  }, [initialConceptIds, start]);

  React.useEffect(() => {
    if (!effectiveTimed) return;
    if (!questions || questions.length === 0) return;
    if (reveal) return;

    setSecondsLeft(60);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (typeof s !== "number") return s;
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [effectiveTimed, activeIdx, questions, reveal]);

  React.useEffect(() => {
    if (!effectiveTimed) return;
    if (!questions || questions.length === 0) return;
    if (reveal) return;
    if (secondsLeft !== 0) return;

    // Time ran out: reveal as incorrect (or evaluate chosen answer).
    setReveal(true);
  }, [effectiveTimed, secondsLeft, questions, reveal]);

  const current = questions?.[activeIdx] ?? null;
  const total = questions?.length ?? 0;
  const progress = total ? ((activeIdx + 1) / total) * 100 : 0;

  const choose = (c: "A" | "B" | "C" | "D") => {
    if (!current) return;
    if (reveal) return;
    setSelected(c);
    setReveal(true);
  };

  const next = () => {
    if (!current || !questions) return;
    const selectedChoice = selected;
    const isCorrect = selectedChoice === current.correct;

    setAnswers((prev) => [
      ...prev,
      { question: current, selected: selectedChoice, isCorrect },
    ]);

    const isLast = activeIdx === questions.length - 1;
    if (isLast) {
      onFinished({
        config: { count: examCount, scope, timed: effectiveTimed },
        questions,
        answers: [
          ...answers,
          { question: current, selected: selectedChoice, isCorrect },
        ],
      });
      return;
    }

    setActiveIdx((i) => i + 1);
    setSelected(null);
    setReveal(false);
    setSecondsLeft(effectiveTimed ? 60 : null);
  };

  if (!questions && !loading && !(initialConceptIds?.length)) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Practice Exam
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Configure your quiz, then generate AI questions with immediate feedback.
            </p>
          </div>
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Number of questions</div>
              <div className="flex gap-2">
                {[5, 10, 15].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={count === n ? "default" : "outline"}
                    onClick={() => setCount(n as 5 | 10 | 15)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Scope</div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "All weeks"],
                  ["week-1", "Week 1"],
                  ["week-2", "Week 2"],
                  ["week-3", "Week 3"],
                  ["weak", "Weak spots"],
                ].map(([k, label]) => (
                  <Button
                    key={k}
                    type="button"
                    variant={scope === (k as Scope) ? "default" : "outline"}
                    onClick={() => setScope(k as Scope)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                <div>
                  <div className="text-sm font-medium text-zinc-900">Timed mode</div>
                  <div className="text-xs text-zinc-600">60 seconds per question</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTimed((v) => !v)}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-900 hover:bg-zinc-50"
                >
                  {timed ? "On" : "Off"}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-zinc-500">
              Scope includes {conceptIds.length} concept(s).
            </div>
            <Button onClick={start}>Generate Exam</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Generating questions…
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Calling Claude to build your exam.
            </p>
          </div>
          <Button variant="outline" onClick={onCancel} disabled>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Loading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="grid gap-2 pt-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current || !questions || questions.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Couldn’t generate questions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600">
            Check your API key in <span className="font-mono">.env.local</span> and try again.
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Back
            </Button>
            <Button onClick={start}>Try again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Practice Exam
          </h1>
          <div className="mt-1 text-sm text-zinc-600">
            Question {activeIdx + 1} of {total}
          </div>
        </div>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Exit
        </Button>
      </div>

      <Progress value={progress} />

      <QuestionCard
        question={current}
        selected={selected}
        reveal={reveal}
        onSelect={choose}
        onNext={next}
        isLast={activeIdx === total - 1}
        timed={effectiveTimed}
        secondsLeft={secondsLeft}
      />
    </div>
  );
}

