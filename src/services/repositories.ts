import { mockData } from "@/data/mock";
import type { Despesa, Lavagem, Servico } from "@/types";
import { createLocalRepository } from "./localCollection";

export const servicosRepo = createLocalRepository<Servico>("lcv:servicos", () => mockData.servicos);
export const lavagensRepo = createLocalRepository<Lavagem>("lcv:lavagens", () => mockData.lavagens);
export const despesasRepo = createLocalRepository<Despesa>("lcv:despesas", () => mockData.despesas);
