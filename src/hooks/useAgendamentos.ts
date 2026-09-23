import { useMemo } from "react";
import { agendamentosRepo } from "@/services/repositories";
import type { Agendamento } from "@/types";
import { useRepository } from "./useRepository";

export function useAgendamentos() {
  const { items, loading, create, update, remove } = useRepository<Agendamento>(agendamentosRepo);

  const ordenados = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.data === b.data ? a.hora.localeCompare(b.hora) : a.data.localeCompare(b.data),
      ),
    [items],
  );

  /** Quantidade de reservas ativas por dia (chave yyyy-mm-dd). */
  const contagemPorDia = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const a of ordenados) {
      if (a.status === "cancelado") continue;
      mapa[a.data] = (mapa[a.data] ?? 0) + 1;
    }
    return mapa;
  }, [ordenados]);

  const doDia = (data: string) => ordenados.filter((a) => a.data === data);

  const agendar = (dados: Omit<Agendamento, "id" | "status" | "criadoEm">) =>
    create({
      ...dados,
      status: "agendado",
      criadoEm: new Date().toISOString(),
    } as Omit<Agendamento, "id">);

  return { agendamentos: ordenados, contagemPorDia, doDia, loading, agendar, update, remove };
}
