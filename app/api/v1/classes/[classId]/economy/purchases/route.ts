import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { processPurchase, InsufficientBalanceError } from "@/lib/economy";

const purchaseSchema = z.object({
  student_id: z.string().uuid(),
  item_id: z.string().uuid(),
});

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId } = params;
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  let query = supabase
    .from("purchase_requests")
    .select("*, students(id, display_name), reward_store_items(id, title, icon, price)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();

  const { classId } = params;
  const body = await request.json();
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Look up item
  const { data: item } = await supabase
    .from("reward_store_items")
    .select("id, title, price, stock, active")
    .eq("id", parsed.data.item_id)
    .eq("class_id", classId)
    .single();

  if (!item || !item.active) {
    return NextResponse.json({ error: "Item not available" }, { status: 404 });
  }

  if (item.stock !== null && item.stock <= 0) {
    return NextResponse.json({ error: "Item out of stock" }, { status: 400 });
  }

  // Check student balance
  const { data: student } = await supabase
    .from("students")
    .select("coin_balance")
    .eq("id", parsed.data.student_id)
    .single();

  if (!student || student.coin_balance < item.price) {
    return NextResponse.json({ error: "Keep earning! You need more coins for this." }, { status: 400 });
  }

  // Check auto-approve setting
  const { data: settings } = await supabase
    .from("economy_settings")
    .select("auto_approve")
    .eq("class_id", classId)
    .maybeSingle();

  if (settings?.auto_approve) {
    // Auto-approve: immediately process purchase
    const { data: req, error: reqErr } = await supabase
      .from("purchase_requests")
      .insert({
        class_id: classId,
        student_id: parsed.data.student_id,
        item_id: item.id,
        price_at_request: item.price,
        status: "approved",
        resolved_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

    try {
      await processPurchase({
        supabase,
        classId,
        studentId: parsed.data.student_id,
        price: item.price,
        itemTitle: item.title,
        purchaseRequestId: req.id,
      });
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return NextResponse.json({ error: "Keep earning! You need more coins for this." }, { status: 400 });
      }
      throw err;
    }

    // Decrement stock
    if (item.stock !== null) {
      await supabase
        .from("reward_store_items")
        .update({ stock: item.stock - 1 })
        .eq("id", item.id);
    }

    return NextResponse.json(req, { status: 201 });
  }

  // Create pending request
  const { data: req, error: reqErr } = await supabase
    .from("purchase_requests")
    .insert({
      class_id: classId,
      student_id: parsed.data.student_id,
      item_id: item.id,
      price_at_request: item.price,
      status: "pending",
    })
    .select()
    .single();

  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  return NextResponse.json(req, { status: 201 });
}
