import { useMemo, useState } from "react";
import { useDespesas } from "./useDespesas";
import { useLavagens } from "./useLavagens";
import { analisarPeriodo, type PeriodoId } from "@/services/financialAnalytics";
import { hojeISO } from "@/lib/format";

export const PERIODOS: { id: PeriodoId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mês" },
  { id: "dias30", label: "Últimos 30 dias" },
  { id: "custom", label: "Personalizado" },
];

export function useAnaliseFinanceira() {
  const { lavagens, loading: carregandoLavagens } = useLavagens();
  const { despesas, loading: carregandoDespesas } = useDespesas();

  const [periodo, setPeriodo] = useState<PeriodoId>("mes");
  const [de, setDe] = useState(hojeISO());
  const [ate, setAte] = useState(hojeISO());

  const resumo = useMemo(
    () => analisarPeriodo(lavagens, despesas, periodo, { de, ate }),
    [lavagens, despesas, periodo, de, ate],
  );

  return {
    resumo,
    periodo,
    setPeriodo,
    de,
    setDe,
    ate,
    setAte,
    loading: carregandoLavagens || carregandoDespesas,
  };
}
