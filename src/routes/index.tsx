import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { WashCard, statusMeta } from "@/components/vendas/WashCard";
import { NovaLavagemSheet } from "@/components/vendas/NovaLavagemSheet";
import { DetalheLavagemSheet } from "@/components/vendas/DetalheLavagemSheet";
import { FinalizarSheet } from "@/components/vendas/FinalizarSheet";
import { useLavagens } from "@/hooks/useLavagens";
import { useDespesas } from "@/hooks/useDespesas";
import { brl, isHoje } from "@/lib/format";
import type { FormaPagamento, Lavagem, StatusLavagem } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pátio — Lava-Car do Vitinho" },
      {
        name: "description",
        content:
          "Veja os carros no pátio, mude o status de cada lavagem em um toque e acompanhe o faturamento do dia.",
      },
      { property: "og:title", content: "Pátio — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Aguardando, lavando e finalizado — tudo em uma tela só.",
      },
    ],
  }),
  component: VendasPage,
});

const grupos: { status: StatusLavagem; vazio: string }[] = [
  { status: "aguardando", vazio: "Nenhum carro esperando." },
  { status: "em_lavagem", vazio: "Nenhum carro em lavagem." },
  { status: "finalizada", vazio: "Nenhum atendimento concluído hoje." },
];

const LONG_PRESS_MS = 320;

interface DragState {
  id: string;
  from: StatusLavagem;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  over: StatusLavagem | null;
}

