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

export interface Lavagem {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  servicoId: string;
  servicoNome: string;
  valorServico: number;
  adicionalValor: number;
  adicionalDescricao?: string | undefined;
  total: number;
  status: StatusLavagem;
  formaPagamento?: FormaPagamento | undefined;
  criadoEm: string;
  finalizadoEm?: string | undefined;
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
