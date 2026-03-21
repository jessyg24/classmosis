import { createAdminClient } from "@/lib/supabase/admin";

// In-memory cache with 60-second TTL
const cache = new Map<string, { value: unknown; expires: number }>();
const CACHE_TTL_MS = 60_000;

export async function getSettingValue<T>(key: string, defaultValue: T): Promise<T> {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value as T;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .single();

    const value = data?.value ?? defaultValue;
    cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
    return value as T;
  } catch {
    return defaultValue;
  }
}

export async function getAllSettings(category?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("platform_settings").select("*").order("category").order("key");
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return data || [];
}

export async function setSetting(key: string, value: unknown, description?: string, category?: string) {
  const supabase = createAdminClient();
  await supabase.from("platform_settings").upsert({
    key,
    value,
    description: description || undefined,
    category: category || "general",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  cache.delete(key);
}

export function invalidateSettingsCache() {
  cache.clear();
}