function VendasPage() {
  const { lavagens, resumo, finalizar, update } = useLavagens();
  const { totais } = useDespesas();
  const [novaAberta, setNovaAberta] = useState(false);
  const [selecionadaId, setSelecionadaId] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState<Lavagem | null>(null);

  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pressRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const zones = useRef<Partial<Record<StatusLavagem, HTMLElement | null>>>({});

  const resultado = resumo.faturamentoMes - totais.mes;

  // Sempre a versão mais recente: o detalhe pode editar os serviços e o total.
  const selecionada = useMemo(
    () => lavagens.find((l) => l.id === selecionadaId) ?? null,
    [lavagens, selecionadaId],
  );

  const patio = useMemo(
    () => lavagens.filter((l) => l.status !== "finalizada" || isHoje(l.criadoEm)),
    [lavagens],
  );

  const porStatus = (status: StatusLavagem) => patio.filter((l) => l.status === status);

  const mover = async (l: Lavagem, status: StatusLavagem) => {
    if (status === "finalizada") {
      setFinalizando(l);
      return;
    }
    await update(l.id, { status, formaPagamento: undefined, finalizadoEm: undefined });
    toast.success(status === "em_lavagem" ? "✓ Lavagem iniciada" : "✓ Movido para aguardando");
  };

  const avancar = async (l: Lavagem) => {
    if (l.status === "aguardando") return mover(l, "em_lavagem");
    if (l.status === "em_lavagem") setFinalizando(l);
  };

  const confirmarFinalizacao = async (forma: FormaPagamento) => {
    if (!finalizando) return;
    await finalizar(finalizando.id, forma);
    setFinalizando(null);
    toast.success("✓ Atendimento finalizado");
  };

  /* -------------------------------------------- arrastar entre os status */

  const cancelPress = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const zonaEm = (x: number, y: number): StatusLavagem | null => {
    for (const s of Object.keys(zones.current) as StatusLavagem[]) {
      const el = zones.current[s];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s;
    }
    return null;
  };

  const onPointerDown = (l: Lavagem) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = e.currentTarget;
    const { clientX: x, clientY: y, pointerId } = e;
    cancelPress();
    pressRef.current = { x, y };
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      try {
        el.setPointerCapture(pointerId);
      } catch {
        /* ignora */
      }
      const st: DragState = { id: l.id, from: l.status, startX: x, startY: y, dx: 0, dy: 0, over: l.status };
      dragRef.current = st;
      suppressClick.current = true;
      setDrag(st);
      navigator.vibrate?.(12);
    }, LONG_PRESS_MS);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const atual = dragRef.current;
    if (!atual) {
      const p = pressRef.current;
      if (p && (Math.abs(e.clientX - p.x) > 10 || Math.abs(e.clientY - p.y) > 10)) cancelPress();
      return;
    }
    e.preventDefault();
    const st: DragState = {
      ...atual,
      dx: e.clientX - atual.startX,
      dy: e.clientY - atual.startY,
      over: zonaEm(e.clientX, e.clientY),
    };
    dragRef.current = st;
    setDrag(st);
  };

  const encerrarArraste = (soltar: boolean) => {
    cancelPress();
    pressRef.current = null;
    const st = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!st) return;
    if (soltar && st.over && st.over !== st.from) {
      const l = lavagens.find((x) => x.id === st.id);
      if (l) void mover(l, st.over);
    }
    setTimeout(() => {
      suppressClick.current = false;
    }, 0);
  };


  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Pátio</h1>
        <button
          onClick={() => setNovaAberta(true)}
          className="tap hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-card hover:bg-brand-light lg:flex"
        >
          <Plus className="size-5" /> Nova lavagem
        </button>
      </header>

      {/* Resumo do dia */}
      <section className="card-base mt-4 px-4 py-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Hoje</p>
            <p className="num text-lg font-semibold">
              {resumo.lavagensHoje} {resumo.lavagensHoje === 1 ? "lavagem" : "lavagens"}
            </p>
          </div>
          <p className="num text-3xl font-bold text-brand-light">{brl(resumo.faturamentoHoje)}</p>
        </div>
        <div className="mt-3 flex gap-4 border-t border-border pt-3 text-sm">
          <span className="text-muted-foreground">
            Em andamento{" "}
            <span className="num font-semibold text-foreground">{resumo.emAndamento}</span>
          </span>
          <span className="text-muted-foreground">
            Finalizadas{" "}
            <span className="num font-semibold text-foreground">{resumo.finalizadasHoje}</span>
          </span>
        </div>
      </section>

      {/* Resumo discreto do mês */}
      <section className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <span>Este mês</span>
        <span>
          Faturamento <span className="num text-foreground">{brl(resumo.faturamentoMes)}</span>
        </span>
        <span>
          Despesas <span className="num text-foreground">{brl(totais.mes)}</span>
        </span>
        <span>
          Resultado{" "}
          <span className={`num ${resultado >= 0 ? "text-brand-light" : "text-destructive"}`}>
            {brl(resultado)}
          </span>
        </span>
      </section>

      {/* Dica de arrastar */}
      <p className="mt-4 px-1 text-xs text-muted-foreground">
        Toque e segure um card para arrastá-lo para outro status.
      </p>

      {/* Carros agrupados por status */}
      {grupos.map(({ status, vazio }) => {
        const itens = porStatus(status);
        const meta = statusMeta[status];
        const alvo = drag && drag.from !== status && drag.over === status;
        return (
          <section key={status} className="mt-6">
            <div className="flex items-center gap-2 px-1">
              <span className={`size-2.5 rounded-full ${meta.dot}`} />
              <h2 className={`font-display text-base font-semibold ${meta.text}`}>{meta.label}</h2>
              <span className="num text-sm text-muted-foreground">{itens.length}</span>
            </div>
            <div
              ref={(el) => {
                zones.current[status] = el;
              }}
              className={`mt-3 space-y-3 rounded-3xl transition-colors ${
                drag ? "min-h-24 p-1 outline-2 outline-dashed outline-border" : ""
              } ${alvo ? "bg-brand/10 outline-brand" : ""}`}
            >
              {itens.length === 0 ? (
                <p className="card-base px-4 py-6 text-center text-sm text-muted-foreground">
                  {vazio}
                </p>
              ) : (
                itens.map((l) => {
                  const arrastando = drag?.id === l.id;
                  return (
                    <div
                      key={l.id}
                      onPointerDown={onPointerDown(l)}
                      onPointerMove={onPointerMove}
                      onPointerUp={() => encerrarArraste(true)}
                      onPointerCancel={() => encerrarArraste(false)}
                      onContextMenu={(e) => arrastando && e.preventDefault()}
                      style={
                        arrastando
                          ? {
                              transform: `translate(${drag.dx}px, ${drag.dy}px)`,
                              touchAction: "none",
                              position: "relative",
                              zIndex: 40,
                            }
                          : undefined
                      }
                    >
                      <WashCard
                        lavagem={l}
                        dragging={arrastando}
                        onClick={() => {
                          if (suppressClick.current) return;
                          setSelecionadaId(l.id);
                        }}
                        onAvancar={() => {
                          if (suppressClick.current) return;
                          void avancar(l);
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </section>

        );
      })}

      {/* Botão flutuante (mobile) */}
      <button
        onClick={() => setNovaAberta(true)}
        aria-label="Nova lavagem"
        className="tap fixed right-4 bottom-24 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-float lg:hidden"
      >
        <Plus className="size-6" /> Nova lavagem
      </button>

      <NovaLavagemSheet open={novaAberta} onClose={() => setNovaAberta(false)} />
      <DetalheLavagemSheet lavagem={selecionada} onClose={() => setSelecionadaId(null)} />
      <FinalizarSheet
        lavagem={finalizando}
        onClose={() => setFinalizando(null)}
        onConfirmar={(f) => void confirmarFinalizacao(f)}
      />
    </AppShell>
  );
}
