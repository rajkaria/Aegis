"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

export function UserMenu({ displayName, email, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = (displayName ?? email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full rounded-lg p-2 hover:bg-white/5 transition-colors text-left"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">
            {displayName ?? email}
          </p>
          {displayName && (
            <p className="text-[10px] text-muted-foreground truncate">
              {email}
            </p>
          )}
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-1 z-50 rounded-lg border border-white/10 bg-zinc-900 p-1 shadow-lg">
            <button
              onClick={handleSignOut}
              className="w-full text-left rounded-md px-3 py-2 text-xs hover:bg-white/5 transition-colors text-red-400"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
