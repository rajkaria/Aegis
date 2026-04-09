import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that never require auth
const PUBLIC_PREFIXES = [
  "/",           // landing
  "/docs",
  "/roadmap",
  "/use-aegis",
  "/auth",       // OAuth callback
  "/api/moonpay/webhook",
  "/api/moonpay/config",
  "/api/moonpay/currencies",
  "/api/moonpay/availability",
];

function isPublicRoute(pathname: string): boolean {
  // Exact match for root
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => prefix !== "/" && pathname.startsWith(prefix),
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname, searchParams } = request.nextUrl;

  // If Supabase is not configured, let everything through (local dev / demo)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  // Allow demo mode through without auth
  if (pathname.startsWith("/dashboard") && searchParams.get("demo") === "true") {
    return supabaseResponse;
  }

  // Public routes — pass through but still refresh session if present
  const isPublic = isPublicRoute(pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refresh session (important — don't remove)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If on a public route, let through regardless of auth
  if (isPublic) return supabaseResponse;

  // Login/signup pages — redirect to dashboard if already authed
  if (pathname === "/login" || pathname === "/signup") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protected routes (dashboard, API) — require auth
  if (!user) {
    // API routes return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes redirect to login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.svg|.*\\.png$|.*\\.ico$).*)",
  ],
};
