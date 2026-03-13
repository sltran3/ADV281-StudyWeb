import { NextResponse } from "next/server";

import { CONCEPTS } from "@/lib/concepts";
import { getSupabasePublic } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExamType = "full" | "by-week" | "weak-spots" | "hard-mode" | "not-studied";

type Body = {
  examType: ExamType;
  count: number;
  weekFilter?: number;
  conceptIds?: string[];
  examFilter?: number | null;
};

type DbQuestion = {
  id: string;
  concept_id: string;
  week: number;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  times_answered: number | null;
  times_correct: number | null;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function toUi(q: DbQuestion) {
  return {
    id: q.id,
    conceptId: q.concept_id,
    week: q.week,
    difficulty: q.difficulty,
    question: q.question,
    choices: { A: q.choice_a, B: q.choice_b, C: q.choice_c, D: q.choice_d },
    correct: q.correct,
    explanation: q.explanation,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const examType = body.examType;
    const count = Number(body.count);
    const weekFilter = body.weekFilter == null ? null : Number(body.weekFilter);
    const conceptIds = Array.isArray(body.conceptIds) ? body.conceptIds.filter((x) => typeof x === "string") : null;
    const examFilter =
      body.examFilter == null || Number.isNaN(Number(body.examFilter))
        ? null
        : Number(body.examFilter);

    if (
      (examType !== "full" &&
        examType !== "by-week" &&
        examType !== "weak-spots" &&
        examType !== "hard-mode" &&
        examType !== "not-studied") ||
      !Number.isFinite(count) ||
      count <= 0
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const examConceptIds =
      examFilter != null
        ? CONCEPTS.filter((c) => c.exam === examFilter).map((c) => c.id)
        : null;

    const baseQuery = () => {
      let q = getSupabasePublic()
        .from("questions")
        .select(
          "id,concept_id,week,difficulty,question,choice_a,choice_b,choice_c,choice_d,correct,explanation,times_answered,times_correct",
        )
        .eq("is_active", true);
      if (examConceptIds != null) {
        q = q.in("concept_id", examConceptIds);
      }
      return q;
    };

    const applyConceptFilter = <T extends ReturnType<typeof baseQuery>>(q: T) =>
      conceptIds && conceptIds.length ? q.in("concept_id", conceptIds) : q;

    // full / by-week: difficulty-weighted random selection in JS
    if (examType === "full" || examType === "by-week") {
      if (examType === "by-week") {
        if (!Number.isFinite(weekFilter) || weekFilter == null) {
          return NextResponse.json({ error: "Missing weekFilter" }, { status: 400 });
        }
      }

      const easyTarget = Math.round(count * 0.3);
      const hardTarget = Math.round(count * 0.2);
      const mediumTarget = Math.max(0, count - easyTarget - hardTarget);

      const baseForWeek = () =>
        examType === "by-week" ? baseQuery().eq("week", weekFilter) : baseQuery();

      const easyQ = applyConceptFilter(baseForWeek().eq("difficulty", "easy"));
      const medQ = applyConceptFilter(baseForWeek().eq("difficulty", "medium"));
      const hardQ = applyConceptFilter(baseForWeek().eq("difficulty", "hard"));

      const [easyRes, medRes, hardRes] = await Promise.all([easyQ, medQ, hardQ]);
      if (easyRes.error) return NextResponse.json({ error: easyRes.error.message }, { status: 500 });
      if (medRes.error) return NextResponse.json({ error: medRes.error.message }, { status: 500 });
      if (hardRes.error) return NextResponse.json({ error: hardRes.error.message }, { status: 500 });

      const easy = shuffle((easyRes.data ?? []) as DbQuestion[]);
      const med = shuffle((medRes.data ?? []) as DbQuestion[]);
      const hard = shuffle((hardRes.data ?? []) as DbQuestion[]);

      const picked: DbQuestion[] = [
        ...easy.slice(0, easyTarget),
        ...med.slice(0, mediumTarget),
        ...hard.slice(0, hardTarget),
      ];

      if (picked.length < count) {
        const all = shuffle([...easy, ...med, ...hard]);
        const have = new Set(picked.map((x) => x.id));
        for (const q of all) {
          if (picked.length >= count) break;
          if (have.has(q.id)) continue;
          picked.push(q);
          have.add(q.id);
        }
      }

      return NextResponse.json(picked.slice(0, count).map(toUi));
    }

    if (examType === "hard-mode") {
      const res = await applyConceptFilter(baseQuery().eq("difficulty", "hard"));
      if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
      const rows = shuffle((res.data ?? []) as DbQuestion[]).slice(0, count);
      return NextResponse.json(rows.map(toUi));
    }

    if (examType === "weak-spots") {
      const mastery = await getSupabasePublic()
        .from("concept_mastery")
        .select("*")
        .neq("mastery", "mastered");
      if (mastery.error) return NextResponse.json({ error: mastery.error.message }, { status: 500 });
      const weak = (mastery.data ?? [])
        .filter((r) => typeof r.concept_id === "string")
        .sort((a, b) => (Number(a.correct ?? 0) - Number(a.incorrect ?? 0)) - (Number(b.correct ?? 0) - Number(b.incorrect ?? 0)))
        .slice(0, 10);

      const ids = weak.map((r) => r.concept_id as string);
      if (!ids.length) {
        const res = await applyConceptFilter(baseQuery());
        if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
        return NextResponse.json(shuffle(((res.data ?? []) as DbQuestion[])).slice(0, count).map(toUi));
      }

      let q = baseQuery().in("concept_id", ids).order("times_correct", { ascending: true });
      q = applyConceptFilter(q);
      const res = await q;
      if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
      return NextResponse.json(((res.data ?? []) as DbQuestion[]).slice(0, count).map(toUi));
    }

    // not-studied
    const mastery = await getSupabasePublic()
      .from("concept_mastery")
      .select("*")
      .eq("mastery", "not-studied");
    if (mastery.error) return NextResponse.json({ error: mastery.error.message }, { status: 500 });
    const ids = (mastery.data ?? []).map((r) => r.concept_id as string).filter(Boolean);
    if (!ids.length) return NextResponse.json([]);

    let q = baseQuery().in("concept_id", ids);
    q = applyConceptFilter(q);
    const res = await q;
    if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
    const rows = shuffle((res.data ?? []) as DbQuestion[]).slice(0, count);
    return NextResponse.json(rows.map(toUi));
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

