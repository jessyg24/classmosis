import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().int().min(1),
  icon: z.string().default("🎁"),
  stock: z.number().int().min(0).nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;

  const { data, error } = await supabase
    .from("reward_store_items")
    .select("*")
    .eq("class_id", classId)
    .order("sort_order")
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const body = await request.json();
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reward_store_items")
    .insert({
      class_id: classId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      icon: parsed.data.icon,
      stock: parsed.data.stock ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
