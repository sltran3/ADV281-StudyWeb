import { NextResponse } from "next/server";

import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  questionId: string;
  conceptId: string;
  wasCorrect: boolean;
  selected?: string;
  sessionId?: string | null;
};

function computeMastery(correct: number, incorrect: number, streak: number) {
  const total = correct + incorrect;
  const ratio = total > 0 ? correct / total : 0;
  if (streak >= 3 && ratio >= 0.7) return "mastered" as const;
  if (correct >= 1 || incorrect >= 1) return "needs-review" as const;
  return "not-studied" as const;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const questionId = typeof body.questionId === "string" ? body.questionId : "";
    const conceptId = typeof body.conceptId === "string" ? body.conceptId : "";
    const wasCorrect = Boolean(body.wasCorrect);
    const selected = typeof body.selected === "string" ? body.selected : null;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;

    if (!questionId || !conceptId) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 1) Increment times_answered always (read then write for now).
    const qRes = await getSupabaseAdmin()
      .from("questions")
      .select("times_answered,times_correct")
      .eq("id", questionId)
      .single();
    if (qRes.error) return NextResponse.json({ error: qRes.error.message }, { status: 500 });

    const nextAnswered = (qRes.data?.times_answered ?? 0) + 1;
    const nextCorrect = (qRes.data?.times_correct ?? 0) + (wasCorrect ? 1 : 0);

    const qUp = await getSupabaseAdmin()
      .from("questions")
      .update({ times_answered: nextAnswered, times_correct: nextCorrect })
      .eq("id", questionId);
    if (qUp.error) return NextResponse.json({ error: qUp.error.message }, { status: 500 });

    // Track answer row if we can.
    if (selected) {
      const ans = await getSupabasePublic().from("exam_answers").insert([
        {
          session_id: sessionId,
          question_id: questionId,
          concept_id: conceptId,
          selected,
          was_correct: wasCorrect,
        },
      ]);
      if (ans.error) {
        // Don't fail the whole request if this insert is blocked; mastery is more important.
        console.warn("exam_answers insert failed", ans.error.message);
      }
    }

    // Check if this question was previously answered incorrectly
    const lastAnswer = await getSupabasePublic()
      .from("exam_answers")
      .select("was_correct")
      .eq("question_id", questionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevAnswerWasWrong = lastAnswer.data?.was_correct === false;

    // 3) Upsert concept_mastery: increment correct/incorrect, recompute mastery, update last_seen.
    const prev = await getSupabasePublic()
      .from("concept_mastery")
      .select("*")
      .eq("concept_id", conceptId)
      .maybeSingle();
    if (prev.error) return NextResponse.json({ error: prev.error.message }, { status: 500 });

    const prevCorrect = prev.data?.correct ?? 0;
    const prevIncorrect = prev.data?.incorrect ?? 0;

    // If previously wrong and now correct: move from incorrect → correct
    const correct = wasCorrect && prevAnswerWasWrong
      ? prevCorrect + 1
      : prevCorrect + (wasCorrect ? 1 : 0);
    const incorrect = wasCorrect && prevAnswerWasWrong
      ? Math.max(0, prevIncorrect - 1)
      : prevIncorrect + (wasCorrect ? 0 : 1);

    // Check last 3 answers for this concept to determine streak
    const recentRes = await getSupabasePublic()
      .from("exam_answers")
      .select("was_correct")
      .eq("concept_id", conceptId)
      .order("created_at", { ascending: false })
      .limit(3);
    const recent = recentRes.data ?? [];
    const streak = recent.length >= 3 && recent.every((r) => r.was_correct) ? 3 : 0;

    const mastery = computeMastery(correct, incorrect, streak);
    const now = new Date().toISOString();

    const up = await getSupabasePublic()
      .from("concept_mastery")
      .upsert(
        [
          {
            concept_id: conceptId,
            correct,
            incorrect,
            mastery,
            last_seen: now,
            updated_at: now,
          },
        ],
        { onConflict: "concept_id" },
      )
      .select("*")
      .single();

    if (up.error) return NextResponse.json({ error: up.error.message }, { status: 500 });

    return NextResponse.json(up.data);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

