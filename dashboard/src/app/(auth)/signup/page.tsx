"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "github") {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-full max-w-sm space-y-4 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <span className="text-emerald-500 text-lg">✓</span>
          </div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click the link to activate your account.
          </p>
          <Link href="/login" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-white">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-sm space-y-6 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Deploy agents with their own wallets
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("google")}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth("github")}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Continue with GitHub
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline underline-offset-4 hover:text-white/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
