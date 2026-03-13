import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

import { CONCEPTS } from "../lib/concepts";
import { getSupabaseAdmin } from "../lib/supabase";

dotenv.config({ path: ".env.local" });

type SeedQuestion = {
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

function coerceSeedQuestions(items: unknown[]): SeedQuestion[] {
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
        (q.difficulty === "easy" || q.difficulty === "medium" || q.difficulty === "hard"),
    );
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey });

  const system =
    "You are an expert quiz writer for a university research methods \n" +
    "course (ADV 281). Your questions should feel like they came from \n" +
    "a real professor — testing genuine understanding, not just \n" +
    "memorization. Avoid trick questions. Wrong answer choices should \n" +
    "be plausible but clearly wrong to someone who truly understands \n" +
    "the concept.";

  const seedExamEnv = process.env.SEED_EXAM;
  const seedExam =
    seedExamEnv == null || seedExamEnv === ""
      ? null
      : Number.isNaN(Number(seedExamEnv))
        ? null
        : Number(seedExamEnv);

  const seedOffsetEnv = process.env.SEED_OFFSET;
  const seedOffset =
    seedOffsetEnv == null || seedOffsetEnv === ""
      ? 0
      : Number.isNaN(Number(seedOffsetEnv))
        ? 0
        : Number(seedOffsetEnv);

  const conceptsToSeed = (
    seedExam == null ? CONCEPTS : CONCEPTS.filter((c) => c.exam === seedExam)
  ).slice(seedOffset);

  let totalInserted = 0;

  for (let i = 0; i < conceptsToSeed.length; i++) {
    const concept = conceptsToSeed[i]!;

    const user =
      "Generate 9 multiple choice questions for this concept at \n" +
      "3 difficulty levels (3 questions each):\n\n" +
      "Easy: Student identifies the correct definition or recognizes \n" +
      "the term in a simple context.\n\n" +
      "Medium: Student is given a realistic research scenario and must \n" +
      "correctly apply the concept to answer.\n\n" +
      "Hard: Student must compare two similar concepts, interpret an \n" +
      "actual statistic or number, or identify a flaw in a study design.\n\n" +
      `Concept: ${concept.topic}\n` +
      `Description: ${concept.summary}\n\n` +
      "Return ONLY a raw JSON array with no markdown, no backticks, \n" +
      "no preamble. Use this exact schema:\n" +
      "[\n" +
      "  {\n" +
      "    question: string,\n" +
      "    choice_a: string,\n" +
      "    choice_b: string,\n" +
      "    choice_c: string,\n" +
      "    choice_d: string,\n" +
      "    correct: 'A' | 'B' | 'C' | 'D',\n" +
      "    explanation: string,\n" +
      "    difficulty: 'easy' | 'medium' | 'hard'\n" +
      "  }\n" +
      "]";

    process.stdout.write(
      `Seeding concept ${i + 1}/${CONCEPTS.length}: ${concept.topic}... `,
    );

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = extractText(msg);
    const items = safeJsonArray(text);
    const seed = coerceSeedQuestions(items).slice(0, 9);
    if (seed.length !== 9) {
      throw new Error(
        `Expected 9 questions for concept ${concept.id} but parsed ${seed.length}`,
      );
    }

    const rows = seed.map((q) => ({
      concept_id: concept.id,
      week: concept.week,
      difficulty: q.difficulty,
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
    if (error) throw error;

    totalInserted += rows.length;
    process.stdout.write("done (9 questions)\n");

    await sleep(1000);
  }

  console.log(`Total questions inserted: ${totalInserted}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

