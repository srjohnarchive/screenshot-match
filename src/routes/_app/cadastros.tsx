import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategorias, useContas, useInvalidar, useMovimentacoes, useTerceiros } from "@/lib/queries";
import { fmtBRL, fmtData, hojeISO, saldoConta } from "@/lib/finance";
import { useApp } from "../_app";

export const Route = createFileRoute("/_app/cadastros")({
  head: () => ({
    meta: [
      { title: "Cadastros — Tesouraria" },
      { name: "description", content: "Clientes, fornecedores, contas financeiras e categorias." },
      { property: "og:title", content: "Cadastros — Tesouraria" },
      { property: "og:description", content: "Clientes, fornecedores, contas financeiras e categorias." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cadastros,
});

type Campo = { k: string; label: string; type?: "text" | "number" | "date" | "select"; options?: string[]; required?: boolean };
type Tabela = "terceiros" | "contas_financeiras" | "categorias";

function FormDialog({ tabela, campos, registro, onClose }: { tabela: Tabela; campos: Campo[]; registro: Record<string, any> | null; onClose: () => void }) {
  const [v, setV] = useState<Record<string, any>>(registro ?? {});
  const inv = useInvalidar();
  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const dados: Record<string, any> = {};
    campos.forEach((c) => (dados[c.k] = v[c.k] === "" ? null : v[c.k]));
    const q = registro?.["id"]
      ? supabase.from(tabela).update(dados as never).eq("id", registro["id"])
      : supabase.from(tabela).insert(dados as never);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo");
    inv();
    onClose();
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{registro?.["id"] ? "Editar" : "Novo registro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          {campos.map((c) => (
            <div key={c.k} className="space-y-1.5">
              <Label>{c.label}</Label>
              {c.type === "select" ? (
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={v[c.k] ?? ""}
                  required={c.required}
                  onChange={(e) => setV({ ...v, [c.k]: e.target.value })}
                >
                  <option value="">Selecione…</option>
                  {c.options!.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={c.type ?? "text"}
                  step={c.type === "number" ? "0.01" : undefined}
                  required={c.required}
                  value={v[c.k] ?? ""}
                  onChange={(e) => setV({ ...v, [c.k]: e.target.value })}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Secao<T extends { id: string }>({
  tabela, campos, linhas, colunas, ativoKey, titulo,
}: {
  tabela: Tabela; campos: Campo[]; linhas: T[]; colunas: { h: string; r: (x: T) => React.ReactNode }[]; ativoKey: "ativo" | "ativa"; titulo: string;
}) {
  const { podeEditar } = useApp();
  const [edit, setEdit] = useState<Record<string, any> | null | undefined>(undefined);
  const inv = useInvalidar();
  async function alternar(x: any) {
    const { error } = await supabase.from(tabela).update({ [ativoKey]: !x[ativoKey] } as never).eq("id", x.id);
    if (error) { toast.error(error.message); return; }
    inv();
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">{titulo}</h2>
        {podeEditar && (
          <Button size="sm" onClick={() => setEdit(null)}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        )}
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {colunas.map((c) => <TableHead key={c.h}>{c.h}</TableHead>)}
              <TableHead>Situação</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.length === 0 && (
              <TableRow><TableCell colSpan={colunas.length + 2} className="py-8 text-center text-muted-foreground">Nenhum registro.</TableCell></TableRow>
            )}
            {linhas.map((x: any) => (
              <TableRow key={x.id} className={x[ativoKey] ? "" : "opacity-50"}>
                {colunas.map((c) => <TableCell key={c.h}>{c.r(x)}</TableCell>)}
                <TableCell><Badge variant={x[ativoKey] ? "secondary" : "outline"}>{x[ativoKey] ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell className="text-right">
                  {podeEditar && (
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEdit(x)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => alternar(x)}>{x[ativoKey] ? "Inativar" : "Reativar"}</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {edit !== undefined && <FormDialog tabela={tabela} campos={campos} registro={edit} onClose={() => setEdit(undefined)} />}
    </div>
  );
}

function Usuarios() {
  const { userId } = useApp();
  const inv = useInvalidar();
  const { data = [] } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const [{ data: us }, { data: rs }] = await Promise.all([
        supabase.from("usuarios").select("*").order("nome"),
        supabase.from("user_roles").select("*"),
      ]);
      return (us ?? []).map((u) => ({ ...u, perfil: rs?.find((r) => r.user_id === u.id)?.role ?? "consulta" }));
    },
  });
  async function mudar(id: string, role: "admin" | "tesouraria" | "consulta") {
    const { error } = await supabase.rpc("definir_perfil", { _user_id: id, _role: role });
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado");
    inv();
  }
  async function ativo(u: any) {
    const { error } = await supabase.from("usuarios").update({ ativo: !u.ativo }).eq("id", u.id);
    if (error) { toast.error(error.message); return; }
    inv();
  }
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Perfil</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {data.map((u) => (
            <TableRow key={u.id} className={u.ativo ? "" : "opacity-50"}>
              <TableCell>{u.nome}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <select className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={u.perfil} disabled={u.id === userId}
                  onChange={(e) => mudar(u.id, e.target.value as never)}>
                  <option value="admin">admin</option><option value="tesouraria">tesouraria</option><option value="consulta">consulta</option>
                </select>
              </TableCell>
              <TableCell className="text-right">
                {u.id !== userId && <Button size="sm" variant="ghost" onClick={() => ativo(u)}>{u.ativo ? "Inativar" : "Reativar"}</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Cadastros() {
  const { perfil } = useApp();
  const terceiros = useTerceiros().data ?? [];
  const contas = useContas().data ?? [];
  const categorias = useCategorias().data ?? [];
  const movs = useMovimentacoes().data ?? [];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Cadastros</h1>
      <Tabs defaultValue="terceiros">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0 pb-3 [&>button]:shrink-0 [&>button]:px-4 [&>button]:py-2 [&>button]:data-[state=active]:bg-accent [&>button]:data-[state=active]:text-primary">
          <TabsTrigger value="terceiros">Clientes e fornecedores</TabsTrigger>
          <TabsTrigger value="contas">Contas financeiras</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          {perfil === "admin" && <TabsTrigger value="usuarios">Usuários</TabsTrigger>}
        </TabsList>
        <TabsContent value="terceiros" className="pt-4">
          <Secao tabela="terceiros" titulo="Clientes e fornecedores" ativoKey="ativo" linhas={terceiros}
            campos={[
              { k: "nome", label: "Nome", required: true },
              { k: "documento", label: "CPF/CNPJ", required: true },
              { k: "tipo", label: "Tipo", type: "select", options: ["cliente", "fornecedor", "ambos"], required: true },
              { k: "email", label: "E-mail" },
              { k: "telefone", label: "Telefone" },
            ]}
            colunas={[
              { h: "Nome", r: (x) => x.nome },
              { h: "Documento", r: (x) => <span className="num">{x.documento}</span> },
              { h: "Tipo", r: (x) => <span className="capitalize">{x.tipo}</span> },
              { h: "Contato", r: (x) => [x.email, x.telefone].filter(Boolean).join(" · ") || "—" },
            ]} />
        </TabsContent>
        <TabsContent value="contas" className="pt-4">
          <Secao tabela="contas_financeiras" titulo="Contas financeiras" ativoKey="ativa" linhas={contas}
            campos={[
              { k: "nome", label: "Nome", required: true },
              { k: "tipo", label: "Tipo", type: "select", options: ["caixa", "banco"], required: true },
              { k: "saldo_inicial", label: "Saldo inicial (R$)", type: "number", required: true },
              { k: "data_saldo_inicial", label: "Data do saldo inicial", type: "date", required: true },
            ]}
            colunas={[
              { h: "Nome", r: (x) => x.nome },
              { h: "Tipo", r: (x) => <span className="capitalize">{x.tipo}</span> },
              { h: "Saldo inicial", r: (x) => <span className="num">{fmtBRL(x.saldo_inicial)} em {fmtData(x.data_saldo_inicial)}</span> },
              { h: "Saldo atual", r: (x) => <span className="num font-medium">{fmtBRL(saldoConta(x.saldo_inicial, movs.filter((m) => m.conta_financeira_id === x.id)))}</span> },
            ]} />
        </TabsContent>
        <TabsContent value="categorias" className="pt-4">
          <Secao tabela="categorias" titulo="Categorias" ativoKey="ativa" linhas={categorias}
            campos={[
              { k: "nome", label: "Nome", required: true },
              { k: "natureza", label: "Natureza", type: "select", options: ["entrada", "saida"], required: true },
            ]}
            colunas={[
              { h: "Nome", r: (x) => x.nome },
              { h: "Natureza", r: (x) => <Badge variant={x.natureza === "entrada" ? "secondary" : "outline"}>{x.natureza === "entrada" ? "Entrada" : "Saída"}</Badge> },
            ]} />
        </TabsContent>
        {perfil === "admin" && (
          <TabsContent value="usuarios" className="pt-4"><Usuarios /></TabsContent>
        )}
      </Tabs>
      <span className="hidden">{hojeISO()}</span>
    </div>
  );
}
