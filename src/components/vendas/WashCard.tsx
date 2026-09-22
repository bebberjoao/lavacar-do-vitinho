import { Phone } from "lucide-react";
import { brl, horaBR } from "@/lib/format";
import type { Lavagem } from "@/types";

const statusMap = {
  aguardando: { label: "Aguardando", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  em_lavagem: { label: "Em lavagem", dot: "bg-brand-light", text: "text-brand-light" },
  finalizada: { label: "Finalizada", dot: "bg-muted-foreground/60", text: "text-muted-foreground" },
} as const;

export function WashCard({ lavagem, onClick }: { lavagem: Lavagem; onClick: () => void }) {
  const status = statusMap[lavagem.status];
  const destaque = lavagem.status === "em_lavagem";

  return (
    <button
      onClick={onClick}
      className={`tap card-base w-full px-4 py-4 text-left ${
        destaque ? "border-brand/50 bg-brand/8" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold">🚗 {lavagem.veiculoModelo}</p>
          <p className="mt-0.5 num text-sm text-muted-foreground">{lavagem.veiculoPlaca}</p>
        </div>
        <p className="num shrink-0 text-xl font-bold text-brand-light">{brl(lavagem.total)}</p>
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="truncate text-base font-medium">{lavagem.clienteNome}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Phone className="size-3.5" /> {lavagem.clienteTelefone}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="truncate text-sm text-muted-foreground">{lavagem.servicoNome}</span>
        <span className={`flex shrink-0 items-center gap-1.5 text-sm font-medium ${status.text}`}>
          <span className={`size-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">Entrada {horaBR(lavagem.criadoEm)}</p>
    </button>
  );
}
