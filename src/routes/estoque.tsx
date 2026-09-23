import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Bell, Plus, Ruler, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Sheet } from "@/components/Sheet";
import {
  Field,
  GhostButton,
  PrimaryButton,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/Field";
import { useEstoque } from "@/hooks/useEstoque";
import {
  AVISOS_ESTOQUE,
  AVISO_LABEL,
  CATEGORIAS_ESTOQUE,
  UNIDADES_ESTOQUE,
  type AvisoEstoque,
  type CategoriaEstoque,
  type ItemEstoque,
  type UnidadeEstoque,
} from "@/types";

export const Route = createFileRoute("/estoque")({
  head: () => ({
    meta: [
      { title: "Estoque — Lava-Car do Vitinho" },
      {
        name: "description",
        content:
          "Controle simples de produtos, equipamentos e consumíveis do Lava-Car do Vitinho, com avisos de compra e manutenção.",
      },
      { property: "og:title", content: "Estoque — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Veja o que você tem, o que acabou e o que precisa de manutenção.",
      },
    ],
  }),
  component: EstoquePage,
});

const filtros = [
  { id: "todos", label: "Todos" },
  { id: "Produtos", label: "Produtos" },
  { id: "Equipamentos", label: "Equipamentos" },
  { id: "Consumíveis", label: "Consumíveis" },
  { id: "aviso", label: "Com aviso" },
] as const;

type FiltroId = (typeof filtros)[number]["id"];

const vazio = {
  nome: "",
  categoria: "Produtos" as CategoriaEstoque,
  quantidade: "",
  unidade: "unidade" as UnidadeEstoque,
  observacao: "",
  aviso: "nenhum" as AvisoEstoque,
};

function AvisoChip({ aviso }: { aviso: AvisoEstoque }) {
  if (aviso === "nenhum") return null;
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-status-wait/12 px-2.5 py-1 text-xs font-semibold text-status-wait">
      <AlertTriangle className="size-3.5" /> {AVISO_LABEL[aviso]}
    </span>
  );
}

