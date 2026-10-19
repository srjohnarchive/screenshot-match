import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

export function usePerfil(userId: string | undefined) {
  return useQuery({
    queryKey: ["perfil", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [{ data: u }, { data: roles }] = await Promise.all([
        supabase.from("usuarios").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
      ]);
      const rs = (roles ?? []).map((r) => r.role);
      const perfil = rs.includes("admin") ? "admin" : rs.includes("tesouraria") ? "tesouraria" : "consulta";
      return { usuario: u, perfil, podeEditar: !!u?.ativo && perfil !== "consulta" };
    },
  });
}
