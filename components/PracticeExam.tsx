"use client";

import * as React from "react";
import type { Concept, MasteryMap, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionCard } from "@/components/QuestionCard";

type ExamType = "full" | "by-week" | "weak-spots" | "hard-mode" | "not-studied";

export type ExamAnswer = {
  question: Question;
  selected: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
};

export type ExamSession = {
  examType: ExamType;
  scopeLabel: string;
  config: { count: 5 | 10 | 15 | 20; weekFilter?: 1 | 2 | 3 };
  questions: Question[];
  answers: ExamAnswer[];
};

export function PracticeExam({
  concepts,
  masteryMap: _masteryMap,
  initialRequest,
  onFinished,
  onCancel,
  onOptimisticAnswer,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  initialRequest?:
    | null
    | { examType: ExamType; weekFilter?: number; conceptIds?: string[] };
  onFinished: (session: ExamSession) => void;
  onCancel: () => void;
  onOptimisticAnswer: (conceptId: string, wasCorrect: boolean) => void;
}) {
  const [count, setCount] = React.useState<5 | 10 | 15 | 20>(10);
  const [examType, setExamType] = React.useState<ExamType>("full");
  const [weekFilter, setWeekFilter] = React.useState<1 | 2 | 3>(1);

  const [loading, setLoading] = React.useState(false);
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [selected, setSelected] = React.useState<"A" | "B" | "C" | "D" | null>(null);
  const [reveal, setReveal] = React.useState(false);
  const [answers, setAnswers] = React.useState<ExamAnswer[]>([]);

  const start = React.useCallback(async () => {
    setLoading(true);
    setQuestions(null);
    setActiveIdx(0);
    setSelected(null);
    setReveal(false);
    setAnswers([]);

    try {
      const conceptIds = initialRequest?.conceptIds?.length ? initialRequest.conceptIds : undefined;
      const effectiveExamType = initialRequest?.examType ?? examType;
      const effectiveWeek =
        effectiveExamType === "by-week" ? (initialRequest?.weekFilter ?? weekFilter) : undefined;
      const effectiveCount =
        conceptIds && conceptIds.length === 1 ? (5 as const) : count;

      const res = await fetch("/api/get-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType: effectiveExamType,
          count: effectiveCount,
          weekFilter: effectiveWeek,
          conceptIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`Question fetch failed (${res.status})`);
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
  }, [count, examType, initialRequest, weekFilter]);

  React.useEffect(() => {
    if (!initialRequest) return;
    setExamType(initialRequest.examType);
    if (initialRequest.examType === "by-week" && typeof initialRequest.weekFilter === "number") {
      const w = initialRequest.weekFilter === 2 ? 2 : initialRequest.weekFilter === 3 ? 3 : 1;
      setWeekFilter(w);
    }
    if (initialRequest.conceptIds && initialRequest.conceptIds.length === 1) setCount(5);
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRequest]);

  const current = questions?.[activeIdx] ?? null;
  const total = questions?.length ?? 0;
  const progress = total ? ((activeIdx + 1) / total) * 100 : 0;

  const choose = (c: "A" | "B" | "C" | "D") => {
    if (!current) return;
    if (reveal) return;
    const isCorrect = c === current.correct;
    onOptimisticAnswer(current.conceptId, isCorrect);
    fetch("/api/record-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: current.id,
        conceptId: current.conceptId,
        wasCorrect: isCorrect,
        selected: c,
        sessionId: null,
      }),
    }).catch(() => {});
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
      const effectiveExamType = initialRequest?.examType ?? examType;
      const scopeLabel =
        effectiveExamType === "by-week"
          ? `Week ${initialRequest?.weekFilter ?? weekFilter}`
          : effectiveExamType === "weak-spots"
            ? "Weak Spots"
            : effectiveExamType === "hard-mode"
              ? "Hard Mode"
              : effectiveExamType === "not-studied"
                ? "Not Studied Yet"
                : initialRequest?.conceptIds && initialRequest.conceptIds.length === 1
                  ? `Concept ${initialRequest.conceptIds[0]}`
                  : "All";

      onFinished({
        examType: effectiveExamType,
        scopeLabel,
        config: {
          count: (initialRequest?.conceptIds && initialRequest.conceptIds.length === 1 ? 5 : count) as
            | 5
            | 10
            | 15
            | 20,
          weekFilter: effectiveExamType === "by-week" ? (weekFilter as 1 | 2 | 3) : undefined,
        },
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
  };

  if (!questions && !loading && !initialRequest) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Practice Exam
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Configure your exam, then pull questions instantly from the question bank.
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
                {[5, 10, 15, 20].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={count === n ? "default" : "outline"}
                    onClick={() => setCount(n as 5 | 10 | 15 | 20)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-zinc-900">Exam type</div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["full", "Full Exam"],
                  ["by-week", "By Week"],
                  ["weak-spots", "Weak Spots"],
                  ["hard-mode", "Hard Mode"],
                  ["not-studied", "Not Studied Yet"],
                ].map(([k, label]) => (
                  <Button
                    key={k}
                    type="button"
                    variant={examType === (k as ExamType) ? "default" : "outline"}
                    onClick={() => setExamType(k as ExamType)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {examType === "by-week" ? (
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-medium text-zinc-900">Week filter</div>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((w) => (
                    <Button
                      key={w}
                      type="button"
                      variant={weekFilter === w ? "default" : "outline"}
                      onClick={() => setWeekFilter(w)}
                    >
                      Week {w}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-xs text-zinc-500">
              Questions come from a question bank generated by AI.
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
              Loading questions…
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Pulling from the question bank.
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
            <CardTitle className="text-base">Couldn’t load questions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600">
            Make sure your Supabase env vars are set and you’ve seeded questions.
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
        timed={false}
        secondsLeft={null}
      />
    </div>
  );
}

