export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
}

export interface Veiculo {
  id: string;
  modelo: string;
  placa: string;
  clienteId?: string | undefined;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string | undefined;
  preco: number;
  duracaoMin?: number | undefined;
  ativo: boolean;
}

export type StatusLavagem = "aguardando" | "em_lavagem" | "finalizada";

export type FormaPagamento = "Dinheiro" | "Pix" | "Débito" | "Crédito" | "Transferência";

/** Item de serviço de uma lavagem (equivale a lavagem_servicos). */
export interface LavagemServico {
  id: string;
  servicoId: string;
  nome: string;
  valorBase: number;
  adicionalValor: number;
  valorFinal: number;
}

export interface Lavagem {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  /** Vários serviços por lavagem. */
  servicos: LavagemServico[];
  total: number;
  status: StatusLavagem;
  formaPagamento?: FormaPagamento | undefined;
  criadoEm: string;
  finalizadoEm?: string | undefined;

  /* Campos legados (lavagens gravadas antes de vários serviços). */
  servicoId?: string | undefined;
  servicoNome?: string | undefined;
  valorServico?: number | undefined;
  adicionalValor?: number | undefined;
  adicionalDescricao?: string | undefined;
}

export type StatusAgendamento = "agendado" | "concluido" | "cancelado";

/** Reserva de lavagem marcada para uma data/hora futura. */
export interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  servicoId: string;
  servicoNome: string;
  valor: number;
  data: string; // ISO yyyy-mm-dd
  hora: string; // HH:mm
  observacoes?: string | undefined;
  status: StatusAgendamento;
  criadoEm: string;
}

export type CategoriaDespesa =
  | "Produtos"
  | "Equipamentos"
  | "Manutenção"
  | "Água"
  | "Energia"
  | "Aluguel"
  | "Combustível"
  | "Marketing"
  | "Outros";

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
  data: string; // ISO yyyy-mm-dd
  formaPagamento: FormaPagamento;
  observacoes?: string | undefined;
}

export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  "Produtos",
  "Equipamentos",
  "Manutenção",
  "Água",
  "Energia",
  "Aluguel",
  "Combustível",
  "Marketing",
  "Outros",
];

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "Dinheiro",
  "Pix",
  "Débito",
  "Crédito",
  "Transferência",
];

/* ---------------------------------------------------------------- Estoque */

export type CategoriaEstoque = "Produtos" | "Equipamentos" | "Consumíveis";

export type UnidadeEstoque = "unidade" | "litro" | "ml" | "kg" | "pacote" | "caixa";

/** Aviso do item. Base para notificações automáticas futuras (aviso !== "nenhum"). */
export type AvisoEstoque = "nenhum" | "comprar" | "manutencao" | "conserto" | "verificar" | "outro";

export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  quantidade: number;
  unidade: UnidadeEstoque;
  observacao?: string | undefined;
  aviso: AvisoEstoque;
  created_at: string;
  updated_at: string;
}

export const CATEGORIAS_ESTOQUE: CategoriaEstoque[] = ["Produtos", "Equipamentos", "Consumíveis"];

export const UNIDADES_ESTOQUE: UnidadeEstoque[] = [
  "unidade",
  "litro",
  "ml",
  "kg",
  "pacote",
  "caixa",
];

export const AVISOS_ESTOQUE: AvisoEstoque[] = [
  "nenhum",
  "comprar",
  "manutencao",
  "conserto",
  "verificar",
  "outro",
];

export const AVISO_LABEL: Record<AvisoEstoque, string> = {
  nenhum: "Nenhum",
  comprar: "Comprar",
  manutencao: "Manutenção",
  conserto: "Conserto",
  verificar: "Verificar",
  outro: "Outro",
};

