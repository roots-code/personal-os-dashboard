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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!error && user) {
        setUser({ id: user.id, email: user.email ?? undefined });

        // Ensure a corresponding row exists in public.users for FKs.
        void supabase
          .from("users")
          .upsert(
            {
              id: user.id,
              display_name: user.email ?? null
            },
            { onConflict: "id" }
          );
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    load();
  }, []);

  return { user, loading };
}

