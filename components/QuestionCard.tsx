"use client";

import * as React from "react";
import type { Question } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MathRenderer } from "@/components/MathRenderer";

type ChoiceKey = "A" | "B" | "C" | "D";

export function QuestionCard({
  question,
  selected,
  reveal,
  onSelect,
  onNext,
  isLast,
  timed,
  secondsLeft,
}: {
  question: Question;
  selected: ChoiceKey | null;
  reveal: boolean;
  onSelect: (choice: ChoiceKey) => void;
  onNext: () => void;
  isLast: boolean;
  timed: boolean;
  secondsLeft: number | null;
}) {
  const isCorrect = reveal && selected ? selected === question.correct : null;
  const statusBadge =
    reveal && selected
      ? isCorrect
        ? { text: "Correct", variant: "success" as const }
        : { text: "Incorrect", variant: "danger" as const }
      : null;

  const choices = React.useMemo(
    () =>
      (["A", "B", "C", "D"] as const).map((k) => ({
        key: k,
        text: question.choices[k],
      })),
    [question.choices],
  );

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Question</CardTitle>
          <div className="flex items-center gap-2">
            {timed && typeof secondsLeft === "number" ? (
              <Badge variant={secondsLeft <= 10 ? "warning" : "indigo"}>
                {secondsLeft}s left
              </Badge>
            ) : null}
            {statusBadge ? (
              <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
            ) : null}
          </div>
        </div>
        <div className="text-sm text-zinc-900">
          <MathRenderer>{question.question}</MathRenderer>
        </div>
      </CardHeader>

      <CardContent className="grid gap-2">
        {choices.map((c) => {
          const isSelected = selected === c.key;
          const isRight = reveal && c.key === question.correct;
          const isWrongSelected = reveal && isSelected && c.key !== question.correct;

          return (
            <button
              key={c.key}
              type="button"
              disabled={reveal}
              onClick={() => onSelect(c.key)}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                "border-zinc-200 bg-white hover:bg-zinc-50",
                isSelected && !reveal ? "border-indigo-300 bg-indigo-50" : "",
                isRight ? "border-emerald-300 bg-emerald-50" : "",
                isWrongSelected ? "border-red-300 bg-red-50" : "",
                reveal ? "cursor-default" : "cursor-pointer",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 font-semibold text-zinc-900">{c.key}.</div>
                <div className="text-zinc-800">
                  <MathRenderer>{c.text}</MathRenderer>
                </div>
              </div>
            </button>
          );
        })}

        {reveal ? (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
            <div className="font-medium text-zinc-900">Explanation</div>
            <div className="mt-1 text-zinc-700">
              <MathRenderer>{question.explanation}</MathRenderer>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              Concept ID: <span className="font-mono">{question.conceptId}</span>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          variant="default"
          onClick={onNext}
          disabled={!reveal}
        >
          {isLast ? "Finish Exam" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}

