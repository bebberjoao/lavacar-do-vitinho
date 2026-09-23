import type { Lavagem, LavagemServico } from "@/types";

/** Identificador local simples para os itens de serviço. */
export const novoItemId = () => `ls-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const valorFinalDe = (valorBase: number, adicionalValor: number) => valorBase + adicionalValor;

/**
 * Serviços da lavagem, com compatibilidade para os registros antigos
 * que guardavam um único serviço direto na lavagem.
 */
export function servicosDaLavagem(lavagem: Lavagem): LavagemServico[] {
  if (lavagem.servicos?.length) return lavagem.servicos;
  const adicionalValor = lavagem.adicionalValor ?? 0;
  // Registro sem lista de serviços: reconstrói um item a partir dos campos antigos.
  const valorBase = lavagem.valorServico ?? Math.max(0, (lavagem.total ?? 0) - adicionalValor);
  return [
    {
      id: `${lavagem.id}-1`,
      servicoId: lavagem.servicoId ?? "",
      nome: lavagem.servicoNome || "Serviço",
      valorBase,
      adicionalValor,
      valorFinal: valorFinalDe(valorBase, adicionalValor),
    },
  ];
}

export const totalDosServicos = (servicos: LavagemServico[]) =>
  servicos.reduce((soma, s) => soma + s.valorFinal, 0);

/** Texto curto dos serviços para cards e listas. */
export function resumoServicos(lavagem: Lavagem, limite = 2) {
  const nomes = servicosDaLavagem(lavagem).map((s) => s.nome);
  if (nomes.length === 0) return "—";
  const visiveis = nomes.slice(0, limite);
  const restantes = nomes.length - visiveis.length;
  return restantes > 0 ? `${visiveis.join(" + ")} +${restantes}` : visiveis.join(" + ");
}
