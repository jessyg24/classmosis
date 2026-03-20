import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod/v4";

const signupSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  invite_token: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const adminClient = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Validate invite token
  const { data: invite } = await adminClient
    .from("parent_guardians")
    .select("id, student_id, accepted_at, invite_expires_at")
    .eq("invite_token", parsed.data.invite_token)
    .maybeSingle();

  if (!invite) return NextResponse.json({ error: "Invalid invite link" }, { status: 400 });
  if (invite.accepted_at) return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  if (invite.invite_expires_at && new Date(invite.invite_expires_at) < new Date()) {
    return NextResponse.json({ error: "Invite has expired. Ask the teacher for a new one." }, { status: 400 });
  }

  // Check if user already exists with this email
  const { data: existingUsers } = await adminClient.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find((u) => u.email === parsed.data.email);

  let userId: string;

  if (existingUser) {
    // Link existing user to this student
    userId = existingUser.id;
  } else {
    // Create new user
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        display_name: parsed.data.name,
        role: "parent",
      },
    });

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    userId = newUser.user.id;
  }

  // Accept the invite
  const { error: updateErr } = await adminClient
    .from("parent_guardians")
    .update({
      user_id: userId,
      accepted_at: new Date().toISOString(),
      invite_token: null,
      invite_expires_at: null,
    })
    .eq("id", invite.id);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Sign in the user
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInErr) {
    // User created and linked, but auto sign-in failed — they can log in manually
    return NextResponse.json({ success: true, auto_login: false });
  }

  return NextResponse.json({ success: true, auto_login: true });
}
