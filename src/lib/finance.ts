export type Natureza = "entrada" | "saida";
export type StatusCobranca = "cancelada" | "paga" | "parcial" | "vencida" | "aberta";

export interface MovLike {
  valor: number | string;
  natureza: Natureza | string;
  cancelada_em: string | null;
  cobranca_id?: string | null;
}

export const ativas = <T extends MovLike>(movs: T[]) => movs.filter((m) => !m.cancelada_em);

export function somaPaga(movs: MovLike[]) {
  return ativas(movs).reduce((s, m) => s + Number(m.valor), 0);
}

export function saldoRestante(valorTotal: number | string, movs: MovLike[]) {
  return Math.max(0, round2(Number(valorTotal) - somaPaga(movs)));
}

export function statusCobranca(
  c: { cancelada_em: string | null; valor_total: number | string; data_vencimento: string },
  movs: MovLike[],
  hoje: string = hojeISO(),
): StatusCobranca {
  if (c.cancelada_em) return "cancelada";
  const pago = somaPaga(movs);
  if (pago >= Number(c.valor_total)) return "paga";
  if (c.data_vencimento < hoje) return "vencida";
  if (pago > 0) return "parcial";
  return "aberta";
}

export function saldoConta(saldoInicial: number | string, movs: MovLike[]) {
  return round2(
    ativas(movs).reduce(
      (s, m) => s + (m.natureza === "entrada" ? Number(m.valor) : -Number(m.valor)),
      Number(saldoInicial),
    ),
  );
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function hojeISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const fmtBRL = (n: number | string) => brl.format(Number(n));
export const fmtData = (iso: string | null | undefined) =>
  iso ? iso.slice(0, 10).split("-").reverse().join("/") : "—";

export const STATUS_LABEL: Record<StatusCobranca, string> = {
  aberta: "Aberta",
  parcial: "Parcial",
  paga: "Paga",
  vencida: "Vencida",
  cancelada: "Cancelada",
};
