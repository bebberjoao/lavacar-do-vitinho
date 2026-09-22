import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/Sheet";
import { Field, PrimaryButton, SelectInput, TextInput } from "@/components/Field";
import { brl, placaMask, telefoneMask } from "@/lib/format";
import { useLavagens } from "@/hooks/useLavagens";
import { useServicos } from "@/hooks/useServicos";

export function NovaLavagemSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { ativos } = useServicos();
  const { iniciar } = useLavagens();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [adicional, setAdicional] = useState("");
  const [adicionalDesc, setAdicionalDesc] = useState("");
  const [salvando, setSalvando] = useState(false);

  const servico = useMemo(() => ativos.find((s) => s.id === servicoId), [ativos, servicoId]);
  const adicionalValor = Number(adicional.replace(",", ".")) || 0;
  const total = (servico?.preco ?? 0) + adicionalValor;
  const valido = nome.trim() && modelo.trim() && placa.trim() && servico;

  const limpar = () => {
    setNome("");
    setTelefone("");
    setModelo("");
    setPlaca("");
    setServicoId("");
    setAdicional("");
    setAdicionalDesc("");
  };

  const salvar = async () => {
    if (!valido || !servico) return;
    setSalvando(true);
    await iniciar({
      clienteNome: nome.trim(),
      clienteTelefone: telefone.trim(),
      veiculoModelo: modelo.trim(),
      veiculoPlaca: placa.trim(),
      servicoId: servico.id,
      servicoNome: servico.nome,
      valorServico: servico.preco,
      adicionalValor,
      adicionalDescricao: adicionalDesc.trim() || undefined,
    });
    setSalvando(false);
    limpar();
    onClose();
    toast.success("✓ Lavagem iniciada");
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
            Iniciar lavagem
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
            onChange={(e) => setPlaca(placaMask(e.target.value))}
            placeholder="ABC-1234"
            className="num uppercase"
          />
        </Field>

        <Field label="Serviço">
          <SelectInput
            icon={Sparkles}
            title="Serviço"
            placeholder="Selecione o serviço"
            value={servicoId}
            onChange={setServicoId}
            options={ativos.map((s) => ({ value: s.id, label: s.nome, hint: brl(s.preco) }))}
          />
        </Field>

        <div className="card-base px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor do serviço</span>
            <span className="num text-lg font-semibold">{brl(servico?.preco ?? 0)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Adicional (R$)">
            <TextInput
              value={adicional}
              onChange={(e) => setAdicional(e.target.value.replace(/[^0-9.,]/g, ""))}
              inputMode="decimal"
              placeholder="0,00"
              className="num"
            />
          </Field>
          <Field label="Descrição">
            <TextInput
              value={adicionalDesc}
              onChange={(e) => setAdicionalDesc(e.target.value)}
              placeholder="Enceramento"
            />
          </Field>
        </div>
      </div>
    </Sheet>
  );
}
