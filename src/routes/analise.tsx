import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, TextInput } from "@/components/Field";
import { PERIODOS, useAnaliseFinanceira } from "@/hooks/useAnaliseFinanceira";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

const COR_FATURAMENTO = "#849F58";
const COR_GASTOS = "#9270C5";
const COR_LUCRO = "#D6DAC9";
const COR_NEGATIVO = "#C2543F";

export const Route = createFileRoute("/analise")({
  head: () => ({
    meta: [
      { title: "Análise financeira — Lava-Car do Vitinho" },
      {
        name: "description",
        content:
          "Faturamento, gastos e lucro do Lava-Car do Vitinho em gráficos simples por período.",
      },
      { property: "og:title", content: "Análise financeira — Lava-Car do Vitinho" },
      {
        property: "og:description",
        content: "Quanto entrou, quanto saiu e quanto sobrou no período escolhido.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalisePage,
});

const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;
const compacto = (v: number) =>
  Math.abs(v) >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v));

function Variacao({ valor, mesmoMes }: { valor: number | null; mesmoMes: boolean }) {
  if (valor === null) {
    return <p className="mt-1 text-xs text-muted-foreground">Sem dados anteriores</p>;
  }
  const sobe = valor > 0;
  const igual = valor === 0;
  const Icon = igual ? Minus : sobe ? ArrowUpRight : ArrowDownRight;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="size-3.5" />
      <span className="num text-foreground">{pct(Math.abs(valor))}</span>
      em relação {mesmoMes ? "ao mês anterior" : "ao período anterior"}
    </p>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-base px-3 py-2 text-xs">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="num text-foreground">{brl(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

const eixo = { stroke: "#8a8f84", fontSize: 11 } as const;

function AnalisePage() {
  const { resumo, periodo, setPeriodo, de, setDe, ate, setAte } = useAnaliseFinanceira();
  const mesmoMes = periodo === "mes";
  const lucroPositivo = resumo.lucro >= 0;

  const situacao = {
    positivo: { texto: "Resultado positivo", classe: "bg-brand/20 text-brand-light" },
    empate: { texto: "Empate financeiro", classe: "bg-secondary text-muted-foreground" },
    negativo: { texto: "Resultado negativo", classe: "bg-destructive/20 text-destructive" },
  }[resumo.situacao];

  return (
    <AppShell>
      <header>
        <h1 className="font-display text-2xl font-bold">Análise financeira</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quanto entrou, quanto saiu e quanto sobrou.
        </p>
      </header>

      {/* Filtro de período */}
      <div className="scrollbar-hidden -mx-4 mt-4 overflow-x-auto px-4">
        <div className="flex w-max gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={cn(
                "tap h-10 shrink-0 rounded-full border px-4 text-sm font-medium",
                periodo === p.id
                  ? "border-brand bg-brand/20 text-brand-light"
                  : "border-border bg-secondary text-muted-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {periodo === "custom" ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="De">
            <TextInput type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </Field>
          <Field label="Até">
            <TextInput type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </Field>
        </div>
      ) : null}

      {/* Cards de resumo */}
      <section className="mt-4 space-y-3">
        <div className="card-base px-4 py-4">
          <p className="text-sm text-muted-foreground">Faturamento</p>
          <p className="num text-2xl font-bold" style={{ color: COR_FATURAMENTO }}>
            {brl(resumo.faturamento)}
          </p>
          <Variacao valor={resumo.variacao.faturamento} mesmoMes={mesmoMes} />
        </div>
        <div className="card-base px-4 py-4">
          <p className="text-sm text-muted-foreground">Gastos</p>
          <p className="num text-2xl font-bold" style={{ color: COR_GASTOS }}>
            {brl(resumo.gastos)}
          </p>
          <Variacao valor={resumo.variacao.gastos} mesmoMes={mesmoMes} />
        </div>
        <div className="card-base border-brand/40 bg-brand/10 px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Lucro</p>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", situacao.classe)}>
              {situacao.texto}
            </span>
          </div>
          <p
            className="num text-3xl font-bold"
            style={{ color: lucroPositivo ? COR_FATURAMENTO : COR_NEGATIVO }}
          >
            {brl(resumo.lucro)}
          </p>
          <Variacao valor={resumo.variacao.lucro} mesmoMes={mesmoMes} />
        </div>
      </section>

      {/* Gráfico principal */}
      <section className="card-base mt-5 px-3 py-4">
        <div className="px-1">
          <h2 className="font-display text-base font-semibold">Faturamento x Gastos</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Compare quanto entrou, quanto foi gasto e o resultado do período.
          </p>
        </div>
        {resumo.temDados ? (
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resumo.serie} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#ffffff14" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={eixo} minTickGap={12} />
                <YAxis tickLine={false} axisLine={false} tick={eixo} tickFormatter={compacto} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="faturamento"
                  name="Faturamento"
                  stroke={COR_FATURAMENTO}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke={COR_GASTOS}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro"
                  stroke={COR_LUCRO}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Sem dados neste período.
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
          {[
            ["Faturamento", COR_FATURAMENTO],
            ["Gastos", COR_GASTOS],
            ["Lucro", COR_LUCRO],
          ].map(([label, cor]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: cor }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Evolução do lucro */}
      <section className="card-base mt-4 px-3 py-4">
        <h2 className="px-1 font-display text-base font-semibold">Evolução do lucro</h2>
        {resumo.temDados ? (
          <div className="mt-4 h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumo.serie} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-lucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COR_FATURAMENTO} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COR_FATURAMENTO} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff14" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={eixo} minTickGap={12} />
                <YAxis tickLine={false} axisLine={false} tick={eixo} tickFormatter={compacto} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="lucro"
                  name="Lucro"
                  stroke={COR_FATURAMENTO}
                  strokeWidth={2}
                  fill="url(#grad-lucro)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Sem dados neste período.
          </p>
        )}
      </section>

      {/* Gastos por categoria */}
      <section className="card-base mt-4 px-4 py-4">
        <h2 className="font-display text-base font-semibold">Onde o dinheiro está sendo gasto</h2>
        {resumo.categorias.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma despesa neste período.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {resumo.categorias.map((c) => (
              <div key={c.categoria}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{c.categoria}</span>
                  <span className="num shrink-0">
                    {brl(c.valor)}{" "}
                    <span className="text-xs text-muted-foreground">{pct(c.percentual)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(c.percentual, 2)}%`, background: COR_GASTOS }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Métricas simples */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="card-base px-4 py-4">
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="num mt-1 text-lg font-semibold">
            {resumo.ticketMedio === null ? "Sem dados" : brl(resumo.ticketMedio)}
          </p>
        </div>
        <div className="card-base px-4 py-4">
          <p className="text-xs text-muted-foreground">Lavagens realizadas</p>
          <p className="num mt-1 text-lg font-semibold">{resumo.lavagens}</p>
        </div>
        <div className="card-base col-span-2 px-4 py-4">
          <p className="text-xs text-muted-foreground">Média de faturamento por dia</p>
          <p className="num mt-1 text-lg font-semibold">
            {resumo.mediaPorDia === null ? "Sem dados" : brl(resumo.mediaPorDia)}
          </p>
        </div>
      </section>

      {/* Resumo do negócio */}
      <section className="card-base mt-4 px-4 py-4">
        <h2 className="font-display text-base font-semibold">Resumo do negócio</h2>
        <dl className="mt-3 divide-y divide-border text-sm">
          {[
            ["Faturamento", brl(resumo.faturamento)],
            ["Gastos", brl(resumo.gastos)],
            ["Lucro", brl(resumo.lucro)],
            [
              "Margem sobre faturamento",
              resumo.margem === null ? "Não disponível" : pct(resumo.margem),
            ],
          ].map(([label, valor]) => (
            <div key={label} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="num font-semibold">{valor}</dd>
            </div>
          ))}
        </dl>
      </section>
    </AppShell>
  );
}
