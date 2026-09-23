import { useMemo } from "react";
import { estoqueRepo } from "@/services/repositories";
import type { ItemEstoque } from "@/types";
import { useRepository } from "./useRepository";

export function useEstoque() {
  const { items, loading, create, update, remove } = useRepository<ItemEstoque>(estoqueRepo);

  const itens = useMemo(
    () => [...items].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [items],
  );

  /** Itens com aviso diferente de "nenhum" — base para notificações futuras. */
  const comAviso = useMemo(() => itens.filter((i) => i.aviso !== "nenhum"), [itens]);

  const criar = (dados: Omit<ItemEstoque, "id" | "created_at" | "updated_at">) => {
    const agora = new Date().toISOString();
    return create({ ...dados, created_at: agora, updated_at: agora } as Omit<ItemEstoque, "id">);
  };

  const atualizar = (id: string, patch: Partial<Omit<ItemEstoque, "id" | "created_at">>) =>
    update(id, { ...patch, updated_at: new Date().toISOString() });

  return { itens, comAviso, loading, criar, atualizar, remove };
}
