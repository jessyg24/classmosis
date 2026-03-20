import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { verifyStudentSession } from "@/lib/supabase/student-auth";

export async function GET(request: Request) {
  const session = verifyStudentSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get class currency info
  const { data: cls } = await supabase
    .from("classes")
    .select("currency_name, currency_icon")
    .eq("id", session.classId)
    .single();

  // Get student balance
  const { data: student } = await supabase
    .from("students")
    .select("coin_balance")
    .eq("id", session.studentId)
    .single();

  // Recent transactions
  const { data: transactions } = await supabase
    .from("economy_transactions")
    .select("id, amount, balance_after, reason, category, created_at")
    .eq("student_id", session.studentId)
    .order("created_at", { ascending: false })
    .limit(20);

  // Active store items
  const { data: storeItems } = await supabase
    .from("reward_store_items")
    .select("id, title, description, price, icon, stock")
    .eq("class_id", session.classId)
    .eq("active", true)
    .order("sort_order");

  // Pending purchases
  const { data: pendingPurchases } = await supabase
    .from("purchase_requests")
    .select("id, item_id, price_at_request, status, created_at, reward_store_items(title, icon)")
    .eq("student_id", session.studentId)
    .eq("status", "pending");

  // Leaderboard (conditional)
  const { data: settings } = await supabase
    .from("economy_settings")
    .select("leaderboard_visible")
    .eq("class_id", session.classId)
    .maybeSingle();

  let leaderboard = null;
  if (settings?.leaderboard_visible) {
    const { data: lb } = await supabase
      .from("students")
      .select("id, display_name, coin_balance")
      .eq("class_id", session.classId)
      .is("archived_at", null)
      .order("coin_balance", { ascending: false });
    leaderboard = lb;
  }

  return NextResponse.json({
    balance: student?.coin_balance ?? 0,
    currencyName: cls?.currency_name ?? "coins",
    currencyIcon: cls?.currency_icon ?? "🪙",
    recentTransactions: transactions || [],
    storeItems: storeItems || [],
    pendingPurchases: pendingPurchases || [],
    leaderboard,
  });
}
