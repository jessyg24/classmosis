import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShellWrapper from "./app-shell-wrapper";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  const teacherName = user.user_metadata?.display_name || user.email || "Teacher";

  return (
    <AppShellWrapper
      teacherName={teacherName}
      classes={classes || []}
    >
      {children}
    </AppShellWrapper>
  );
}
