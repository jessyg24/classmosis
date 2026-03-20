import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  _request: Request,
  { params }: { params: { classId: string; purchaseId: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("purchase_requests")
    .update({ fulfilled: true, fulfilled_at: new Date().toISOString() })
    .eq("id", params.purchaseId)
    .eq("class_id", params.classId)
    .eq("status", "approved")
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Purchase not found or not approved" }, { status: 404 });

  return NextResponse.json(data);
}
