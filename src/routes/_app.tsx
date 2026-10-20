import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { createContext, useContext, useEffect } from "react";
import { LayoutDashboard, Users, Receipt, ListOrdered, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const location = useLocation();
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
      <div className="executive-app flex min-h-screen flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:w-52 md:border-b-0 md:border-r">
          <div className="flex items-center gap-3 px-5 py-7 text-lg font-semibold text-sidebar-accent-foreground"><Wallet className="h-6 w-6 text-sidebar-primary" />Tesouraria</div>
          <div className="hidden px-5 pb-3 text-xs font-medium uppercase text-sidebar-foreground/50 md:block">Financeiro</div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex shrink-0 items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-sidebar-accent"
                activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-3 border-t border-sidebar-border p-4 text-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent font-semibold text-sidebar-primary">{ctx.nome.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sidebar-accent-foreground">{ctx.nome}</div>
            <div className="text-xs capitalize text-sidebar-foreground/60">{ctx.perfil}</div></div>
            <Button variant="ghost" size="icon" aria-label="Sair" title="Sair"
              onClick={() => supabase.auth.signOut()}
              className="shrink-0 text-sidebar-foreground/70 hover:text-sidebar-primary"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-border px-5 md:px-8">
            <div className="flex items-center gap-2 text-sm"><span className="text-muted-foreground">Financeiro</span><span className="text-muted-foreground/50">/</span><span className="font-medium">{nav.find((n) => n.to === location.pathname)?.label ?? "Tesouraria"}</span></div>
            <span className="hidden text-xs text-muted-foreground sm:block">{ctx.perfil === "admin" ? "Administrador" : ctx.perfil === "tesouraria" ? "Tesouraria" : "Consulta"}</span>
          </header>
          <div className="mx-auto max-w-[1440px] p-5 md:p-8">
          {!ctx.podeEditar && (
            <div className="mb-4 rounded-md border border-warning bg-warning/15 px-4 py-2 text-sm">
              Seu perfil é somente consulta. Peça a um administrador para liberar edição.
            </div>
          )}
          <Outlet />
          </div>
        </main>
      </div>
    </AppCtx.Provider>
  );
}
