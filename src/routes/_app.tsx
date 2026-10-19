import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect } from "react";
import { LayoutDashboard, Users, Receipt, ListOrdered, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, usePerfil } from "@/hooks/use-auth";

type Ctx = { userId: string; podeEditar: boolean; perfil: string; nome: string };
const AppCtx = createContext<Ctx>({ userId: "", podeEditar: false, perfil: "consulta", nome: "" });
export const useApp = () => useContext(AppCtx);

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

const nav = [
  { to: "/painel", label: "Painel", icon: LayoutDashboard },
  { to: "/cobrancas", label: "Cobranças", icon: Receipt },
  { to: "/extrato", label: "Extrato", icon: ListOrdered },
  { to: "/cadastros", label: "Cadastros", icon: Users },
] as const;

function AppLayout() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const perfil = usePerfil(session?.user.id);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session || perfil.isLoading)
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;

  const p = perfil.data;
  const ctx: Ctx = {
    userId: session.user.id,
    podeEditar: !!p?.podeEditar,
    perfil: p?.perfil ?? "consulta",
    nome: p?.usuario?.nome ?? session.user.email ?? "",
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col bg-sidebar text-sidebar-foreground md:w-60">
          <div className="px-6 py-5 font-display text-xl text-sidebar-primary">Tesouraria</div>
          <nav className="flex gap-1 overflow-x-auto px-3 md:flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden border-t border-sidebar-border p-4 text-sm md:block">
            <div className="truncate text-sidebar-accent-foreground">{ctx.nome}</div>
            <div className="text-xs capitalize text-sidebar-foreground/60">{ctx.perfil}</div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-3 flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-8">
          {!ctx.podeEditar && (
            <div className="mb-4 rounded-md border border-warning bg-warning/15 px-4 py-2 text-sm">
              Seu perfil é somente consulta. Peça a um administrador para liberar edição.
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </AppCtx.Provider>
  );
}
