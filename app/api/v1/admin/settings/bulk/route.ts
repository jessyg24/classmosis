import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { setSetting, invalidateSettingsCache } from "@/lib/settings";

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { settings } = await request.json();
  if (!Array.isArray(settings)) return NextResponse.json({ error: "settings array required" }, { status: 400 });

  for (const s of settings) {
    await setSetting(s.key, s.value, s.description, s.category);
  }

  invalidateSettingsCache();
  return NextResponse.json({ success: true, count: settings.length });
}
