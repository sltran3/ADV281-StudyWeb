"use client";

import type { Concept, MasteryRecord } from "@/lib/types";
import { FORMULAS_BY_ID } from "@/lib/concepts";
import { MathRenderer } from "@/components/MathRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function masteryBadge(record: MasteryRecord) {
  if (record.mastery === "mastered") {
    return { label: "🟢 Mastered", variant: "success" as const };
  }
  if (record.mastery === "needs-review") {
    return { label: "🟡 Needs review", variant: "warning" as const };
  }
  return { label: "🔴 Not studied", variant: "danger" as const };
}

export function ConceptCard({
  concept,
  record,
  onQuizMe,
}: {
  concept: Concept;
  record: MasteryRecord;
  onQuizMe: (conceptId: string) => void;
}) {
  const badge = masteryBadge(record);
  const formula = FORMULAS_BY_ID[concept.id];

  return (
    <Card id={`concept-${concept.id}`} className="h-full scroll-mt-24">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="leading-6">{concept.topic}</CardTitle>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <div className="text-xs text-zinc-500">
          Week {concept.week} • Chapter {concept.chapter}
        </div>
      </CardHeader>
      <CardContent
        className={[
          "text-sm leading-relaxed text-zinc-700",
          // KaTeX display math inside cards: spacing + mobile overflow safety
          "[&_.katex]:text-[0.95em]",
          "[&_.katex-display]:my-2",
          "[&_.katex-display]:overflow-x-auto",
          "[&_.katex-display]:overflow-y-hidden",
          "[&_.katex-display]:max-w-full",
        ].join(" ")}
      >
        <p>{concept.summary}</p>
        {formula ? (
          <div className="mt-2">
            <MathRenderer>{formula}</MathRenderer>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <div className="text-xs text-zinc-500">
          Correct: {record.correct} • Incorrect: {record.incorrect}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onQuizMe(concept.id)}
        >
          Quiz me on this
        </Button>
      </CardFooter>
    </Card>
  );
}

