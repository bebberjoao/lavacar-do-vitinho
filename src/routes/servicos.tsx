import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Sheet } from "@/components/Sheet";
import { Field, GhostButton, PrimaryButton, TextArea, TextInput } from "@/components/Field";
import { useServicos } from "@/hooks/useServicos";
import { brl } from "@/lib/format";
import type { Servico } from "@/types";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Lava-Car do Vitinho" },
      {
        name: "description",
        content: "Cadastre e edite os serviços e preços do Lava-Car do Vitinho.",
      },
      { property: "og:title", content: "Serviços — Lava-Car do Vitinho" },
      { property: "og:description", content: "Preços usados automaticamente em cada lavagem." },
    ],
  }),
  component: ServicosPage,
});

const vazio = { nome: "", descricao: "", preco: "", duracao: "" };

function ServicosPage() {
  const { servicos, create, update, remove } = useServicos();
  const [editando, setEditando] = useState<Servico | null>(null);
  const [aberta, setAberta] = useState(false);
  const [form, setForm] = useState(vazio);
  const [excluir, setExcluir] = useState<Servico | null>(null);

  const abrirNovo = () => {
    setEditando(null);
    setForm(vazio);
    setAberta(true);
  };

  const abrirEdicao = (s: Servico) => {
    setEditando(s);
    setForm({
      nome: s.nome,
      descricao: s.descricao ?? "",
      preco: String(s.preco),
      duracao: s.duracaoMin ? String(s.duracaoMin) : "",
    });
    setAberta(true);
  };

  const preco = Number(form.preco.replace(",", ".")) || 0;
  const valido = form.nome.trim().length > 0 && preco > 0;

  const salvar = async () => {
    if (!valido) return;
    const dados = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      preco,
      duracaoMin: Number(form.duracao) || undefined,
    };
    if (editando) await update(editando.id, dados);
    else await create({ ...dados, ativo: true });
    setAberta(false);
    toast.success(editando ? "✓ Serviço atualizado" : "✓ Serviço criado");
  };

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Serviços</h1>
        <button
          onClick={abrirNovo}
          className="tap flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground"
        >
          <Plus className="size-5" /> Novo
        </button>
      </header>

      <div className="mt-4 space-y-3">
        {servicos.map((s) => (
          <article key={s.id} className={`card-base px-4 py-4 ${s.ativo ? "" : "opacity-60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{s.nome}</p>
                {s.descricao ? (
                  <p className="truncate text-sm text-muted-foreground">{s.descricao}</p>
                ) : null}
                <p className="text-sm text-muted-foreground">
                  {s.duracaoMin ? `${s.duracaoMin} min · ` : ""}
                  {s.ativo ? "Ativo" : "Inativo"}
                </p>
              </div>
              <p className="num shrink-0 text-xl font-bold text-brand-light">{brl(s.preco)}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3 text-sm">
              <button
                onClick={() => abrirEdicao(s)}
                className="tap flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 font-medium"
              >
                <Pencil className="size-4" /> Editar
              </button>
              <button
                onClick={() => update(s.id, { ativo: !s.ativo })}
                className="tap rounded-full bg-secondary px-3 py-2 font-medium"
              >
                {s.ativo ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={() => setExcluir(s)}
                className="tap flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground"
              >
                <Trash2 className="size-4" /> Excluir
              </button>
            </div>
          </article>
        ))}
      </div>

      <Sheet
        open={aberta}
        onClose={() => setAberta(false)}
        title={editando ? "Editar serviço" : "Novo serviço"}
        footer={
          <PrimaryButton onClick={salvar} disabled={!valido}>
            Salvar serviço
          </PrimaryButton>
        }
      >
        <div className="space-y-4">
          <Field label="Nome">
            <TextInput
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Lavagem completa"
            />
          </Field>
          <Field label="Preço (R$)">
            <TextInput
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value.replace(/[^0-9.,]/g, "") })}
              inputMode="decimal"
              placeholder="80,00"
              className="num"
            />
          </Field>
          <Field label="Duração estimada (min, opcional)">
            <TextInput
              value={form.duracao}
              onChange={(e) => setForm({ ...form, duracao: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="60"
              className="num"
            />
          </Field>
          <Field label="Descrição (opcional)">
            <TextArea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </Field>
        </div>
      </Sheet>

      <Sheet
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir serviço"
        footer={
          <div className="flex gap-3">
            <GhostButton onClick={() => setExcluir(null)}>Cancelar</GhostButton>
            <PrimaryButton
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (excluir) await remove(excluir.id);
                setExcluir(null);
                toast.success("Serviço excluído");
              }}
            >
              Excluir
            </PrimaryButton>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Excluir “{excluir?.nome}”? Lavagens já registradas não serão afetadas.
        </p>
      </Sheet>
    </AppShell>
  );
}
