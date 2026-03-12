"use client";

import * as React from "react";
import type { Concept, ExamFilter, MasteryMap } from "@/lib/types";
import { getRecord } from "@/lib/mastery";
import { ConceptCard } from "@/components/ConceptCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ConceptReview({
  concepts,
  masteryMap,
  onQuizConcept,
  focusConceptId,
  examFilter,
}: {
  concepts: readonly Concept[];
  masteryMap: MasteryMap;
  onQuizConcept: (conceptId: string) => void;
  focusConceptId?: string | null;
  examFilter: ExamFilter;
}) {
  const exam2Concepts = concepts.filter((c) => c.exam === 2);
  const exam3Concepts = concepts.filter((c) => c.exam === 3);

  const weekConcepts = (list: readonly Concept[], week: number) =>
    list.filter((c) => c.week === week);

  const initialTab = React.useMemo(() => {
    if (!focusConceptId) return "week-1";
    const w = concepts.find((c) => c.id === focusConceptId)?.week ?? 1;
    return `week-${w}`;
  }, [focusConceptId, concepts]);

  const [tab, setTab] = React.useState<string>(initialTab);

  React.useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    if (!focusConceptId) return;
    const el = document.getElementById(`concept-${focusConceptId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusConceptId]);

  const activeConcepts = examFilter === 2 ? exam2Concepts : exam3Concepts;
  const isExam3 = examFilter === 3;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Concept Review
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Browse by week. Use “Quiz me on this” to jump into a single-concept quiz.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="week-1">Week 1</TabsTrigger>
          <TabsTrigger value="week-2">Week 2</TabsTrigger>
          <TabsTrigger value="week-3">Week 3</TabsTrigger>
          {isExam3 ? <TabsTrigger value="week-4">Week 4</TabsTrigger> : null}
        </TabsList>

        {(isExam3 ? [1, 2, 3, 4] : [1, 2, 3]).map((w) => (
          <TabsContent key={w} value={`week-${w}`}>
            <div className="grid gap-4 md:grid-cols-2">
              {weekConcepts(activeConcepts, w).map((c) => (
                <ConceptCard
                  key={c.id}
                  concept={c}
                  record={getRecord(masteryMap, c.id)}
                  onQuizMe={onQuizConcept}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

