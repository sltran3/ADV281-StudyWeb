import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { CONCEPTS } from "@/lib/concepts";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { conceptId: string };

type SeedQuestion = {
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "hard";
};

function extractText(output: unknown): string {
  if (!output || typeof output !== "object") return "";
  const maybe = output as { content?: unknown };
  if (!Array.isArray(maybe.content)) return "";
  const firstText = maybe.content.find(
    (b) => b && typeof b === "object" && (b as { type?: string }).type === "text",
  ) as { text?: string } | undefined;
  return firstText?.text ?? "";
}

function stripAccidentalFences(text: string) {
  return text.replace(/```(?:json)?/gi, "").trim();
}

function safeJsonArray(text: string): unknown[] {
  const t = stripAccidentalFences(text);
  const start = t.indexOf("[");
  const end = t.lastIndexOf("]");
  const slice = start >= 0 && end >= 0 ? t.slice(start, end + 1) : t;
  const parsed = JSON.parse(slice) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Response was not a JSON array");
  return parsed;
}

function coerce(items: unknown[]): SeedQuestion[] {
  return items
    .filter((x) => x && typeof x === "object")
    .map((x) => x as Partial<SeedQuestion>)
    .filter(
      (q): q is SeedQuestion =>
        typeof q.question === "string" &&
        typeof q.choice_a === "string" &&
        typeof q.choice_b === "string" &&
        typeof q.choice_c === "string" &&
        typeof q.choice_d === "string" &&
        (q.correct === "A" || q.correct === "B" || q.correct === "C" || q.correct === "D") &&
        typeof q.explanation === "string" &&
        q.difficulty === "hard",
    );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const conceptId = typeof body.conceptId === "string" ? body.conceptId : "";
    if (!conceptId) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

    const concept = CONCEPTS.find((c) => c.id === conceptId);
    if (!concept) return NextResponse.json({ error: "Unknown conceptId" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });

    const client = new Anthropic({ apiKey });

    const system =
      "You are an expert quiz writer for a university research methods \n" +
      "course (ADV 281). Your questions should feel like they came from \n" +
      "a real professor — testing genuine understanding, not just \n" +
      "memorization. Avoid trick questions. Wrong answer choices should \n" +
      "be plausible but clearly wrong to someone who truly understands \n" +
      "the concept.";

    const user =
      "Generate 3 multiple choice questions for this concept at difficulty level Hard.\n\n" +
      "Hard: Student must compare two similar concepts, interpret an actual statistic or number, or identify a flaw in a study design.\n\n" +
      `Concept: ${concept.topic}\n` +
      `Description: ${concept.summary}\n\n` +
      "Return ONLY a raw JSON array with no markdown, no backticks, no preamble. Use this exact schema:\n" +
      "[\n" +
      "  {\n" +
      "    question: string,\n" +
      "    choice_a: string,\n" +
      "    choice_b: string,\n" +
      "    choice_c: string,\n" +
      "    choice_d: string,\n" +
      "    correct: 'A' | 'B' | 'C' | 'D',\n" +
      "    explanation: string,\n" +
      "    difficulty: 'hard'\n" +
      "  }\n" +
      "]";

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = extractText(msg);
    const parsed = safeJsonArray(text);
    const hard = coerce(parsed).slice(0, 3);
    if (hard.length !== 3) {
      return NextResponse.json({ error: "Claude returned an invalid set" }, { status: 502 });
    }

    const rows = hard.map((q) => ({
      concept_id: concept.id,
      week: concept.week,
      difficulty: "hard" as const,
      question: q.question,
      choice_a: q.choice_a,
      choice_b: q.choice_b,
      choice_c: q.choice_c,
      choice_d: q.choice_d,
      correct: q.correct,
      explanation: q.explanation,
      is_active: true,
    }));

    const { error } = await getSupabaseAdmin().from("questions").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ added: 3 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

