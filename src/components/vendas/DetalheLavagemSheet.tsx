import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, FileText, MessageCircle, Trash2 } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { Field, GhostButton, PrimaryButton, SelectInput } from "@/components/Field";
import { ServicosEditor } from "@/components/vendas/ServicosEditor";
import { brl, dataBR, horaBR, whatsappLink } from "@/lib/format";
import { servicosDaLavagem } from "@/lib/lavagem";
import {
  FORMAS_PAGAMENTO,
  type FormaPagamento,
  type Lavagem,
  type LavagemServico,
} from "@/types";
import { useLavagens } from "@/hooks/useLavagens";
import { compartilharDocumento, tipoDocumentoDe } from "@/services/documento";

const statusLabel: Record<Lavagem["status"], string> = {
  aguardando: "Aguardando",
  em_lavagem: "Lavando",
  finalizada: "Finalizado",
};


function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export function DetalheLavagemSheet({
  lavagem,
  onClose,
}: {
  lavagem: Lavagem | null;
  onClose: () => void;
}) {
  const { finalizar, remove, definirServicos } = useLavagens();
  const [pagamento, setPagamento] = useState<FormaPagamento>("Pix");
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!lavagem) return null;

  const itens = servicosDaLavagem(lavagem);
  const salvarServicos = async (servicos: LavagemServico[]) => {
    const igual =
      servicos.length === itens.length &&
      servicos.every((s, i) => {
        const atual = itens[i];
        return atual && atual.servicoId === s.servicoId && atual.adicionalValor === s.adicionalValor;
      });
    if (igual) return;
    await definirServicos(lavagem.id, servicos);
  };

  const tipoDoc = tipoDocumentoDe(lavagem.status);
  const rotuloDoc = tipoDoc === "recibo" ? "Enviar recibo pelo WhatsApp" : "Enviar orçamento pelo WhatsApp";

  const onEnviarDocumento = async () => {
    setEnviando(true);
    try {
      const r = await compartilharDocumento(lavagem, tipoDoc);
      if (r === "compartilhado") toast.success(tipoDoc === "recibo" ? "✓ Recibo enviado" : "✓ Orçamento enviado");
      else if (r === "baixado") toast.success("PDF gerado — anexe no WhatsApp");
    } catch {
      toast.error("Não foi possível gerar o documento");
    } finally {
      setEnviando(false);
    }
  };

  const mensagem = `Olá, ${lavagem.clienteNome.split(" ")[0]}! Seu ${lavagem.veiculoModelo} já está pronto no Lava-Car do Vitinho. Pode vir buscá-lo.`;

  const onFinalizar = async () => {
    await finalizar(lavagem.id, pagamento);
    onClose();
    toast.success("✓ Lavagem finalizada");
  };

  const onExcluir = async () => {
    await remove(lavagem.id);
    setConfirmando(false);
    onClose();
    toast.success("Lavagem excluída");
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={`🚗 ${lavagem.veiculoModelo}`}
      subtitle={lavagem.veiculoPlaca}
      footer={
        <div className="space-y-3">
          {lavagem.status !== "finalizada" ? (
            <>
              <Field label="Forma de pagamento">
                <SelectInput
                  icon={CreditCard}
                  title="Forma de pagamento"
                  value={pagamento}
                  onChange={(v) => setPagamento(v as FormaPagamento)}
                  options={FORMAS_PAGAMENTO.map((f) => ({ value: f, label: f }))}
                />
              </Field>
              <PrimaryButton onClick={onFinalizar}>
                <CheckCircle2 className="size-5" /> Finalizar lavagem
              </PrimaryButton>
            </>
          ) : null}
          <GhostButton onClick={() => void onEnviarDocumento()} disabled={enviando}>
            <FileText className="size-5" /> {enviando ? "Gerando PDF…" : rotuloDoc}
          </GhostButton>
          <a href={whatsappLink(lavagem.clienteTelefone, mensagem)} target="_blank" rel="noreferrer">
            <GhostButton>
              <MessageCircle className="size-5" /> WhatsApp
            </GhostButton>
          </a>
        </div>
      }
    >
      <div className="card-base mb-4 px-4 py-4">
        <p className="text-sm text-muted-foreground">Valor total</p>
        <p className="num mt-1 text-3xl font-bold text-brand-light">{brl(lavagem.total)}</p>
      </div>

      <div className="card-base px-4 py-1">
        <Linha label="Cliente" value={lavagem.clienteNome} />
        <Linha label="Telefone" value={lavagem.clienteTelefone || "—"} />
        <Linha label="Veículo" value={lavagem.veiculoModelo} />
        <Linha label="Placa" value={lavagem.veiculoPlaca} />
        <Linha
          label="Entrada"
          value={`${dataBR(lavagem.criadoEm)} às ${horaBR(lavagem.criadoEm)}`}
        />
        {lavagem.finalizadoEm ? (
          <Linha label="Finalizada" value={`${horaBR(lavagem.finalizadoEm)}`} />
        ) : null}
        {lavagem.formaPagamento ? (
          <Linha label="Pagamento" value={lavagem.formaPagamento} />
        ) : null}
        <Linha label="Status" value={statusLabel[lavagem.status]} />
      </div>

      {lavagem.status === "finalizada" ? (
        <div className="card-base mt-4 px-4 py-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Serviços</p>
          {itens.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-1 text-sm">
              <span className="min-w-0 truncate">{s.nome}</span>
              <span className="num shrink-0 font-medium">{brl(s.valorFinal)}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold">TOTAL</span>
            <span className="num text-lg font-bold text-brand-light">{brl(lavagem.total)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <ServicosEditor valor={itens} onChange={(s) => void salvarServicos(s)} />
        </div>
      )}

      {confirmando ? (
        <div className="card-base mt-4 border-destructive/50 px-4 py-4">
          <p className="text-sm">Excluir esta lavagem? Essa ação não pode ser desfeita.</p>
          <div className="mt-3 flex gap-3">
            <GhostButton onClick={() => setConfirmando(false)} className="h-12">
              Cancelar
            </GhostButton>
            <PrimaryButton
              onClick={onExcluir}
              className="h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmando(true)}
          className="tap mt-4 flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-muted-foreground"
        >
          <Trash2 className="size-4" /> Excluir lavagem
        </button>
      )}
    </Sheet>
  );
}
