import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify this user is a parent
  const { data: guardians } = await supabase
    .from("parent_guardians")
    .select("id")
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .limit(1);

  if (!guardians || guardians.length === 0) redirect("/login");

  return <>{children}</>;
}
