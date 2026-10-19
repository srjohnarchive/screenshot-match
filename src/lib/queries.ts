import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTerceiros = () =>
  useQuery({ queryKey: ["terceiros"], queryFn: async () => (await supabase.from("terceiros").select("*").order("nome")).data ?? [] });
export const useContas = () =>
  useQuery({ queryKey: ["contas"], queryFn: async () => (await supabase.from("contas_financeiras").select("*").order("nome")).data ?? [] });
export const useCategorias = () =>
  useQuery({ queryKey: ["categorias"], queryFn: async () => (await supabase.from("categorias").select("*").order("nome")).data ?? [] });
export const useCobrancas = () =>
  useQuery({
    queryKey: ["cobrancas"],
    queryFn: async () =>
      (await supabase.from("cobrancas").select("*, terceiros(nome), categorias(nome), anexos(*)").order("data_vencimento")).data ?? [],
  });
export const useMovimentacoes = () =>
  useQuery({
    queryKey: ["movimentacoes"],
    queryFn: async () =>
      (
        await supabase
          .from("movimentacoes")
          .select("*, contas_financeiras(nome), categorias(nome), cobrancas(descricao, terceiros(nome)), anexos(*)")
          .order("data_movimentacao", { ascending: false })
      ).data ?? [],
  });

export function useInvalidar() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}

export async function abrirAnexo(chave: string) {
  const { data } = await supabase.storage.from("anexos").createSignedUrl(chave, 300);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
}

export async function enviarAnexo(
  file: File,
  tipo: string,
  vinculo: { cobranca_id?: string; movimentacao_id?: string },
) {
  const chave = `${vinculo.cobranca_id ?? vinculo.movimentacao_id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const up = await supabase.storage.from("anexos").upload(chave, file);
  if (up.error) throw up.error;
  const { error } = await supabase.from("anexos").insert({
    ...vinculo,
    tipo,
    nome_original: file.name,
    chave_arquivo: chave,
    tamanho: file.size,
  });
  if (error) throw error;
}
