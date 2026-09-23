import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/components/Sheet";
import { Field, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/Field";
import { brl, dataBR, telefoneMask } from "@/lib/format";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useServicos } from "@/hooks/useServicos";

export function NovaReservaSheet({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: string;
  onClose: () => void;
}) {
  const { ativos } = useServicos();
  const { agendar } = useAgendamentos();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [hora, setHora] = useState("");
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);

  const servico = useMemo(() => ativos.find((s) => s.id === servicoId), [ativos, servicoId]);
  const valido = Boolean(nome.trim() && modelo.trim() && placa.trim() && servico && hora);

  const limpar = () => {
    setNome("");
    setTelefone("");
    setModelo("");
    setPlaca("");
    setServicoId("");
    setHora("");
    setObs("");
  };

  const salvar = async () => {
    if (!valido || !servico) return;
    setSalvando(true);
    await agendar({
      clienteNome: nome.trim(),
      clienteTelefone: telefone.trim(),
      veiculoModelo: modelo.trim(),
      veiculoPlaca: placa.trim(),
      servicoId: servico.id,
      servicoNome: servico.nome,
      valor: servico.preco,
      data,
      hora,
      observacoes: obs.trim() || undefined,
    });
    setSalvando(false);
    limpar();
    onClose();
    toast.success("✓ Reserva agendada");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Nova reserva"
      subtitle={`Agendamento para ${dataBR(data)}`}
      footer={
        <>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor</span>
            <span className="num text-2xl font-bold text-brand-light">
              {brl(servico?.preco ?? 0)}
            </span>
          </div>
          <PrimaryButton onClick={salvar} disabled={!valido || salvando}>
            Agendar reserva
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

        <Field label="Horário">
          <TextInput type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="num" />
        </Field>

        <Field label="Observações">
          <TextArea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Opcional" />
        </Field>
      </div>
    </Sheet>
  );
}
