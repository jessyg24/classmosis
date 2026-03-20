import Anthropic from "@anthropic-ai/sdk";

const DAILY_CALL_LIMIT = 20;
const MONTHLY_CALL_LIMIT = 200;
const MAX_RETRIES = 2;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new AiError("ANTHROPIC_API_KEY not configured", 500, false);
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

export class AiError extends Error {
  status: number;
  retryable: boolean;

  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = "AiError";
    this.status = status;
    this.retryable = retryable;
  }
}

async function callWithRetry(
  model: string,
  system: string,
  user: string,
  maxTokens: number
): Promise<string> {
  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      });

      const block = response.content[0];
      if (block.type !== "text") throw new AiError("Unexpected response type", 500, false);
      return block.text;
    } catch (err) {
      lastError = err as Error;
      const status = (err as { status?: number }).status;

      // Only retry on overloaded (529) or server error (500)
      if (status === 529 || status === 500) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
      }

      // Don't retry on auth, bad request, rate limit (429 is their limit, not ours)
      break;
    }
  }

  throw new AiError(
    lastError?.message || "AI call failed",
    (lastError as { status?: number })?.status || 500,
    false
  );
}

export async function callSonnet(system: string, user: string, maxTokens = 4096): Promise<string> {
  return callWithRetry("claude-sonnet-4-5-20250514", system, user, maxTokens);
}

export async function callHaiku(system: string, user: string, maxTokens = 2048): Promise<string> {
  return callWithRetry("claude-haiku-4-5-20251001", system, user, maxTokens);
}

// ── Rate Limiting ────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

export async function checkAndIncrementUsage(
  supabase: SupabaseClient,
  teacherId: string,
  classId: string,
  callType: string
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split("T")[0];

  // Check daily limit
  const { data: todayUsage } = await supabase
    .from("ai_usage")
    .select("call_count")
    .eq("teacher_id", teacherId)
    .eq("date", today)
    .eq("call_type", callType)
    .maybeSingle();

  const currentDaily = todayUsage?.call_count || 0;
  if (currentDaily >= DAILY_CALL_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Check monthly limit
  const monthStart = today.slice(0, 7) + "-01";
  const { data: monthUsage } = await supabase
    .from("ai_usage")
    .select("call_count")
    .eq("class_id", classId)
    .gte("date", monthStart);

  const monthlyTotal = (monthUsage || []).reduce((sum, row) => sum + row.call_count, 0);
  if (monthlyTotal >= MONTHLY_CALL_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment
  const { error } = await supabase
    .from("ai_usage")
    .upsert(
      {
        teacher_id: teacherId,
        class_id: classId,
        date: today,
        call_type: callType,
        call_count: currentDaily + 1,
      },
      { onConflict: "teacher_id,class_id,date,call_type" }
    );

  if (error) throw new AiError(`Failed to track usage: ${error.message}`, 500, false);

  return { allowed: true, remaining: DAILY_CALL_LIMIT - currentDaily - 1 };
}
