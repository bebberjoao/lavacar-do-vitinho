import { Sheet } from "@/components/Sheet";
import { brl } from "@/lib/format";
import { FORMAS_PAGAMENTO, type FormaPagamento, type Lavagem } from "@/types";

/** Finalização rápida: um toque na forma de pagamento encerra o atendimento. */
export function FinalizarSheet({
  lavagem,
  onClose,
  onConfirmar,
}: {
  lavagem: Lavagem | null;
  onClose: () => void;
  onConfirmar: (forma: FormaPagamento) => void;
}) {
  if (!lavagem) return null;

  return (
    <Sheet
      open
      onClose={onClose}
      title="Finalizar lavagem"
      subtitle={`${lavagem.veiculoModelo} · ${lavagem.veiculoPlaca}`}
    >
      <div className="card-base mb-4 px-4 py-4">
        <p className="text-sm text-muted-foreground">Valor a receber</p>
        <p className="num mt-1 text-3xl font-bold text-brand-light">{brl(lavagem.total)}</p>
      </div>
      <p className="mb-2 text-sm font-medium text-muted-foreground">Forma de pagamento</p>
      <div className="space-y-2">
        {FORMAS_PAGAMENTO.map((f) => (
          <button
            key={f}
            onClick={() => onConfirmar(f)}
            className="tap flex h-14 w-full items-center rounded-2xl border border-border bg-background px-4 text-base font-medium hover:border-brand"
          >
            {f}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
