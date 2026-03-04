"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, loading, error } = useSupabaseUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading) {
    return <p className="text-xs text-slate-400">Checking session...</p>;
  }

  if (error) {
    return <p className="text-xs text-red-400">{error}</p>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
