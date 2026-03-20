import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = createAdminClient();
  const url = new URL(request.url);
  const section = url.searchParams.get("section") || "transactions";

  if (section === "transactions") {
    const { data } = await supabase
      .from("economy_transactions")
      .select("*, students(display_name)")
      .eq("class_id", params.classId)
      .order("created_at", { ascending: false })
      .limit(100);
    return NextResponse.json(data || []);
  }

  if (section === "store") {
    const { data } = await supabase
      .from("reward_store_items")
      .select("*")
      .eq("class_id", params.classId)
      .order("sort_order");
    return NextResponse.json(data || []);
  }

  if (section === "jobs") {
    const { data } = await supabase
      .from("class_jobs")
      .select("*, students:current_holder_id(id, display_name)")
      .eq("class_id", params.classId)
      .order("sort_order");
    return NextResponse.json(data || []);
  }

  if (section === "mystery") {
    const { data } = await supabase
      .from("mystery_student_records")
      .select("*, students:selected_student_id(display_name)")
      .eq("class_id", params.classId)
      .order("date", { ascending: false })
      .limit(30);
    return NextResponse.json(data || []);
  }

  if (section === "todos") {
    const { data } = await supabase
      .from("todo_items")
      .select("*, students(display_name)")
      .eq("class_id", params.classId)
      .order("created_at", { ascending: false })
      .limit(100);
    return NextResponse.json(data || []);
  }

  return NextResponse.json([]);
}
