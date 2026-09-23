import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const iso = (ano: number, mes: number, dia: number) =>
  `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

export function CalendarioMes({
  mes,
  ano,
  selecionado,
  contagens,
  onSelecionar,
  onMudarMes,
}: {
  mes: number;
  ano: number;
  selecionado: string;
  contagens: Record<string, number>;
  onSelecionar: (data: string) => void;
  onMudarMes: (delta: number) => void;
}) {
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const hoje = new Date();
  const hojeIso = iso(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];

  return (
    <section className="card-base px-3 py-4">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => onMudarMes(-1)}
          aria-label="Mês anterior"
          className="tap grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-display text-base font-semibold">
          {MESES[mes]} <span className="num text-muted-foreground">{ano}</span>
        </p>
        <button
          type="button"
          onClick={() => onMudarMes(1)}
          aria-label="Próximo mês"
          className="tap grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {DIAS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {celulas.map((dia, i) => {
          if (dia === null) return <span key={`v-${i}`} />;
          const data = iso(ano, mes, dia);
          const ativo = data === selecionado;
          const total = contagens[data] ?? 0;
          return (
            <button
              key={data}
              type="button"
              onClick={() => onSelecionar(data)}
              aria-label={`${dia} de ${MESES[mes]}`}
              aria-pressed={ativo}
              className={cn(
                "tap relative grid aspect-square place-items-center rounded-xl border text-sm transition-colors",
                ativo
                  ? "border-brand bg-brand/20 font-semibold text-foreground"
                  : "border-transparent text-foreground hover:border-brand/40",
                !ativo && data === hojeIso && "border-border font-semibold text-brand-light",
              )}
            >
              <span className="num">{dia}</span>
              {total > 0 ? (
                <span className="absolute bottom-1.5 flex gap-0.5">
                  {Array.from({ length: Math.min(total, 3) }, (_, k) => (
                    <span key={k} className="size-1 rounded-full bg-brand-light" />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
