import { useEffect, useRef, useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Field, SelectInput, TextInput } from "@/components/Field";
import { brl } from "@/lib/format";
import { novoItemId, totalDosServicos, valorFinalDe } from "@/lib/lavagem";
import { useServicos } from "@/hooks/useServicos";
import type { LavagemServico } from "@/types";

interface Bloco {
  id: string;
  servicoId: string;
  adicional: string;
}

const paraTexto = (valor: number) => (valor ? String(valor).replace(".", ",") : "");
const paraNumero = (texto: string) => Number(texto.replace(",", ".")) || 0;

/**
 * Área "Serviços": um bloco por serviço, cada um com seu próprio adicional.
 * Emite a lista já calculada (valorFinal = valorBase + adicional).
 */
export function ServicosEditor({
  valor,
  onChange,
}: {
  valor: LavagemServico[];
  onChange: (servicos: LavagemServico[]) => void;
}) {
  const { ativos } = useServicos();
  const [blocos, setBlocos] = useState<Bloco[]>(() =>
    valor.length
      ? valor.map((s) => ({
          id: s.id || novoItemId(),
          servicoId: s.servicoId,
          adicional: paraTexto(s.adicionalValor),
        }))
      : [{ id: novoItemId(), servicoId: "", adicional: "" }],
  );

  const emitir = useRef(onChange);
  emitir.current = onChange;

  const servicos: LavagemServico[] = blocos.flatMap((b) => {
    const servico = ativos.find((s) => s.id === b.servicoId);
    if (!servico) return [];
    const adicionalValor = paraNumero(b.adicional);
    return [
      {
        id: b.id,
        servicoId: servico.id,
        nome: servico.nome,
        valorBase: servico.preco,
        adicionalValor,
        valorFinal: valorFinalDe(servico.preco, adicionalValor),
      },
    ];
  });

  const assinatura = JSON.stringify(servicos);
  useEffect(() => {
    emitir.current(JSON.parse(assinatura) as LavagemServico[]);
  }, [assinatura]);

  const atualizar = (id: string, dados: Partial<Bloco>) =>
    setBlocos((atual) => atual.map((b) => (b.id === id ? { ...b, ...dados } : b)));

  const remover = (id: string) => setBlocos((atual) => atual.filter((b) => b.id !== id));

  const adicionar = () =>
    setBlocos((atual) => [...atual, { id: novoItemId(), servicoId: "", adicional: "" }]);

  const usados = new Set(blocos.map((b) => b.servicoId).filter(Boolean));
  const total = totalDosServicos(servicos);

  return (
    <div className="space-y-4">
      <p className="px-1 font-display text-base font-semibold">Serviços</p>

      {blocos.map((bloco, indice) => {
        const item = servicos.find((s) => s.id === bloco.id);
        const opcoes = ativos
          .filter((s) => s.id === bloco.servicoId || !usados.has(s.id))
          .map((s) => ({ value: s.id, label: s.nome, hint: brl(s.preco) }));

        return (
          <div key={bloco.id} className="card-base space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Serviço {indice + 1}</span>
              {blocos.length > 1 || bloco.servicoId ? (
                <button
                  type="button"
                  onClick={() => (blocos.length > 1 ? remover(bloco.id) : atualizar(bloco.id, { servicoId: "", adicional: "" }))}
                  aria-label="Remover serviço"
                  className="tap rounded-xl p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>

            <SelectInput
              icon={Sparkles}
              title="Serviço"
              placeholder="Selecione o serviço"
              value={bloco.servicoId}
              onChange={(v) => atualizar(bloco.id, { servicoId: v })}
              options={opcoes}
            />

            {item ? (
              <>
                <Field label="Adicional (R$)">
                  <TextInput
                    value={bloco.adicional}
                    onChange={(e) =>
                      atualizar(bloco.id, { adicional: e.target.value.replace(/[^0-9.,]/g, "") })
                    }
                    inputMode="decimal"
                    placeholder="0,00"
                    className="num"
                  />
                </Field>
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Valor deste serviço</span>
                  <span className="num text-lg font-semibold">{brl(item.valorFinal)}</span>
                </div>
              </>
            ) : null}
          </div>
        );
      })}

      <button
        type="button"
        onClick={adicionar}
        className="tap flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-brand/60 hover:text-foreground"
      >
        <Plus className="size-5" /> Adicionar outro serviço
      </button>

      {servicos.length > 0 ? (
        <div className="card-base px-4 py-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Resumo</p>
          {servicos.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-1 text-sm">
              <span className="min-w-0 truncate">{s.nome}</span>
              <span className="num shrink-0 font-medium">{brl(s.valorFinal)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold">TOTAL</span>
            <span className="num text-xl font-bold text-brand-light">{brl(total)}</span>
          </div>
        </div>
      ) : (
        <p className="px-1 text-xs text-muted-foreground">Selecione ao menos um serviço.</p>
      )}
    </div>
  );
}
