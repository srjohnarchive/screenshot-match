import { describe, it, expect } from "vitest";
import { statusCobranca, saldoRestante, saldoConta } from "./finance";

const c = { cancelada_em: null, valor_total: 100, data_vencimento: "2026-10-20" };
const m = (valor: number, cancelada_em: string | null = null, natureza = "entrada") => ({ valor, cancelada_em, natureza });

describe("status da cobrança", () => {
  it("cancelada quando cancelada_em existe", () => {
    expect(statusCobranca({ ...c, cancelada_em: "2026-10-01" }, [m(100)], "2026-10-10")).toBe("cancelada");
  });
  it("paga quando soma ativa >= total", () => {
    expect(statusCobranca(c, [m(60), m(40)], "2026-12-01")).toBe("paga");
  });
  it("parcial quando 0 < soma < total e não vencida", () => {
    expect(statusCobranca(c, [m(30)], "2026-10-10")).toBe("parcial");
  });
  it("vencida quando não paga e vencimento < hoje", () => {
    expect(statusCobranca(c, [m(30)], "2026-10-21")).toBe("vencida");
  });
  it("aberta sem movimentações ativas", () => {
    expect(statusCobranca(c, [m(100, "2026-10-02")], "2026-10-10")).toBe("aberta");
  });
});

it("saldo restante ignora canceladas", () => {
  expect(saldoRestante(100, [m(30), m(50, "x")])).toBe(70);
});

it("saldo da conta = inicial + entradas - saídas ativas", () => {
  expect(saldoConta(1000, [m(200), m(150, null, "saida"), m(999, "x", "saida")])).toBe(1050);
});
