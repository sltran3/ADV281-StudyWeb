"use client";

import * as React from "react";

import { CONCEPTS } from "@/lib/concepts";
import type { ConceptMasteryRow, ExamFilter, MasteryMap } from "@/lib/types";
import { applyAnswerResult, computeMasteryLevel, getRecord, sortByWeakness } from "@/lib/mastery";

import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/Dashboard";
import { ConceptReview } from "@/components/ConceptReview";
import { PracticeExam, type ExamSession } from "@/components/PracticeExam";
import { ExamResults } from "@/components/ExamResults";

type View = "dashboard" | "review" | "exam" | "results";

export default function Page() {
  const [view, setView] = React.useState<View>("dashboard");
  const [masteryMap, setMasteryMap] = React.useState<MasteryMap>({});
  const [examFilter, setExamFilter] = React.useState<ExamFilter>(1);
  const [initialExamRequest, setInitialExamRequest] = React.useState<
    | null
    | { examType: "full" | "by-week" | "weak-spots" | "hard-mode" | "not-studied"; weekFilter?: number; conceptIds?: string[] }
  >(null);
  const [session, setSession] = React.useState<ExamSession | null>(null);
  const [focusConceptId, setFocusConceptId] = React.useState<string | null>(null);
  const [masteryLoaded, setMasteryLoaded] = React.useState(false);
  const [resetTimestamps, setResetTimestamps] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("masteryResets");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === "object") {
        setResetTimestamps(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("selectedExam");
    if (stored === "1") setExamFilter(1);
    else if (stored === "2") setExamFilter(2);
    else if (stored === "3") setExamFilter(3);
    else if (stored === "all") setExamFilter(null);
    else setExamFilter(1);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const value =
      examFilter === null ? "all" : examFilter === 1 ? "1" : examFilter === 2 ? "2" : "3";
    window.localStorage.setItem("selectedExam", value);
  }, [examFilter]);

  const loadMastery = React.useCallback(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/get-mastery?exam=${examFilter}`);
        const data = (await res.json()) as unknown;
        const rows = Array.isArray(data) ? (data as ConceptMasteryRow[]) : [];
        const map: MasteryMap = {};
        const key = examFilter === null ? "all" : String(examFilter);
        const resetAt = resetTimestamps[key];
        for (const r of rows) {
          if (!r || typeof r !== "object") continue;
          if (typeof r.concept_id !== "string") continue;
          if (resetAt && (!r.updated_at || r.updated_at < resetAt)) {
            // Treat records last updated before the reset as "not studied".
            continue;
          }
          const correct = Number((r as ConceptMasteryRow).correct ?? 0);
          const incorrect = Number((r as ConceptMasteryRow).incorrect ?? 0);
          map[r.concept_id] = {
            correct,
            incorrect,
            mastery: computeMasteryLevel({ correct, incorrect }),
          };
        }
        if (!cancelled) {
          // Merge server state into any optimistic client state so that
          // recent quiz answers aren't lost if the backend hasn't persisted them yet.
          setMasteryMap((prev) => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setMasteryLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [examFilter, resetTimestamps]);

  React.useEffect(() => {
    const cleanup = loadMastery();
    return cleanup;
  }, [loadMastery]);

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

    loadMastery();
  };

  const optimisticAnswer = (conceptId: string, wasCorrect: boolean) => {
    setMasteryMap((prev) => applyAnswerResult(prev, conceptId, wasCorrect));
  };

  const resetMasteryForExam = async () => {
    const label =
      examFilter === 1
        ? "Exam 1"
        : examFilter === 2
          ? "Exam 2"
          : examFilter === 3
            ? "Exam 3"
            : "All Exams";
    if (!window.confirm(`Reset mastery for ${label}? This will set everything back to “Not studied”.`)) {
      return;
    }

    try {
      const res = await fetch("/api/reset-mastery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam: examFilter }),
      });
      if (!res.ok) throw new Error(`Reset failed (${res.status})`);
    } catch (e) {
      console.error(e);
    } finally {
      // Optimistically clear all mastery on the client, track reset time, then refetch.
      setMasteryMap({});
      const key = examFilter === null ? "all" : String(examFilter);
      const nowIso = new Date().toISOString();
      setResetTimestamps((prev) => {
        const next = { ...prev, [key]: nowIso };
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("masteryResets", JSON.stringify(next));
          } catch {
            // ignore
          }
        }
        return next;
      });
      setMasteryLoaded(true);
      loadMastery();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-[#F5F3EF]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-[#4E6B63]">ADV 281</div>
            <div className="text-sm font-semibold text-zinc-950">
              {examFilter === 1
                ? "Exam 1"
                : examFilter === 2
                  ? "Exam 2"
                  : examFilter === 3
                    ? "Exam 3"
                    : "Exam 1–3"}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="examFilter" className="text-xs font-medium text-zinc-700 sm:sr-only">
                Exam filter
              </label>

              {/* Mobile: compact select to avoid header overflow */}
              <select
                id="examFilter"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm sm:hidden"
                value={examFilter === null ? "all" : String(examFilter)}
                disabled={view === "exam"}
                onChange={(e) => {
                  const v = e.target.value;
                  setExamFilter(v === "1" ? 1 : v === "2" ? 2 : v === "3" ? 3 : null);
                }}
              >
                <option value="1">Exam 1</option>
                <option value="2">Exam 2</option>
                <option value="3">Exam 3</option>
                <option value="all">All</option>
              </select>

              {/* Desktop: pill switch */}
              <div className="relative hidden items-center rounded-full bg-[#EFECE6] p-1 text-xs font-medium sm:inline-flex">
                <div
                  className="absolute inset-y-1 left-1 w-16 rounded-full bg-[#D6E0E8] shadow-sm transition-all duration-200"
                  style={{
                    transform: `translateX(${(examFilter === null ? 3 : examFilter - 1) * 64}px)`,
                  }}
                />
                {[
                  { label: "Exam 1", value: 1 as ExamFilter },
                  { label: "Exam 2", value: 2 as ExamFilter },
                  { label: "Exam 3", value: 3 as ExamFilter },
                  { label: "All", value: null as ExamFilter },
                ].map((opt) => {
                  const isActive = examFilter === opt.value;
                  const disabled = view === "exam";
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      className={`relative z-10 flex w-16 items-center justify-center rounded-full px-2 py-1 transition-colors ${
                        disabled ? "cursor-not-allowed opacity-60" : ""
                      }`}
                      onClick={() => {
                        if (disabled) return;
                        setExamFilter(opt.value);
                      }}
                    >
                      <span
                        className={
                          isActive
                            ? "text-xs font-semibold text-[#4E6B63]"
                            : "text-xs text-zinc-700"
                        }
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <nav className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {view === "dashboard" ? (
          <Dashboard
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            examFilter={examFilter}
            onStartExam={startExam}
            onReviewAll={() => go("review")}
            onQuizConcept={quizConcept}
            onResetMastery={resetMasteryForExam}
          />
        ) : null}

        {view === "review" ? (
          <ConceptReview
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            onQuizConcept={quizConcept}
            focusConceptId={focusConceptId}
            examFilter={examFilter}
          />
        ) : null}

        {view === "exam" ? (
          <PracticeExam
            concepts={CONCEPTS}
            masteryMap={masteryMap}
            initialRequest={initialExamRequest}
            examFilter={examFilter}
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
              examFilter={examFilter}
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
              onBackHome={() => go("review")}
            />
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-[#EFECE6] p-6 text-sm text-zinc-600">
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
