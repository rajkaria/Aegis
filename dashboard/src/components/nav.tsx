"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";

const links = [
  { href: "/dashboard", label: "Economy", icon: FlowIcon },
  { href: "/dashboard/agents", label: "Agents", icon: UsersIcon },
  { href: "/dashboard/wallets", label: "Wallets", icon: WalletIcon },
  { href: "/dashboard/policies", label: "Policies", icon: ShieldIcon },
  { href: "/dashboard/manage", label: "Manage", icon: WrenchIcon },
];

export interface NavUser {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    </svg>
  );
}

function FlowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="5" cy="6" r="3" />
      <circle cx="19" cy="6" r="3" />
      <circle cx="12" cy="18" r="3" />
      <path d="M7.5 8l3 7.5" />
      <path d="M16.5 8l-3 7.5" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function Nav({ user }: { user?: NavUser | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/[0.06] bg-white/[0.01] flex flex-col min-h-screen">
      {/* Logo area */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          {/* Animated shield/pulse icon */}
          <div className="relative flex items-center justify-center w-7 h-7">
            <div
              className="absolute inset-0 rounded-md bg-emerald-500/20 animate-pulse"
              style={{ animationDuration: "2.5s" }}
            />
            <img src="/favicon.svg" alt="Aegis" className="relative w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest text-foreground">
              AEGIS NEXUS
            </h1>
            <p className="text-[10px] text-muted-foreground/70 tracking-wider uppercase">
              Agent Economy
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <>
                  {/* Active background glow */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent border border-white/[0.08]" />
                  {/* Left accent line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-emerald-400/80" />
                </>
              )}
              <Icon
                className={cn(
                  "h-4 w-4 relative z-10",
                  isActive ? "text-emerald-400" : ""
                )}
              />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Docs link */}
      <div className="px-4 pb-2 pt-3 border-t border-white/[0.05]">
        <Link
          href="/docs"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200 group"
        >
          <BookIcon className="h-3.5 w-3.5 group-hover:text-emerald-400 transition-colors" />
          Docs
        </Link>
      </div>

      {/* Partner Integrations */}
      <div className="px-4 pb-2 pt-3 border-t border-white/[0.05]">
        <p className="px-3 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
          Partners
        </p>
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground/70 rounded-md hover:bg-white/[0.02] transition-colors">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)] flex-shrink-0" />
          <span>Zerion</span>
          <span className="ml-auto text-[9px] text-muted-foreground/40 tracking-wide">
            Balance data
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground/70 rounded-md hover:bg-white/[0.02] transition-colors">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)] flex-shrink-0" />
          <span>MoonPay</span>
          <span className="ml-auto text-[9px] text-muted-foreground/40 tracking-wide">
            On-ramp
          </span>
        </div>
      </div>

      {/* Export link */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <a
          href="/api/export"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200 group"
        >
          <DownloadIcon className="h-3.5 w-3.5 group-hover:text-emerald-400 transition-colors" />
          Export CSV
        </a>
      </div>

      {/* User menu or sign in prompt */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        {user ? (
          <UserMenu
            displayName={user.displayName}
            email={user.email}
            avatarUrl={user.avatarUrl}
          />
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors"
          >
            Sign in for your own dashboard
          </Link>
        )}
      </div>
    </aside>
  );
}
