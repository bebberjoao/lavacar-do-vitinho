import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Sheet } from "@/components/Sheet";
import { Field, PrimaryButton, SelectInput, TextArea, TextInput } from "@/components/Field";
import { useDespesas } from "@/hooks/useDespesas";
import { brl, dataBR, hojeISO } from "@/lib/format";
import {
  CATEGORIAS_DESPESA,
  FORMAS_PAGAMENTO,
  type CategoriaDespesa,
  type Despesa,
  type FormaPagamento,
} from "@/types";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas — Lava-Car do Vitinho" },
      {
        name: "description",
        content: "Registre e acompanhe as despesas diárias e mensais do Lava-Car do Vitinho.",
      },
      { property: "og:title", content: "Despesas — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Totais do dia e do mês com registro rápido de despesas.",
      },
    ],
  }),
  component: DespesasPage,
});

function DespesasPage() {
  const { despesas, totais, create, remove } = useDespesas();
  const [aberta, setAberta] = useState(false);
  const [excluir, setExcluir] = useState<Despesa | null>(null);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("Produtos");
  const [data, setData] = useState(hojeISO());
  const [pagamento, setPagamento] = useState<FormaPagamento>("Pix");
  const [obs, setObs] = useState("");

  const valorNum = Number(valor.replace(",", ".")) || 0;
  const valido = descricao.trim().length > 0 && valorNum > 0;

  const salvar = async () => {
    if (!valido) return;
    await create({
      descricao: descricao.trim(),
      valor: valorNum,
      categoria,
      data,
      formaPagamento: pagamento,
      observacoes: obs.trim() || undefined,
    });
    setDescricao("");
    setValor("");
    setObs("");
    setData(hojeISO());
    setAberta(false);
    toast.success("✓ Despesa registrada");
  };

  return (
    <AppShell theme="expense">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h1 className="truncate font-display text-2xl font-bold">Despesas</h1>
        <button
          onClick={() => setAberta(true)}
          className="tap hidden h-11 shrink-0 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-card hover:bg-brand-light lg:flex"
        >
          <Plus className="size-5" /> Registrar
        </button>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="card-base border-brand/40 bg-brand/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">Despesas hoje</p>
          <p className="num mt-1 text-2xl font-bold text-brand-light">{brl(totais.hoje)}</p>
        </div>
        <div className="card-base px-4 py-4">
          <p className="text-sm text-muted-foreground">Este mês</p>
          <p className="num mt-1 text-2xl font-bold">{brl(totais.mes)}</p>
        </div>
      </section>

      <section className="mt-5 space-y-3">
        {despesas.length === 0 ? (
          <p className="card-base px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma despesa registrada.
          </p>
        ) : (
          despesas.map((d) => (
            <article key={d.id} className="card-base px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{d.descricao}</p>
                  <p className="mt-0.5 text-sm text-brand-light">{d.categoria}</p>
                  <p className="text-sm text-muted-foreground">
                    {dataBR(d.data)} · {d.formaPagamento}
                  </p>
                  {d.observacoes ? (
                    <p className="mt-1 text-xs text-muted-foreground">{d.observacoes}</p>
                  ) : null}
                </div>
                <p className="num shrink-0 text-xl font-bold">{brl(d.valor)}</p>
              </div>
              <button
                onClick={() => setExcluir(d)}
                className="tap mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Trash2 className="size-4" /> Excluir
              </button>
            </article>
          ))
        )}
      </section>

      <button
        onClick={() => setAberta(true)}
        aria-label="Registrar despesa"
        className="tap fixed right-4 bottom-24 z-30 flex h-14 items-center gap-2 rounded-full bg-brand px-5 font-semibold text-brand-foreground shadow-float lg:hidden"
      >
        <Plus className="size-6" /> Registrar despesa
      </button>

      <Sheet
        open={aberta}
        onClose={() => setAberta(false)}
        title="Nova despesa"
        footer={
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor</span>
              <span className="num text-2xl font-bold text-brand-light">{brl(valorNum)}</span>
            </div>
            <PrimaryButton onClick={salvar} disabled={!valido}>
              Salvar despesa
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Descrição">
            <TextInput
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Shampoo automotivo"
            />
          </Field>
          <Field label="Valor (R$)">
            <TextInput
              value={valor}
              onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
              inputMode="decimal"
              placeholder="0,00"
              className="num"
            />
          </Field>
          <Field label="Categoria">
            <SelectInput
              icon={Tag}
              title="Categoria"
              value={categoria}
              onChange={(v) => setCategoria(v as CategoriaDespesa)}
              options={CATEGORIAS_DESPESA.map((c) => ({ value: c, label: c }))}
            />
          </Field>
          <Field label="Data">
            <TextInput type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </Field>
          <Field label="Forma de pagamento">
            <SelectInput
              icon={CreditCard}
              title="Forma de pagamento"
              value={pagamento}
              onChange={(v) => setPagamento(v as FormaPagamento)}
              options={FORMAS_PAGAMENTO.map((f) => ({ value: f, label: f }))}
            />
          </Field>
          <Field label="Observações (opcional)">
            <TextArea value={obs} onChange={(e) => setObs(e.target.value)} />
          </Field>
        </div>
      </Sheet>

      <Sheet
        open={!!excluir}
        onClose={() => setExcluir(null)}
        title="Excluir despesa"
        footer={
          <PrimaryButton
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={async () => {
              if (excluir) await remove(excluir.id);
              setExcluir(null);
              toast.success("Despesa excluída");
            }}
          >
            Excluir
          </PrimaryButton>
        }
      >
        <p className="text-sm text-muted-foreground">
          Excluir “{excluir?.descricao}”? Essa ação não pode ser desfeita.
        </p>
      </Sheet>
    </AppShell>
  );
}
