/**
 * Camada de cálculo financeira (BI), isolada da interface.
 * Dados → Financial Analytics Service → Cálculos → BI/Gráficos
 *
 * Futuro: custos por serviço, estoque consumido, margem por serviço,
 * custo operacional, fluxo de caixa, contas a pagar/receber podem ser
 * adicionados aqui sem alterar a interface.
 */
import type { CategoriaDespesa, Despesa, Lavagem } from "@/types";

export type PeriodoId = "hoje" | "semana" | "mes" | "dias30" | "custom";

export interface Intervalo {
  inicio: Date; // inclusive
  fim: Date; // exclusive
}

export type Granularidade = "hora" | "dia" | "mes";

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDias = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);

/** Datas em ISO curto (yyyy-mm-dd) são tratadas ao meio-dia local. */
export const paraData = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);

export const intervaloDe = (
  periodo: PeriodoId,
  custom?: { de: string; ate: string },
): Intervalo => {
  const hoje = startOfDay(new Date());
  switch (periodo) {
    case "hoje":
      return { inicio: hoje, fim: addDays(hoje, 1) };
    case "semana": {
      const inicio = addDays(hoje, -hoje.getDay());
      return { inicio, fim: addDays(inicio, 7) };
    }
    case "dias30":
      return { inicio: addDays(hoje, -29), fim: addDays(hoje, 1) };
    case "custom": {
      if (!custom?.de || !custom?.ate) return intervaloDe("mes");
      const de = startOfDay(paraData(custom.de));
      const ate = startOfDay(paraData(custom.ate));
      return de <= ate
        ? { inicio: de, fim: addDays(ate, 1) }
        : { inicio: ate, fim: addDays(de, 1) };
    }
    case "mes":
    default:
      return {
        inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
        fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1),
      };
  }
};

/** Intervalo imediatamente anterior, com a mesma duração. */
export const intervaloAnterior = (periodo: PeriodoId, atual: Intervalo): Intervalo => {
  if (periodo === "mes") {
    const i = new Date(atual.inicio.getFullYear(), atual.inicio.getMonth() - 1, 1);
    return { inicio: i, fim: atual.inicio };
  }
  const dur = atual.fim.getTime() - atual.inicio.getTime();
  return { inicio: new Date(atual.inicio.getTime() - dur), fim: atual.inicio };
};

const dentro = (d: Date, { inicio, fim }: Intervalo) => d >= inicio && d < fim;

/** Somente lavagens finalizadas contam como faturamento. */
export const lavagensFinalizadas = (lavagens: Lavagem[], intervalo: Intervalo) =>
  lavagens.filter(
    (l) => l.status === "finalizada" && dentro(paraData(l.finalizadoEm ?? l.criadoEm), intervalo),
  );

export const despesasNoPeriodo = (despesas: Despesa[], intervalo: Intervalo) =>
  despesas.filter((d) => dentro(paraData(d.data), intervalo));

export const calcularFaturamento = (lavagens: Lavagem[], intervalo: Intervalo) =>
  lavagensFinalizadas(lavagens, intervalo).reduce((s, l) => s + l.total, 0);

export const calcularGastos = (despesas: Despesa[], intervalo: Intervalo) =>
  despesasNoPeriodo(despesas, intervalo).reduce((s, d) => s + d.valor, 0);

export const calcularLucro = (faturamento: number, gastos: number) => faturamento - gastos;

/** null quando não há lavagens no período. */
export const calcularTicketMedio = (faturamento: number, qtdLavagens: number) =>
  qtdLavagens > 0 ? faturamento / qtdLavagens : null;

/** null quando o faturamento é zero. */
export const calcularMargem = (faturamento: number, lucro: number) =>
  faturamento > 0 ? (lucro / faturamento) * 100 : null;

/** Faturamento médio por dia com operação (não por dia do calendário). */
export const calcularMediaPorDiaOperacao = (
  lavagens: Lavagem[],
  intervalo: Intervalo,
): number | null => {
  const finalizadas = lavagensFinalizadas(lavagens, intervalo);
  if (finalizadas.length === 0) return null;
  const dias = new Set(
    finalizadas.map((l) => startOfDay(paraData(l.finalizadoEm ?? l.criadoEm)).getTime()),
  );
  const total = finalizadas.reduce((s, l) => s + l.total, 0);
  return dias.size > 0 ? total / dias.size : null;
};

/** null quando o período anterior é zero (sem dados anteriores). */
export const compararPeriodos = (atual: number, anterior: number): number | null =>
  anterior === 0 ? null : ((atual - anterior) / anterior) * 100;

export const granularidadeDe = (intervalo: Intervalo): Granularidade => {
  const dias = diffDias(intervalo.inicio, intervalo.fim);
  if (dias <= 1) return "hora";
  if (dias <= 62) return "dia";
  return "mes";
};

export interface PontoSerie {
  chave: string;
  label: string;
  faturamento: number;
  gastos: number;
  lucro: number;
}

