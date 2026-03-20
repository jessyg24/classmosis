import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const updateItemSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(1).optional(),
  icon: z.string().optional(),
  stock: z.number().int().min(0).nullable().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; itemId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, itemId } = params;
  const body = await request.json();
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reward_store_items")
    .update(parsed.data)
    .eq("id", itemId)
    .eq("class_id", classId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { classId: string; itemId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, itemId } = params;

  // Soft-delete: set active = false
  const { error } = await supabase
    .from("reward_store_items")
    .update({ active: false })
    .eq("id", itemId)
    .eq("class_id", classId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
