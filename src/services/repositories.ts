import { mockData } from "@/data/mock";
import type { Agendamento, Despesa, ItemEstoque, Lavagem, Servico } from "@/types";
import { createLocalRepository } from "./localCollection";

export const servicosRepo = createLocalRepository<Servico>("lcv:servicos", () => mockData.servicos);
export const lavagensRepo = createLocalRepository<Lavagem>("lcv:lavagens", () => mockData.lavagens);
export const despesasRepo = createLocalRepository<Despesa>("lcv:despesas", () => mockData.despesas);
export const agendamentosRepo = createLocalRepository<Agendamento>(
  "lcv:agendamentos",
  () => mockData.agendamentos,
);
export const estoqueRepo = createLocalRepository<ItemEstoque>(
  "lcv:estoque",
  () => mockData.estoque,
);

