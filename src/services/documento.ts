import { brl, dataBR, whatsappLink } from "@/lib/format";
import { servicosDaLavagem, totalDosServicos } from "@/lib/lavagem";
import type { Lavagem } from "@/types";

/** Tipo do documento — derivado do status da lavagem. */
export type TipoDocumento = "orcamento" | "recibo";

export const tipoDocumentoDe = (status: Lavagem["status"]): TipoDocumento =>
  status === "finalizada" ? "recibo" : "orcamento";

export const TITULO_DOCUMENTO: Record<TipoDocumento, string> = {
  orcamento: "ORÇAMENTO",
  recibo: "RECIBO",
};

const EMPRESA = "LAVA-CAR DO VITINHO";

/** Linha com pontilhado entre descrição e valor (largura fixa em monoespaçado). */
const linhaPontilhada = (esquerda: string, direita: string, largura = 44) => {
  const pontos = Math.max(3, largura - esquerda.length - direita.length - 2);
  return `${esquerda} ${".".repeat(pontos)} ${direita}`;
};

/**
 * Gerador único de documento. O layout e a lógica são compartilhados:
 * muda apenas o título e, no recibo, a forma de pagamento.
 */
export async function gerarDocumento(lavagem: Lavagem, tipo: TipoDocumento) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a5" });
  const largura = doc.internal.pageSize.getWidth();
  const centro = largura / 2;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(EMPRESA, centro, y, { align: "center" });

  y += 28;
  doc.setFontSize(13);
  doc.text(TITULO_DOCUMENTO[tipo], centro, y, { align: "center" });

  y += 22;
  doc.setLineWidth(0.8);
  doc.line(40, y, largura - 40, y);

  y += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const dados = [
    `Cliente: ${lavagem.clienteNome}`,
    `Veículo: ${lavagem.veiculoModelo}`,
    `Placa: ${lavagem.veiculoPlaca}`,
    `Data: ${dataBR(tipo === "recibo" && lavagem.finalizadoEm ? lavagem.finalizadoEm : lavagem.criadoEm)}`,
  ];
  for (const linha of dados) {
    doc.text(linha, 40, y);
    y += 18;
  }

  y += 16;
  doc.setFont("courier", "normal");
  doc.setFontSize(11);
  // O adicional é acréscimo do serviço: mostramos apenas o valor final de cada um.
  const itens = servicosDaLavagem(lavagem);
  for (const item of itens) {
    doc.text(linhaPontilhada(item.nome, brl(item.valorFinal)), 40, y);
    y += 18;
  }

  const total = totalDosServicos(itens) || lavagem.total || 0;
  y += 10;
  doc.setFont("courier", "bold");
  doc.text(linhaPontilhada("TOTAL", brl(total)), 40, y);

  if (tipo === "recibo" && lavagem.formaPagamento) {
    y += 30;
    doc.setFont("helvetica", "normal");
    doc.text(`Pagamento: ${lavagem.formaPagamento}`, 40, y);
  }

  const nome = `${tipo === "recibo" ? "recibo" : "orcamento"}-${lavagem.veiculoPlaca || "lavagem"}.pdf`;
  return { blob: doc.output("blob") as Blob, nome };
}

/** Gera e abre o compartilhamento nativo (Android); se indisponível, baixa o arquivo. */
export async function compartilharDocumento(lavagem: Lavagem, tipo: TipoDocumento) {
  const { blob, nome } = await gerarDocumento(lavagem, tipo);
  const titulo = TITULO_DOCUMENTO[tipo];
  const texto = `${titulo} — ${EMPRESA}\n${lavagem.veiculoModelo} · ${lavagem.veiculoPlaca}\nTotal: ${brl(lavagem.total)}`;

  const arquivo = new File([blob], nome, { type: "application/pdf" });
  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
  };

  if (nav.share && nav.canShare?.({ files: [arquivo] })) {
    try {
      await nav.share({ files: [arquivo], title: titulo, text: texto });
      return "compartilhado" as const;
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === "AbortError") return "cancelado" as const;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  if (lavagem.clienteTelefone) {
    window.open(whatsappLink(lavagem.clienteTelefone, texto), "_blank", "noreferrer");
  }
  return "baixado" as const;
}
