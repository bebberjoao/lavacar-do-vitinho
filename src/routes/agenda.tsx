import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Car, Clock, MessageCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CalendarioMes } from "@/components/agenda/CalendarioMes";
import { NovaReservaSheet } from "@/components/agenda/NovaReservaSheet";
import { GhostButton, PrimaryButton } from "@/components/Field";
import { Sheet } from "@/components/Sheet";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useLavagens } from "@/hooks/useLavagens";
import { brl, dataBR, hojeISO, whatsappLink } from "@/lib/format";
import { novoItemId } from "@/lib/lavagem";
import type { Agendamento } from "@/types";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Lava-Car do Vitinho" },
      {
        name: "description",
        content: "Calendário de reservas do Lava-Car do Vitinho: agende lavagens por dia e horário.",
      },
      { property: "og:title", content: "Agenda — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Veja e marque as reservas de lavagem em um calendário simples.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgendaPage,
});

const STATUS_LABEL: Record<Agendamento["status"], string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

function AgendaPage() {
  const { contagemPorDia, doDia, update, remove } = useAgendamentos();
  const { iniciar } = useLavagens();

  const [selecionado, setSelecionado] = useState(hojeISO());
  const [mesVisivel, setMesVisivel] = useState(() => {
    const d = new Date();
    return { mes: d.getMonth(), ano: d.getFullYear() };
  });
  const [novaAberta, setNovaAberta] = useState(false);
  const [detalhe, setDetalhe] = useState<Agendamento | null>(null);

  const reservas = useMemo(() => doDia(selecionado), [doDia, selecionado]);

  const mudarMes = (delta: number) => {
    setMesVisivel(({ mes, ano }) => {
      const d = new Date(ano, mes + delta, 1);
      return { mes: d.getMonth(), ano: d.getFullYear() };
    });
  };

  const selecionarDia = (data: string) => {
    setSelecionado(data);
    const d = new Date(`${data}T12:00:00`);
    setMesVisivel({ mes: d.getMonth(), ano: d.getFullYear() });
  };

  const iniciarLavagem = async (a: Agendamento) => {
    await iniciar({
      clienteNome: a.clienteNome,
      clienteTelefone: a.clienteTelefone,
      veiculoModelo: a.veiculoModelo,
      veiculoPlaca: a.veiculoPlaca,
      servicos: [
        {
          id: novoItemId(),
          servicoId: a.servicoId,
          nome: a.servicoNome,
          valorBase: a.valor,
          adicionalValor: 0,
          valorFinal: a.valor,
        },
      ],
    });
    await update(a.id, { status: "concluido" });
    setDetalhe(null);
    toast.success("✓ Lavagem iniciada");
  };

  const cancelar = async (a: Agendamento) => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    await update(a.id, { status: "cancelado" });
    setDetalhe(null);
    toast.success("Reserva cancelada");
  };

  const excluir = async (a: Agendamento) => {
    if (!window.confirm("Excluir esta reserva?")) return;
    await remove(a.id);
    setDetalhe(null);
  };

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Agenda</h1>
        <button
          onClick={() => setNovaAberta(true)}
          className="tap hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-card hover:bg-brand-light lg:flex"
        >
          <Plus className="size-5" /> Nova reserva
        </button>
      </header>

      <div className="mt-4">
        <CalendarioMes
          mes={mesVisivel.mes}
          ano={mesVisivel.ano}
          selecionado={selecionado}
          contagens={contagemPorDia}
          onSelecionar={selecionarDia}
          onMudarMes={mudarMes}
        />
      </div>

      <section className="mt-5 space-y-3">
        <div className="flex items-end justify-between px-1">
          <p className="font-display text-base font-semibold">{dataBR(selecionado)}</p>
          <p className="text-sm text-muted-foreground">
            {reservas.length} {reservas.length === 1 ? "reserva" : "reservas"}
          </p>
        </div>

        {reservas.length === 0 ? (
          <p className="card-base px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma reserva neste dia. Toque em “Nova reserva” para agendar.
          </p>
        ) : (
          reservas.map((a) => (
            <button
              key={a.id}
              onClick={() => setDetalhe(a)}
              className="card-base tap block w-full px-4 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="num flex items-center gap-1.5 text-lg font-bold">
                    <Clock className="size-4 text-brand-light" /> {a.hora}
                  </p>
                  <p className="mt-1 truncate font-semibold">{a.veiculoModelo}</p>
                  <p className="num truncate text-sm text-muted-foreground">{a.veiculoPlaca}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {a.clienteNome} · {a.servicoNome}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="num text-lg font-bold text-brand-light">{brl(a.valor)}</p>
                  <span
                    className={
                      a.status === "agendado"
                        ? "mt-1 inline-block rounded-full bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand-light"
                        : "mt-1 inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </section>

      <button
        onClick={() => setNovaAberta(true)}
        aria-label="Nova reserva"
        className="tap fixed right-4 bottom-24 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-float lg:hidden"
      >
        <Plus className="size-6" /> Nova reserva
      </button>

      <NovaReservaSheet open={novaAberta} data={selecionado} onClose={() => setNovaAberta(false)} />

      <Sheet
        open={detalhe !== null}
        onClose={() => setDetalhe(null)}
        title={detalhe ? `${detalhe.hora} · ${detalhe.veiculoModelo}` : ""}
        subtitle={detalhe ? dataBR(detalhe.data) : ""}
        footer={
          detalhe ? (
            <div className="space-y-2">
              {detalhe.status === "agendado" ? (
                <PrimaryButton onClick={() => void iniciarLavagem(detalhe)}>
                  <Car className="size-5" /> Iniciar lavagem agora
                </PrimaryButton>
              ) : null}
              {detalhe.status === "agendado" ? (
                <GhostButton onClick={() => void cancelar(detalhe)}>Cancelar reserva</GhostButton>
              ) : (
                <GhostButton onClick={() => void excluir(detalhe)}>Excluir reserva</GhostButton>
              )}
            </div>
          ) : null
        }
      >
        {detalhe ? (
          <div className="space-y-3 text-sm">
            <Linha rotulo="Cliente" valor={detalhe.clienteNome} />
            <Linha rotulo="Telefone" valor={detalhe.clienteTelefone || "—"} />
            <Linha rotulo="Placa" valor={detalhe.veiculoPlaca} />
            <Linha rotulo="Serviço" valor={detalhe.servicoNome} />
            <Linha rotulo="Valor" valor={brl(detalhe.valor)} />
            <Linha rotulo="Situação" valor={STATUS_LABEL[detalhe.status]} />
            {detalhe.observacoes ? <Linha rotulo="Observações" valor={detalhe.observacoes} /> : null}
            {detalhe.clienteTelefone ? (
              <a
                href={whatsappLink(
                  detalhe.clienteTelefone,
                  `Olá ${detalhe.clienteNome}! Confirmando sua reserva no Lava-Car do Vitinho em ${dataBR(detalhe.data)} às ${detalhe.hora}.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="tap flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary text-base font-semibold"
              >
                <MessageCircle className="size-5" /> Confirmar no WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </AppShell>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="num min-w-0 truncate font-medium">{valor}</span>
    </div>
  );
}
