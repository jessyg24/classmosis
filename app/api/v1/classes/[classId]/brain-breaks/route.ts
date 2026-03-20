import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.enum(["movement", "breathing", "dance", "game", "stretch", "mindfulness", "creative", "custom"]).default("movement"),
  duration_minutes: z.number().int().min(1).max(15).default(3),
  video_url: z.string().url().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("brain_break_bank")
    .select("*")
    .order("usage_count", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const { data, error } = await supabase
    .from("brain_break_bank")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      duration_minutes: parsed.data.duration_minutes,
      video_url: parsed.data.video_url || null,
      contributed_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
