"use client";

import * as React from "react";

import { CONCEPTS } from "@/lib/concepts";
import type { ConceptMasteryRow, MasteryMap } from "@/lib/types";
import { applyAnswerResult, getRecord, sortByWeakness } from "@/lib/mastery";

import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/Dashboard";
import { ConceptReview } from "@/components/ConceptReview";
import { PracticeExam, type ExamSession } from "@/components/PracticeExam";
import { ExamResults } from "@/components/ExamResults";

type View = "dashboard" | "review" | "exam" | "results";

export default function Page() {
  const [view, setView] = React.useState<View>("dashboard");
  const [masteryMap, setMasteryMap] = React.useState<MasteryMap>({});
  const [initialExamRequest, setInitialExamRequest] = React.useState<
    | null
    | { examType: "full" | "by-week" | "weak-spots" | "hard-mode" | "not-studied"; weekFilter?: number; conceptIds?: string[] }
  >(null);
  const [session, setSession] = React.useState<ExamSession | null>(null);
  const [focusConceptId, setFocusConceptId] = React.useState<string | null>(null);
  const [masteryLoaded, setMasteryLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/get-mastery");
        const data = (await res.json()) as unknown;
        const rows = Array.isArray(data) ? (data as ConceptMasteryRow[]) : [];
        const map: MasteryMap = {};
        for (const r of rows) {
          if (!r || typeof r !== "object") continue;
          if (typeof r.concept_id !== "string") continue;
          map[r.concept_id] = {
            correct: Number((r as ConceptMasteryRow).correct ?? 0),
            incorrect: Number((r as ConceptMasteryRow).incorrect ?? 0),
            mastery: (r as ConceptMasteryRow).mastery ?? "not-studied",
          };
        }
        if (!cancelled) setMasteryMap(map);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setMasteryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const go = (v: View) => {
    setView(v);
  };

  const startExam = () => {
    setInitialExamRequest(null);
    setSession(null);
    setFocusConceptId(null);
    go("exam");
  };

  const quizConcept = (conceptId: string) => {
    setInitialExamRequest({ examType: "full", conceptIds: [conceptId] });
    setSession(null);
    setFocusConceptId(conceptId);
    go("exam");
  };

  const finish = async (s: ExamSession) => {
    setSession(s);
    setInitialExamRequest(null);
    go("results");

    try {
      const correctCount = s.answers.filter((a) => a.isCorrect).length;
      const total = s.answers.length;
      await fetch("/api/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examType: s.examType,
          scope: s.scopeLabel,
          score: correctCount,
          total,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch("/api/get-mastery");
      const data = (await res.json()) as unknown;
      const rows = Array.isArray(data) ? (data as ConceptMasteryRow[]) : [];
      const map: MasteryMap = {};
      for (const r of rows) {
        if (!r || typeof r !== "object") continue;
        if (typeof r.concept_id !== "string") continue;
        map[r.concept_id] = {
          correct: Number((r as ConceptMasteryRow).correct ?? 0),
          incorrect: Number((r as ConceptMasteryRow).incorrect ?? 0),
          mastery: (r as ConceptMasteryRow).mastery ?? "not-studied",
        };
      }
      setMasteryMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const optimisticAnswer = (conceptId: string, wasCorrect: boolean) => {
    setMasteryMap((prev) => applyAnswerResult(prev, conceptId, wasCorrect));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-xs font-medium text-[#4E6B63]">ADV 281</div>
            <div className="text-sm font-semibold text-zinc-950">
              Exam 2 Study Website
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={view === "dashboard" ? "default" : "outline"}
              onClick={() => go("dashboard")}
            >
              Home
            </Button>
            <Button
              size="sm"
              variant={view === "review" ? "default" : "outline"}
              onClick={() => go("review")}
            >
              Concept Review
            </Button>
            <Button
              size="sm"
              variant={view === "exam" ? "default" : "outline"}
              onClick={startExam}
            >
              Practice Exam
            </Button>
            <Button
              size="sm"
              variant={view === "results" ? "default" : "outline"}
              onClick={() => go("results")}
              disabled={!session}
            >
              Results
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "dashboard" ? (
          <Dashboard
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            onStartExam={startExam}
            onReviewAll={() => go("review")}
            onQuizConcept={quizConcept}
          />
        ) : null}

        {view === "review" ? (
          <ConceptReview
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            onQuizConcept={quizConcept}
            focusConceptId={focusConceptId}
          />
        ) : null}

        {view === "exam" ? (
          <PracticeExam
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            initialRequest={initialExamRequest}
            onFinished={finish}
            onCancel={() => go("dashboard")}
            onOptimisticAnswer={optimisticAnswer}
          />
        ) : null}

        {view === "results" ? (
          session ? (
            <ExamResults
              concepts={CONCEPTS}
              masteryMap={masteryMap}
              session={session}
              onReviewConcept={(id) => {
                setInitialExamRequest(null);
                setFocusConceptId(id);
                go("review");
              }}
              onRetakeWeakSpots={() => {
                setInitialExamRequest({ examType: "weak-spots" });
                setSession(null);
                setFocusConceptId(null);
                go("exam");
              }}
              onBackHome={() => go("dashboard")}
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              No results yet. Take a practice exam first.
            </div>
          )
        ) : null}
      </main>

      <footer className="border-t border-zinc-200 py-8">
        <div className="mx-auto max-w-6xl px-4 text-xs text-zinc-500">
          ©2026 Sydney Tran. All rights reserved.
          {!masteryLoaded ? " (Loading mastery…)" : null}
        </div>
      </footer>
    </div>
  );
}