const chaveDe = (d: Date, g: Granularidade) => {
  if (g === "hora") return String(d.getHours()).padStart(2, "0");
  if (g === "mes") return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const labelDe = (d: Date, g: Granularidade) => {
  if (g === "hora") return `${String(d.getHours()).padStart(2, "0")}h`;
  if (g === "mes") return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return String(d.getDate()).padStart(2, "0");
};

const bucketsDe = (intervalo: Intervalo, g: Granularidade) => {
  const out: { chave: string; label: string }[] = [];
  if (g === "hora") {
    for (let h = 0; h < 24; h += 1) {
      const d = new Date(intervalo.inicio.getFullYear(), intervalo.inicio.getMonth(), intervalo.inicio.getDate(), h);
      out.push({ chave: chaveDe(d, g), label: labelDe(d, g) });
    }
    return out;
  }
  if (g === "mes") {
    const d = new Date(intervalo.inicio.getFullYear(), intervalo.inicio.getMonth(), 1);
    while (d < intervalo.fim) {
      out.push({ chave: chaveDe(d, g), label: labelDe(d, g) });
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  }
  let d = new Date(intervalo.inicio);
  while (d < intervalo.fim) {
    out.push({ chave: chaveDe(d, g), label: labelDe(d, g) });
    d = addDays(d, 1);
  }
  return out;
};

/** Série temporal com faturamento, gastos e lucro por bucket do período. */
export const serieTemporal = (
  lavagens: Lavagem[],
  despesas: Despesa[],
  intervalo: Intervalo,
  granularidade = granularidadeDe(intervalo),
): PontoSerie[] => {
  const mapa = new Map<string, PontoSerie>();
  for (const b of bucketsDe(intervalo, granularidade)) {
    mapa.set(b.chave, { ...b, faturamento: 0, gastos: 0, lucro: 0 });
  }
  for (const l of lavagensFinalizadas(lavagens, intervalo)) {
    const p = mapa.get(chaveDe(paraData(l.finalizadoEm ?? l.criadoEm), granularidade));
    if (p) p.faturamento += l.total;
  }
  for (const d of despesasNoPeriodo(despesas, intervalo)) {
    const p = mapa.get(chaveDe(paraData(d.data), granularidade));
    if (p) p.gastos += d.valor;
  }
  return [...mapa.values()].map((p) => ({ ...p, lucro: p.faturamento - p.gastos }));
};

export interface GastoPorCategoria {
  categoria: CategoriaDespesa;
  valor: number;
  percentual: number;
}

export const gastosPorCategoria = (
  despesas: Despesa[],
  intervalo: Intervalo,
): GastoPorCategoria[] => {
  const doPeriodo = despesasNoPeriodo(despesas, intervalo);
  const total = doPeriodo.reduce((s, d) => s + d.valor, 0);
  const mapa = new Map<CategoriaDespesa, number>();
  for (const d of doPeriodo) mapa.set(d.categoria, (mapa.get(d.categoria) ?? 0) + d.valor);
  return [...mapa.entries()]
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      percentual: total > 0 ? (valor / total) * 100 : 0,
    }))
    .sort((a, b) => b.valor - a.valor);
};

export type SituacaoResultado = "positivo" | "empate" | "negativo";

export const situacaoDe = (lucro: number): SituacaoResultado =>
  lucro > 0 ? "positivo" : lucro < 0 ? "negativo" : "empate";

export interface ResumoFinanceiro {
  intervalo: Intervalo;
  granularidade: Granularidade;
  faturamento: number;
  gastos: number;
  lucro: number;
  lavagens: number;
  ticketMedio: number | null;
  mediaPorDia: number | null;
  margem: number | null;
  situacao: SituacaoResultado;
  variacao: {
    faturamento: number | null;
    gastos: number | null;
    lucro: number | null;
  };
  serie: PontoSerie[];
  categorias: GastoPorCategoria[];
  temDados: boolean;
}

export function analisarPeriodo(
  lavagens: Lavagem[],
  despesas: Despesa[],
  periodo: PeriodoId,
  custom?: { de: string; ate: string },
): ResumoFinanceiro {
  const intervalo = intervaloDe(periodo, custom);
  const anterior = intervaloAnterior(periodo, intervalo);

  const faturamento = calcularFaturamento(lavagens, intervalo);
  const gastos = calcularGastos(despesas, intervalo);
  const lucro = calcularLucro(faturamento, gastos);
  const qtd = lavagensFinalizadas(lavagens, intervalo).length;

  const fatAnterior = calcularFaturamento(lavagens, anterior);
  const gastosAnterior = calcularGastos(despesas, anterior);
  const lucroAnterior = calcularLucro(fatAnterior, gastosAnterior);
  const granularidade = granularidadeDe(intervalo);

  return {
    intervalo,
    granularidade,
    faturamento,
    gastos,
    lucro,
    lavagens: qtd,
    ticketMedio: calcularTicketMedio(faturamento, qtd),
    mediaPorDia: calcularMediaPorDiaOperacao(lavagens, intervalo),
    margem: calcularMargem(faturamento, lucro),
    situacao: situacaoDe(lucro),
    variacao: {
      faturamento: compararPeriodos(faturamento, fatAnterior),
      gastos: compararPeriodos(gastos, gastosAnterior),
      lucro: compararPeriodos(lucro, lucroAnterior),
    },
    serie: serieTemporal(lavagens, despesas, intervalo, granularidade),
    categorias: gastosPorCategoria(despesas, intervalo),
    temDados: qtd > 0 || gastos > 0,
  };
}
