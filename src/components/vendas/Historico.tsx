import { useMemo, useState } from "react";
import { brl, dataBR, diasDesde, isHoje, isMesAtual } from "@/lib/format";
import { resumoServicos } from "@/lib/lavagem";
import type { Lavagem } from "@/types";

const filtros = [
  { id: "hoje", label: "Hoje" },
  { id: "ontem", label: "Ontem" },
  { id: "7dias", label: "Últimos 7 dias" },
  { id: "mes", label: "Este mês" },
] as const;

type FiltroId = (typeof filtros)[number]["id"];

export function Historico({
  finalizadas,
  onSelect,
}: {
  finalizadas: Lavagem[];
  onSelect: (l: Lavagem) => void;
}) {
  const [filtro, setFiltro] = useState<FiltroId>("hoje");

  const lista = useMemo(
    () =>
      finalizadas.filter((l) => {
        const ref = l.finalizadoEm ?? l.criadoEm;
        if (filtro === "hoje") return isHoje(ref);
        if (filtro === "ontem") return diasDesde(ref) === 1;
        if (filtro === "7dias") return diasDesde(ref) <= 7;
        return isMesAtual(ref);
      }),
    [finalizadas, filtro],
  );

  const total = lista.reduce((s, l) => s + l.total, 0);

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Histórico</h2>
        <span className="num text-sm font-semibold text-brand-light">{brl(total)}</span>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`tap shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
              filtro === f.id
                ? "border-brand bg-brand/20 text-brand-light"
                : "border-border bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {lista.length === 0 ? (
          <p className="card-base px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma lavagem finalizada neste período.
          </p>
        ) : (
          lista.map((l) => (
            <button
              key={l.id}
              onClick={() => onSelect(l)}
              className="tap card-base flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {l.veiculoModelo} · <span className="num">{l.veiculoPlaca}</span>
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {l.clienteNome} · {resumoServicos(l)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dataBR(l.finalizadoEm ?? l.criadoEm)} · {l.formaPagamento ?? "—"} · Finalizada
                </p>
              </div>
              <span className="num shrink-0 font-semibold">{brl(l.total)}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
