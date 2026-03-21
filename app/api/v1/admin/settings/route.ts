import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllSettings, setSetting } from "@/lib/settings";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const settings = await getAllSettings(category);
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { key, value, description, category } = await request.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  await setSetting(key, value, description, category);
  return NextResponse.json({ success: true });
}
