import { useMemo } from "react";
import { lavagensRepo } from "@/services/repositories";
import { isHoje, isMesAtual } from "@/lib/format";
import { totalDosServicos } from "@/lib/lavagem";
import type { FormaPagamento, Lavagem, LavagemServico } from "@/types";
import { useRepository } from "./useRepository";

export function useLavagens() {
  const { items, loading, create, update, remove } = useRepository<Lavagem>(lavagensRepo);

  const ordenadas = useMemo(
    () => [...items].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [items],
  );

  const ativas = useMemo(
    () => ordenadas.filter((l) => l.status !== "finalizada"),
    [ordenadas],
  );

  const finalizadas = useMemo(
    () => ordenadas.filter((l) => l.status === "finalizada"),
    [ordenadas],
  );

  const resumo = useMemo(() => {
    const doDia = ordenadas.filter((l) => isHoje(l.criadoEm));
    const finalizadasHoje = doDia.filter((l) => l.status === "finalizada");
    return {
      lavagensHoje: doDia.length,
      finalizadasHoje: finalizadasHoje.length,
      emAndamento: doDia.filter((l) => l.status !== "finalizada").length,
      faturamentoHoje: finalizadasHoje.reduce((s, l) => s + l.total, 0),
      faturamentoMes: ordenadas
        .filter((l) => l.status === "finalizada" && isMesAtual(l.criadoEm))
        .reduce((s, l) => s + l.total, 0),
    };
  }, [ordenadas]);

  const iniciar = (dados: Omit<Lavagem, "id" | "status" | "criadoEm" | "total">) =>
    create({
      ...dados,
      total: totalDosServicos(dados.servicos),
      status: "aguardando",
      criadoEm: new Date().toISOString(),
    } as Omit<Lavagem, "id">);

  /** Troca os serviços de uma lavagem e recalcula o total. */
  const definirServicos = (id: string, servicos: LavagemServico[]) =>
    update(id, { servicos, total: totalDosServicos(servicos) });




  const finalizar = (id: string, formaPagamento: FormaPagamento) =>
    update(id, {
      status: "finalizada",
      formaPagamento,
      finalizadoEm: new Date().toISOString(),
    });

  return {
    lavagens: ordenadas,
    ativas,
    finalizadas,
    resumo,
    loading,
    iniciar,
    finalizar,
    definirServicos,
    update,
    remove,
  };
}
