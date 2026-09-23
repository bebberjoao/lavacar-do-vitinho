import { CheckCircle2, Clock, Droplets, Phone, Play } from "lucide-react";
import { brl, horaBR } from "@/lib/format";
import { resumoServicos } from "@/lib/lavagem";
import type { Lavagem, StatusLavagem } from "@/types";

export const statusMeta: Record<
  StatusLavagem,
  { label: string; dot: string; text: string; card: string; chip: string }
> = {
  aguardando: {
    label: "Aguardando",
    dot: "bg-status-wait",
    text: "text-status-wait",
    card: "border-status-wait/40",
    chip: "bg-status-wait/12 text-status-wait",
  },
  em_lavagem: {
    label: "Lavando",
    dot: "bg-status-wash",
    text: "text-status-wash",
    card: "border-status-wash/50 bg-status-wash/6",
    chip: "bg-status-wash/12 text-status-wash",
  },
  finalizada: {
    label: "Finalizado",
    dot: "bg-status-done",
    text: "text-status-done",
    card: "border-status-done/30",
    chip: "bg-status-done/12 text-status-done",
  },
};

export function WashCard({
  lavagem,
  onClick,
  onAvancar,
  dragging = false,
}: {
  lavagem: Lavagem;
  onClick: () => void;
  onAvancar?: () => void;
  dragging?: boolean;
}) {
  const status = statusMeta[lavagem.status];

  const acao =
    lavagem.status === "aguardando"
      ? { label: "Iniciar lavagem", Icon: Play }
      : lavagem.status === "em_lavagem"
        ? { label: "Finalizar", Icon: CheckCircle2 }
        : null;

  return (
    <article
      className={`card-base px-4 py-4 transition-shadow ${status.card} ${
        dragging ? "scale-[1.02] border-brand shadow-float" : ""
      }`}
    >

      <button onClick={onClick} className="tap block w-full text-left">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-semibold">🚗 {lavagem.veiculoModelo}</p>
            <p className="num mt-0.5 text-sm text-muted-foreground">{lavagem.veiculoPlaca}</p>
          </div>
          <p className="num shrink-0 text-xl font-bold text-brand-light">{brl(lavagem.total)}</p>
        </div>

        <div className="mt-3 space-y-0.5">
          <p className="truncate text-base font-medium">{lavagem.clienteNome}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="size-3.5" /> {lavagem.clienteTelefone || "—"}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Droplets className="size-3.5 shrink-0" /> {resumoServicos(lavagem)}
          </span>
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.chip}`}
          >
            <span className={`size-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> Entrada {horaBR(lavagem.criadoEm)}
          {lavagem.finalizadoEm ? ` · Saída ${horaBR(lavagem.finalizadoEm)}` : ""}
        </p>
      </button>

      {acao && onAvancar ? (
        <button
          onClick={onAvancar}
          className="tap mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-sm font-semibold text-foreground hover:bg-accent"
        >
          <acao.Icon className="size-5" /> {acao.label}
        </button>
      ) : null}
    </article>
  );
}
