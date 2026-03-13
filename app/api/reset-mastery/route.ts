import { NextResponse } from "next/server";

import { CONCEPTS } from "@/lib/concepts";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { exam: number | null };

function parseExam(v: unknown): number | null {
  if (v === null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const exam = parseExam((body as { exam?: unknown })?.exam);

    const conceptIds =
      exam == null ? CONCEPTS.map((c) => c.id) : CONCEPTS.filter((c) => c.exam === exam).map((c) => c.id);

    if (!conceptIds.length) {
      return NextResponse.json({ deleted: { concept_mastery: 0, exam_answers: 0 } });
    }

    // Delete answers first so future mastery recomputation doesn't "remember" old streaks.
    const delAnswers = await getSupabaseAdmin()
      .from("exam_answers")
      .delete()
      .in("concept_id", conceptIds);
    if (delAnswers.error) return NextResponse.json({ error: delAnswers.error.message }, { status: 500 });

    const now = new Date().toISOString();
    const resetMastery = await getSupabaseAdmin()
      .from("concept_mastery")
      .update({
        correct: 0,
        incorrect: 0,
        mastery: "not-studied",
        last_seen: null,
        updated_at: now,
      })
      .in("concept_id", conceptIds);
    if (resetMastery.error) {
      return NextResponse.json({ error: resetMastery.error.message }, { status: 500 });
    }

    return NextResponse.json({
      deleted: {
        concept_mastery: Array.isArray(resetMastery.data) ? resetMastery.data.length : 0,
        exam_answers: Array.isArray(delAnswers.data) ? delAnswers.data.length : 0,
      },
      exam,
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

