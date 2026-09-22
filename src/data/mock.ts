import type { Despesa, Lavagem, Servico } from "@/types";

const hoje = new Date();
const iso = (d: Date) => d.toISOString();
const dia = (d: Date) => d.toISOString().slice(0, 10);
const horasAtras = (h: number) => new Date(hoje.getTime() - h * 3600_000);
const diasAtras = (n: number) => new Date(hoje.getTime() - n * 86_400_000);

const servicos: Servico[] = [
  {
    id: "srv-1",
    nome: "Lavagem simples",
    descricao: "Lavagem externa rápida",
    preco: 50,
    duracaoMin: 30,
    ativo: true,
  },
  {
    id: "srv-2",
    nome: "Lavagem completa",
    descricao: "Externa + interna",
    preco: 80,
    duracaoMin: 60,
    ativo: true,
  },
  {
    id: "srv-3",
    nome: "Lavagem premium",
    descricao: "Completa + detalhamento",
    preco: 120,
    duracaoMin: 90,
    ativo: true,
  },
  {
    id: "srv-4",
    nome: "Lavagem + enceramento",
    descricao: "Completa com cera",
    preco: 150,
    duracaoMin: 120,
    ativo: true,
  },
];

const lavagens: Lavagem[] = [
  {
    id: "lav-1",
    clienteNome: "João da Silva",
    clienteTelefone: "(45) 99999-9999",
    veiculoModelo: "Honda Civic",
    veiculoPlaca: "ABC-1234",
    servicoId: "srv-2",
    servicoNome: "Lavagem completa",
    valorServico: 80,
    adicionalValor: 0,
    total: 80,
    status: "em_lavagem",
    criadoEm: iso(horasAtras(1)),
  },
  {
    id: "lav-2",
    clienteNome: "Carlos Oliveira",
    clienteTelefone: "(45) 98888-1122",
    veiculoModelo: "Chevrolet Onix",
    veiculoPlaca: "DEF-5678",
    servicoId: "srv-1",
    servicoNome: "Lavagem simples",
    valorServico: 50,
    adicionalValor: 20,
    adicionalDescricao: "Enceramento",
    total: 70,
    status: "em_lavagem",
    criadoEm: iso(horasAtras(2)),
  },
  {
    id: "lav-3",
    clienteNome: "Marcos Santos",
    clienteTelefone: "(45) 97777-3344",
    veiculoModelo: "Volkswagen Gol",
    veiculoPlaca: "GHI-9012",
    servicoId: "srv-1",
    servicoNome: "Lavagem simples",
    valorServico: 50,
    adicionalValor: 0,
    total: 50,
    status: "aguardando",
    criadoEm: iso(horasAtras(0.4)),
  },
  {
    id: "lav-4",
    clienteNome: "Ana Paula",
    clienteTelefone: "(45) 96666-5566",
    veiculoModelo: "Toyota Corolla",
    veiculoPlaca: "JKL-3456",
    servicoId: "srv-3",
    servicoNome: "Lavagem premium",
    valorServico: 120,
    adicionalValor: 0,
    total: 120,
    status: "finalizada",
    formaPagamento: "Pix",
    criadoEm: iso(horasAtras(5)),
    finalizadoEm: iso(horasAtras(3.5)),
  },
  {
    id: "lav-5",
    clienteNome: "Rafael Lima",
    clienteTelefone: "(45) 95555-7788",
    veiculoModelo: "Fiat Argo",
    veiculoPlaca: "MNO-7788",
    servicoId: "srv-4",
    servicoNome: "Lavagem + enceramento",
    valorServico: 150,
    adicionalValor: 0,
    total: 150,
    status: "finalizada",
    formaPagamento: "Dinheiro",
    criadoEm: iso(diasAtras(1)),
    finalizadoEm: iso(diasAtras(1)),
  },
];

const despesas: Despesa[] = [
  {
    id: "des-1",
    descricao: "Shampoo automotivo",
    valor: 89.9,
    categoria: "Produtos",
    data: dia(hoje),
    formaPagamento: "Pix",
  },
  {
    id: "des-2",
    descricao: "Conta de água",
    valor: 210.45,
    categoria: "Água",
    data: dia(diasAtras(3)),
    formaPagamento: "Débito",
  },
  {
    id: "des-3",
    descricao: "Reparo da lavadora",
    valor: 150,
    categoria: "Manutenção",
    data: dia(diasAtras(6)),
    formaPagamento: "Dinheiro",
    observacoes: "Troca de mangueira",
  },
  {
    id: "des-4",
    descricao: "Aluguel do box",
    valor: 1200,
    categoria: "Aluguel",
    data: dia(new Date(hoje.getFullYear(), hoje.getMonth(), 5)),
    formaPagamento: "Transferência",
  },
];

/**
 * Fonte única dos dados de demonstração.
 * Ao integrar o banco, somente a camada de repositórios precisa ser trocada.
 */
export const mockData = { servicos, lavagens, despesas };
