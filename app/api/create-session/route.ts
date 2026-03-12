import { NextResponse } from "next/server";

import { getSupabasePublic } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { examType: string; scope: string; score: number; total: number };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const examType = typeof body.examType === "string" ? body.examType : "";
    const scope = typeof body.scope === "string" ? body.scope : "";
    const score = Number(body.score);
    const total = Number(body.total);

    if (!examType || !scope || !Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { data, error } = await getSupabasePublic()
      .from("exam_sessions")
      .insert([{ exam_type: examType, scope, score, total }])
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

