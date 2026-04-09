import { Nav } from "@/components/nav";
import type { NavUser } from "@/components/nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: NavUser | null = null;

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // Fetch profile for display name / avatar
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", authUser.id)
        .single();

      user = {
        displayName: profile?.display_name ?? null,
        email: authUser.email ?? "",
        avatarUrl: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
      };
    }
  } catch {
    // Supabase not configured (local dev without env vars) — continue as demo
  }

  return (
    <div className="min-h-full flex">
      <Nav user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
