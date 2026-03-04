"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Check your email for a magic link to sign in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-panel max-w-md w-full px-8 py-8">
        <h1 className="text-xl font-semibold mb-2">Welcome to Personal OS</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in with your email to access your productivity & fitness dashboard.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-surfaceMuted border border-border/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-emerald-400">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-accent text-sm font-medium py-2.5 hover:bg-accent/90 disabled:opacity-60"
          >
            {loading ? "Sending magic link..." : "Send magic link"}
          </button>
        </form>
      </div>
    </div>
  );
}

