"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SupabaseUser = {
  id: string;
  email?: string;
};

export function useSupabaseUser() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const syncProfile = async (authUser: { id: string; email?: string | null }) => {
      const { error: profileError } = await supabase.from("users").upsert(
        {
          id: authUser.id,
          display_name: authUser.email ?? null
        },
        { onConflict: "id" }
      );

      if (!mounted) return;
      setUser({ id: authUser.id, email: authUser.email ?? undefined });
      setError(
        profileError
          ? `Could not finish account setup: ${profileError.message}`
          : null
      );
    };

    const load = async () => {
      setLoading(true);
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        setUser(null);
        setError(error.message);
      } else if (user) {
        await syncProfile(user);
      } else {
        setUser(null);
        setError(null);
      }

      if (!mounted) return;
      setLoading(false);
    };

    void load();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        if (!mounted) return;
        setUser(null);
        setError(null);
        setLoading(false);
        return;
      }

      void (async () => {
        if (!mounted) return;
        setLoading(true);
        await syncProfile(session.user);
        if (!mounted) return;
        setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
