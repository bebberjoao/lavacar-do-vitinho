import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { WashCard } from "@/components/vendas/WashCard";
import { NovaLavagemSheet } from "@/components/vendas/NovaLavagemSheet";
import { DetalheLavagemSheet } from "@/components/vendas/DetalheLavagemSheet";
import { useLavagens } from "@/hooks/useLavagens";
import { useDespesas } from "@/hooks/useDespesas";
import { brl } from "@/lib/format";
import type { Lavagem } from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vendas — Lava-Car do Vitinho" },
      {
        name: "description",
        content:
          "Controle as lavagens do dia e o faturamento do Lava-Car do Vitinho pelo celular.",
      },
      { property: "og:title", content: "Vendas — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Lavagens em andamento e faturamento do dia em poucos toques.",
      },
    ],
  }),
  component: VendasPage,
});

function VendasPage() {
  const { ativas, resumo } = useLavagens();
  const { totais } = useDespesas();
  const [novaAberta, setNovaAberta] = useState(false);
  const [selecionada, setSelecionada] = useState<Lavagem | null>(null);

  const resultado = resumo.faturamentoMes - totais.mes;

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Vendas</h1>
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
            Em andamento <span className="num font-semibold text-foreground">{resumo.emAndamento}</span>
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

      {/* Lavagens ativas */}
      <section className="mt-5 space-y-3">
        {ativas.length === 0 ? (
          <p className="card-base px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma lavagem em andamento. Toque em “Nova lavagem” para começar.
          </p>
        ) : (
          ativas.map((l) => (
            <WashCard key={l.id} lavagem={l} onClick={() => setSelecionada(l)} />
          ))
        )}
      </section>

      {/* Botão flutuante (mobile) */}
      <button
        onClick={() => setNovaAberta(true)}
        aria-label="Nova lavagem"
        className="tap fixed right-4 bottom-24 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-float lg:hidden"
      >
        <Plus className="size-6" /> Nova lavagem
      </button>

      <NovaLavagemSheet open={novaAberta} onClose={() => setNovaAberta(false)} />
      <DetalheLavagemSheet lavagem={selecionada} onClose={() => setSelecionada(null)} />
    </AppShell>
  );
}
