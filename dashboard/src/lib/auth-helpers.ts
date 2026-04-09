/**
 * Auth helpers for server-side userId extraction.
 */
import { createClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user's ID from the Supabase session.
 * Returns null if not authenticated or Supabase not configured.
 */
export async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
