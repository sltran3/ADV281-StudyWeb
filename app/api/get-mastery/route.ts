import { NextResponse } from "next/server";

import { CONCEPTS } from "@/lib/concepts";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const examParam = url.searchParams.get("exam");
  const exam =
    examParam === null || examParam === "all" ? null : Number.isNaN(Number(examParam)) ? null : Number(examParam);

  // Use the admin client so RLS never prevents reading mastery rows needed for the dashboard.
  const base = getSupabaseAdmin().from("concept_mastery").select("*");
  const examConceptIds =
    exam != null ? CONCEPTS.filter((c) => c.exam === exam).map((c) => c.id) : null;
  const query = examConceptIds != null ? base.in("concept_id", examConceptIds) : base;

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

