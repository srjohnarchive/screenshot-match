import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { useCobrancas, useContas, useMovimentacoes } from "@/lib/queries";
import { fmtBRL, hojeISO, saldoConta, saldoRestante } from "@/lib/finance";

export const Route = createFileRoute("/_app/painel")({
  head: () => ({
    meta: [
      { title: "Painel — Tesouraria" },
      { name: "description", content: "Resumo de saldos, valores a receber e a pagar do mês." },
      { property: "og:title", content: "Painel — Tesouraria" },
      { property: "og:description", content: "Resumo de saldos, valores a receber e a pagar do mês." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function Painel() {
  const contas = useContas().data ?? [];
  const movs = useMovimentacoes().data ?? [];
  const cobs = useCobrancas().data ?? [];
  const mes = hojeISO().slice(0, 7);

  const saldoTotal = contas
    .filter((c) => c.ativa)
    .reduce((s, c) => s + saldoConta(c.saldo_inicial, movs.filter((m) => m.conta_financeira_id === c.id)), 0);

  const pendenteMes = (nat: string) =>
    cobs
      .filter((c) => c.natureza === nat && !c.cancelada_em && c.data_vencimento.startsWith(mes))
      .reduce((s, c) => s + saldoRestante(c.valor_total, movs.filter((m) => m.cobranca_id === c.id)), 0);

  const base = new Date();
  const serie = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - 5 + i, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const doMes = movs.filter((m) => !m.cancelada_em && m.data_movimentacao.startsWith(k));
    return {
      mes: MESES[d.getMonth()],
      entradas: doMes.filter((m) => m.natureza === "entrada").reduce((s, m) => s + Number(m.valor), 0),
      saidas: doMes.filter((m) => m.natureza === "saida").reduce((s, m) => s + Number(m.valor), 0),
    };
  });

  const cards = [
    { t: "Saldo em contas", v: saldoTotal, cls: "bg-primary text-primary-foreground" },
    { t: "A receber no mês", v: pendenteMes("entrada"), cls: "bg-card" },
    { t: "A pagar no mês", v: pendenteMes("saida"), cls: "bg-card" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">Painel</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.t} className={`rounded-lg border p-6 ${c.cls}`}>
            <div className="text-sm opacity-75">{c.t}</div>
            <div className="num mt-2 text-3xl">{fmtBRL(c.v)}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-xl">Fluxo de caixa — últimos 6 meses</h2>
        <ChartContainer
          className="h-72 w-full"
          config={{ entradas: { label: "Entradas", color: "var(--chart-1)" }, saidas: { label: "Saídas", color: "var(--chart-2)" } }}
        >
          <BarChart data={serie}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(v) => fmtBRL(v).replace(",00", "")} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="entradas" fill="var(--color-entradas)" radius={3} />
            <Bar dataKey="saidas" fill="var(--color-saidas)" radius={3} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
