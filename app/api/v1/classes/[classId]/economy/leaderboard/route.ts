import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { classId: string } }
) {
  const supabase = await createClient();

  const { classId } = params;

  const { data: students, error } = await supabase
    .from("students")
    .select("id, display_name, coin_balance")
    .eq("class_id", classId)
    .is("archived_at", null)
    .order("coin_balance", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(students || []);
}
