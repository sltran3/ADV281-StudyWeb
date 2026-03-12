import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { CONCEPTS } from "@/lib/concepts";
import type { Concept, Question } from "@/lib/types";

export const runtime = "nodejs";

type Body = { conceptIds: string[]; count: number };

function buildConceptList(concepts: Concept[]) {
  return concepts.map((c) => ({
    id: c.id,
    week: c.week,
    chapter: c.chapter,
    topic: c.topic,
    summary: c.summary,
  }));
}

function extractText(output: unknown): string {
  if (!output || typeof output !== "object") return "";
  const maybe = output as { content?: unknown };
  if (!Array.isArray(maybe.content)) return "";
  const firstText = maybe.content.find(
    (b) => b && typeof b === "object" && (b as { type?: string }).type === "text",
  ) as { text?: string } | undefined;
  return firstText?.text ?? "";
}

function safeJsonParseArray(text: string): unknown[] {
  const trimmed = text.trim();
  // Claude sometimes includes leading/trailing whitespace; spec says JSON only.
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  const slice = start >= 0 && end >= 0 ? trimmed.slice(start, end + 1) : trimmed;
  const parsed = JSON.parse(slice) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Model did not return a JSON array");
  return parsed;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const conceptIds = Array.isArray(body.conceptIds) ? body.conceptIds : [];
    const count = Number(body.count);

    if (!conceptIds.length || !Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const concepts = CONCEPTS.filter((c) => conceptIds.includes(c.id));
    if (!concepts.length) {
      return NextResponse.json({ error: "No concepts matched requested IDs" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in server environment" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt = `You are a quiz generator for a university research methods course (ADV 281).
Generate ${count} multiple-choice questions based ONLY on the following concepts: ${JSON.stringify(
      buildConceptList(concepts),
    )}.
Each question must:
- Test understanding, not just memorization
- Have exactly 4 answer choices labeled A, B, C, D
- Have exactly one correct answer
- Include a brief explanation (1-2 sentences) of why the correct answer is right
- Map to a specific concept ID from the list

Return ONLY a JSON array with no markdown formatting, no backticks, using this schema:
[
  {
    "question": "...",
    "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correct": "A",
    "explanation": "...",
    "conceptId": "pearson-r"
  }
]`;

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      temperature: 0.4,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate the questions now." }],
    });

    const text = extractText(msg);
    const parsed = safeJsonParseArray(text) as unknown[];

    // Minimal shape validation: keep only objects that match our schema.
    const questions: Question[] = parsed
      .filter((q) => q && typeof q === "object")
      .map((q) => q as Question)
      .filter(
        (q) =>
          typeof q.question === "string" &&
          q.choices &&
          typeof q.choices.A === "string" &&
          typeof q.choices.B === "string" &&
          typeof q.choices.C === "string" &&
          typeof q.choices.D === "string" &&
          (q.correct === "A" || q.correct === "B" || q.correct === "C" || q.correct === "D") &&
          typeof q.explanation === "string" &&
          typeof q.conceptId === "string",
      )
      .slice(0, count);

    if (!questions.length) {
      return NextResponse.json(
        { error: "Claude returned an invalid question set" },
        { status: 502 },
      );
    }

    return NextResponse.json(questions);
  } catch (err) {
    console.error(err);

    const anyErr = err as unknown as {
      name?: string;
      message?: string;
      status?: number;
      error?: unknown;
      cause?: unknown;
    };

    const status =
      typeof anyErr?.status === "number" && anyErr.status >= 400 && anyErr.status < 600
        ? anyErr.status
        : 502;

    const cause = anyErr?.cause as
      | undefined
      | { code?: string; message?: string; hostname?: string };

    return NextResponse.json(
      {
        error: "Upstream request failed",
        message: anyErr?.message ?? "Unknown error",
        upstreamStatus: typeof anyErr?.status === "number" ? anyErr.status : null,
        cause: cause
          ? {
              code: typeof cause.code === "string" ? cause.code : null,
              message: typeof cause.message === "string" ? cause.message : null,
              hostname: typeof cause.hostname === "string" ? cause.hostname : null,
            }
          : null,
      },
      { status },
    );
  }
}

