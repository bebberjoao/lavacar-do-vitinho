import { useMemo } from "react";
import { servicosRepo } from "@/services/repositories";
import type { Servico } from "@/types";
import { useRepository } from "./useRepository";

export function useServicos() {
  const { items, loading, create, update, remove } = useRepository<Servico>(servicosRepo);

  const servicos = useMemo(() => [...items].sort((a, b) => a.preco - b.preco), [items]);
  const ativos = useMemo(() => servicos.filter((s) => s.ativo), [servicos]);

  return { servicos, ativos, loading, create, update, remove };
}
