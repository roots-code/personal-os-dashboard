"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

export default function LoginPage() {
  const { user, loading: userLoading, error: userError } = useSupabaseUser();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userId,
      password
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace("/dashboard");
  };

  const handleSignUp = async () => {
    if (!userId || !password) {
      setError("Enter both user ID (email) and password to create an account.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: userId,
      password
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Account created. You can now sign in with your password.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-panel max-w-md w-full px-8 py-8">
        <h1 className="text-xl font-semibold mb-2">Welcome to Personal OS</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in with your user ID and password.
        </p>
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              User ID (email)
            </label>
            <input
              type="email"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter password"
            />
          </div>
          {userLoading && (
            <p className="text-xs text-slate-400">Checking session...</p>
          )}
          {userError && <p className="text-xs text-red-400">{userError}</p>}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-emerald-400">{message}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-accent text-sm font-medium py-2.5 hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-border/70 text-sm font-medium py-2.5 hover:bg-surfaceMuted disabled:opacity-60"
            >
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
