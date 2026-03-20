import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";
import { processPurchase, InsufficientBalanceError } from "@/lib/economy";

const resolveSchema = z.object({
  status: z.enum(["approved", "denied"]),
  teacher_note: z.string().max(200).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { classId: string; purchaseId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { classId, purchaseId } = params;
  const body = await request.json();
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  // Get the purchase request with item info
  const { data: req } = await supabase
    .from("purchase_requests")
    .select("*, reward_store_items(id, title, stock)")
    .eq("id", purchaseId)
    .eq("class_id", classId)
    .single();

  if (!req) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (req.status !== "pending") {
    return NextResponse.json({ error: "Request already resolved" }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (parsed.data.status === "approved") {
    // Process the purchase
    try {
      await processPurchase({
        supabase,
        classId,
        studentId: req.student_id,
        price: req.price_at_request,
        itemTitle: (req.reward_store_items as unknown as { title: string }).title,
        purchaseRequestId: purchaseId,
      });
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        return NextResponse.json({ error: "Student no longer has enough coins" }, { status: 400 });
      }
      throw err;
    }

    // Decrement stock
    const item = req.reward_store_items as unknown as { id: string; stock: number | null };
    if (item.stock !== null) {
      await supabase
        .from("reward_store_items")
        .update({ stock: Math.max(0, item.stock - 1) })
        .eq("id", item.id);
    }
  }

  // Update request status
  const { data: updated, error } = await supabase
    .from("purchase_requests")
    .update({
      status: parsed.data.status,
      teacher_note: parsed.data.teacher_note || null,
      resolved_at: now,
      resolved_by: user.id,
    })
    .eq("id", purchaseId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(updated);
}
