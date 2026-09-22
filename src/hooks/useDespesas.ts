import { useMemo } from "react";
import { despesasRepo } from "@/services/repositories";
import { isHoje, isMesAtual } from "@/lib/format";
import type { Despesa } from "@/types";
import { useRepository } from "./useRepository";

export function useDespesas() {
  const { items, loading, create, update, remove } = useRepository<Despesa>(despesasRepo);

  const despesas = useMemo(
    () => [...items].sort((a, b) => b.data.localeCompare(a.data)),
    [items],
  );

  const totais = useMemo(
    () => ({
      hoje: despesas.filter((d) => isHoje(d.data)).reduce((s, d) => s + d.valor, 0),
      mes: despesas.filter((d) => isMesAtual(d.data)).reduce((s, d) => s + d.valor, 0),
    }),
    [despesas],
  );

  return { despesas, totais, loading, create, update, remove };
}
