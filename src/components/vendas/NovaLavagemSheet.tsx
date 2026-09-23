import { useState } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/Sheet";
import { Field, PrimaryButton, TextInput } from "@/components/Field";
import { ServicosEditor } from "@/components/vendas/ServicosEditor";
import { brl, telefoneMask } from "@/lib/format";
import { totalDosServicos } from "@/lib/lavagem";
import { useLavagens } from "@/hooks/useLavagens";
import type { LavagemServico } from "@/types";

export function NovaLavagemSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { iniciar } = useLavagens();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [servicos, setServicos] = useState<LavagemServico[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);

  const total = totalDosServicos(servicos);
  const valido = Boolean(nome.trim() && modelo.trim() && placa.trim() && servicos.length > 0);

  const limpar = () => {
    setNome("");
    setTelefone("");
    setModelo("");
    setPlaca("");
    setServicos([]);
    setVersao((v) => v + 1);
  };

  const salvar = async () => {
    if (!valido) return;
    setSalvando(true);
    await iniciar({
      clienteNome: nome.trim(),
      clienteTelefone: telefone.trim(),
      veiculoModelo: modelo.trim(),
      veiculoPlaca: placa.trim(),
      servicos,
    });
    setSalvando(false);
    limpar();
    onClose();
    toast.success("✓ Carro no pátio (aguardando)");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nova lavagem"
      subtitle="Cadastro rápido do veículo"
      footer={
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="num text-2xl font-bold text-brand-light">{brl(total)}</span>
          </div>
          <PrimaryButton onClick={salvar} disabled={!valido || salvando}>
            Adicionar ao pátio
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Cliente">
          <TextInput
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do proprietário"
          />
        </Field>

        <Field label="Telefone / WhatsApp">
          <TextInput
            value={telefone}
            onChange={(e) => setTelefone(telefoneMask(e.target.value))}
            inputMode="numeric"
            placeholder="(45) 99999-9999"
          />
        </Field>

        <Field label="Veículo">
          <TextInput
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="Honda Civic"
          />
        </Field>

        <Field label="Placa">
          <TextInput
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            placeholder="ABC-1234"
          />
        </Field>

        <ServicosEditor key={versao} valor={[]} onChange={setServicos} />
      </div>
    </Sheet>
  );
}
