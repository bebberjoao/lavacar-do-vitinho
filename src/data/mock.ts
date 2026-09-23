import type { Agendamento, Despesa, ItemEstoque, Lavagem, Servico } from "@/types";

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

const srvItem = (
  id: string,
  servicoId: string,
  nome: string,
  valorBase: number,
  adicionalValor = 0,
) => ({
  id,
  servicoId,
  nome,
  valorBase,
  adicionalValor,
  valorFinal: valorBase + adicionalValor,
});

const lavagens: Lavagem[] = [
  {
    id: "lav-1",
    clienteNome: "João da Silva",
    clienteTelefone: "(45) 99999-9999",
    veiculoModelo: "Honda Civic",
    veiculoPlaca: "ABC-1234",
    servicos: [srvItem("lav-1-1", "srv-2", "Lavagem completa", 80)],
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
    servicos: [srvItem("lav-2-1", "srv-1", "Lavagem simples", 50, 20)],
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
    servicos: [srvItem("lav-3-1", "srv-1", "Lavagem simples", 50)],
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
    servicos: [
      srvItem("lav-4-1", "srv-3", "Lavagem premium", 120),
      srvItem("lav-4-2", "srv-1", "Lavagem simples", 50),
    ],
    total: 170,
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
    servicos: [srvItem("lav-5-1", "srv-4", "Lavagem + enceramento", 150)],
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

const emDias = (n: number) => new Date(hoje.getTime() + n * 86_400_000);

const agendamentos: Agendamento[] = [
  {
    id: "agd-1",
    clienteNome: "Fernanda Costa",
    clienteTelefone: "(45) 99123-4567",
    veiculoModelo: "Jeep Renegade",
    veiculoPlaca: "PQR-2233",
    servicoId: "srv-2",
    servicoNome: "Lavagem completa",
    valor: 80,
    data: dia(hoje),
    hora: "14:00",
    status: "agendado",
    criadoEm: iso(horasAtras(6)),
  },
  {
    id: "agd-2",
    clienteNome: "Bruno Almeida",
    clienteTelefone: "(45) 99876-1010",
    veiculoModelo: "Hyundai HB20",
    veiculoPlaca: "STU-4455",
    servicoId: "srv-1",
    servicoNome: "Lavagem simples",
    valor: 50,
    data: dia(hoje),
    hora: "16:30",
    observacoes: "Cliente aguarda no local",
    status: "agendado",
    criadoEm: iso(horasAtras(4)),
  },
  {
    id: "agd-3",
    clienteNome: "Juliana Reis",
    clienteTelefone: "(45) 99555-2020",
    veiculoModelo: "Ford Ka",
    veiculoPlaca: "VWX-6677",
    servicoId: "srv-3",
    servicoNome: "Lavagem premium",
    valor: 120,
    data: dia(emDias(1)),
    hora: "09:00",
    status: "agendado",
    criadoEm: iso(horasAtras(20)),
  },
  {
    id: "agd-4",
    clienteNome: "Pedro Henrique",
    clienteTelefone: "(45) 99444-3030",
    veiculoModelo: "Toyota Hilux",
    veiculoPlaca: "YZA-8899",
    servicoId: "srv-4",
    servicoNome: "Lavagem + enceramento",
    valor: 150,
    data: dia(emDias(3)),
    hora: "10:30",
    observacoes: "Caminhonete grande",
    status: "agendado",
    criadoEm: iso(diasAtras(1)),
  },
];

const item = (
  id: string,
  nome: string,
  categoria: ItemEstoque["categoria"],
  quantidade: number,
  unidade: ItemEstoque["unidade"],
  aviso: ItemEstoque["aviso"],
  observacao?: string,
): ItemEstoque => ({
  id,
  nome,
  categoria,
  quantidade,
  unidade,
  aviso,
  observacao,
  created_at: iso(diasAtras(20)),
  updated_at: iso(diasAtras(1)),
});

const estoque: ItemEstoque[] = [
  item("est-1", "Shampoo automotivo", "Produtos", 2, "litro", "comprar", "Acabando"),
  item("est-2", "Cera líquida", "Produtos", 1, "litro", "nenhum"),
  item("est-3", "Pretinho", "Produtos", 3, "litro", "nenhum"),
  item("est-4", "Limpa-vidros", "Produtos", 1, "litro", "verificar"),
  item("est-5", "Lavadora de alta pressão", "Equipamentos", 1, "unidade", "manutencao", "Revisão anual"),
  item("est-6", "Aspirador", "Equipamentos", 1, "unidade", "conserto", "Mangueira solta"),
  item("est-7", "Compressor", "Equipamentos", 1, "unidade", "nenhum"),
  item("est-8", "Panos de microfibra", "Consumíveis", 12, "unidade", "nenhum"),
  item("est-9", "Esponjas", "Consumíveis", 4, "pacote", "nenhum"),
  item("est-10", "Luvas", "Consumíveis", 2, "caixa", "comprar"),
];

/**
 * Fonte única dos dados de demonstração.
 * Ao integrar o banco, somente a camada de repositórios precisa ser trocada.
 */
export const mockData = { servicos, lavagens, despesas, agendamentos, estoque };