function EstoquePage() {
  const { itens, comAviso, criar, atualizar, remove } = useEstoque();
  const [filtro, setFiltro] = useState<FiltroId>("todos");
  const [aberta, setAberta] = useState(false);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [form, setForm] = useState(vazio);
  const [excluir, setExcluir] = useState<ItemEstoque | null>(null);

  const lista = useMemo(() => {
    if (filtro === "todos") return itens;
    if (filtro === "aviso") return comAviso;
    return itens.filter((i) => i.categoria === filtro);
  }, [itens, comAviso, filtro]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(vazio);
    setAberta(true);
  };

  const abrirEdicao = (i: ItemEstoque) => {
    setEditando(i);
    setForm({
      nome: i.nome,
      categoria: i.categoria,
      quantidade: String(i.quantidade),
      unidade: i.unidade,
      observacao: i.observacao ?? "",
      aviso: i.aviso,
    });
    setAberta(true);
  };

  const quantidade = Number(form.quantidade.replace(",", ".")) || 0;
  const valido = form.nome.trim().length > 0;

  const salvar = async () => {
    if (!valido) return;
    const dados = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      quantidade,
      unidade: form.unidade,
      observacao: form.observacao.trim() || undefined,
      aviso: form.aviso,
    };
    if (editando) await atualizar(editando.id, dados);
    else await criar(dados);
    setAberta(false);
    toast.success(editando ? "✓ Item atualizado" : "✓ Item cadastrado");
  };

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Estoque</h1>
        <button
          onClick={abrirNovo}
          className="tap hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground lg:flex"
        >
          <Plus className="size-5" /> Novo item
        </button>
      </header>

      {/* Atenção */}
      {comAviso.length > 0 ? (
        <section className="card-base mt-4 border-status-wait/40 px-4 py-4">
          <p className="flex items-center gap-2 font-display text-base font-semibold text-status-wait">
            <AlertTriangle className="size-5" /> Atenção
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {comAviso.length}{" "}
            {comAviso.length === 1 ? "item precisa de atenção" : "itens precisam de atenção"}
          </p>
          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
            {comAviso.map((i) => (
              <button
                key={i.id}
                onClick={() => abrirEdicao(i)}
                className="tap flex w-full items-center justify-between gap-3 rounded-xl px-1 py-2 text-left hover:bg-accent"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{i.nome}</span>
                <AvisoChip aviso={i.aviso} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Filtros */}
      <div className="scrollbar-hidden -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filtros.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`tap h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${
              filtro === f.id
                ? "border-brand bg-brand/15 text-brand-light"
                : "border-border bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3">
        {lista.length === 0 ? (
          <p className="card-base px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum item aqui. Toque em “Novo item” para cadastrar.
          </p>
        ) : (
          lista.map((i) => (
            <button
              key={i.id}
              onClick={() => abrirEdicao(i)}
              className="tap card-base w-full px-4 py-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{i.nome}</p>
                  <p className="truncate text-sm text-muted-foreground">{i.categoria}</p>
                </div>
                <p className="num shrink-0 text-lg font-bold">
                  {i.quantidade}{" "}
                  <span className="text-sm font-medium text-muted-foreground">{i.unidade}</span>
                </p>
              </div>
              {i.observacao || i.aviso !== "nenhum" ? (
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {i.observacao || "—"}
                  </span>
                  <AvisoChip aviso={i.aviso} />
                </div>
              ) : null}
            </button>
          ))
        )}
      </div>

      {/* Botão flutuante (mobile) */}
      <button
        onClick={abrirNovo}
        aria-label="Novo item"
        className="tap fixed right-4 bottom-24 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-float lg:hidden"
      >
        <Plus className="size-6" /> Novo item
      </button>

      <Sheet
        open={aberta}
        onClose={() => setAberta(false)}
        title={editando ? "Editar item" : "Novo item"}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={salvar} disabled={!valido}>
              Salvar item
            </PrimaryButton>
            {editando ? (
              <button
                onClick={() => {
                  const alvo = editando;
                  setAberta(false);
                  setExcluir(alvo);
                }}
                className="tap flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground"
              >
                <Trash2 className="size-4" /> Excluir item
              </button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Nome">
            <TextInput
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Shampoo automotivo"
            />
          </Field>
          <Field label="Categoria">
            <SelectInput
              icon={Tag}
              title="Categoria"
              value={form.categoria}
              onChange={(v) => setForm({ ...form, categoria: v as CategoriaEstoque })}
              options={CATEGORIAS_ESTOQUE.map((c) => ({ value: c, label: c }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade">
              <TextInput
                value={form.quantidade}
                onChange={(e) =>
                  setForm({ ...form, quantidade: e.target.value.replace(/[^0-9.,]/g, "") })
                }
                inputMode="decimal"
                placeholder="2"
                className="num"
              />
            </Field>
            <Field label="Unidade">
              <SelectInput
                icon={Ruler}
                title="Unidade de medida"
                value={form.unidade}
                onChange={(v) => setForm({ ...form, unidade: v as UnidadeEstoque })}
                options={UNIDADES_ESTOQUE.map((u) => ({ value: u, label: u }))}
              />
            </Field>
          </div>
          <Field label="Aviso" hint="Usado para destacar o item na lista de atenção.">
            <SelectInput
              icon={Bell}
              title="Aviso"
              value={form.aviso}
              onChange={(v) => setForm({ ...form, aviso: v as AvisoEstoque })}
              options={AVISOS_ESTOQUE.map((a) => ({ value: a, label: AVISO_LABEL[a] }))}
            />
          </Field>
          <Field label="Observação (opcional)">
            <TextArea
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              placeholder="Acabando, comprar na próxima semana"
            />
          </Field>
        </div>
      </Sheet>

      <Sheet
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir item"
        footer={
          <div className="flex gap-3">
            <GhostButton onClick={() => setExcluir(null)}>Cancelar</GhostButton>
            <PrimaryButton
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (excluir) await remove(excluir.id);
                setExcluir(null);
                toast.success("Item excluído");
              }}
            >
              Excluir
            </PrimaryButton>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">Excluir “{excluir?.nome}” do estoque?</p>
      </Sheet>
    </AppShell>
  );
}
