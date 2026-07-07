import jsPDF from "jspdf";
import { formatBRL } from "@/lib/store";
import { loadLogoDataURL, drawLogo } from "@/lib/pdfHelpers";

type Item = { name: string; isService: boolean; quantity: number; unitPrice: number };
type Args = {
  quoteId: string;
  date: Date;
  validityDate?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentConditions?: string;
  notes?: string;
  items: Item[];
  laborValue: number;
  subtotal: number;
  discount: number;
  total: number;
  businessName?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  businessLogoUrl?: string | null;
};

export async function generateQuotePDF(a: Args) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  const left = 20;
  const right = 190;
  const contentWidth = right - left;

  const logo = await loadLogoDataURL(a.businessLogoUrl);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("ORÇAMENTO", left, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`#${a.quoteId.slice(0, 8).toUpperCase()}`, left, y + 6);

  // Business Info (Right aligned) — with optional logo
  doc.setTextColor(0, 0, 0);
  let by = 14;
  const logoH = logo ? drawLogo(doc, logo, right - 30, by, 30, 18) : 0;
  if (logoH) by += logoH + 3;
  if (a.businessName) {
    doc.setFont("helvetica", "bold");
    doc.text(a.businessName, right, by, { align: "right" });
    doc.setFont("helvetica", "normal");
    by += 5;
  }
  if (a.businessPhone) { doc.text(a.businessPhone, right, by, { align: "right" }); by += 5; }
  if (a.businessEmail) { doc.text(a.businessEmail, right, by, { align: "right" }); by += 5; }
  if (a.businessAddress) { doc.text(a.businessAddress, right, by, { align: "right" }); by += 5; }

  y = Math.max(y + 15, by + 5);
  doc.setDrawColor(200, 200, 200);
  doc.line(left, y, right, y);
  y += 10;

  // Dates & Customer Info
  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", left, y);
  doc.setFont("helvetica", "normal");
  if (a.customerName) {
    doc.text(a.customerName, left + 20, y);
    y += 5;
    if (a.customerPhone) { doc.text(`Telefone: ${a.customerPhone}`, left + 20, y); y += 5; }
    if (a.customerEmail) { doc.text(`E-mail: ${a.customerEmail}`, left + 20, y); y += 5; }
  } else {
    doc.text("Não informado", left + 20, y);
    y += 5;
  }

  let dy = y - (a.customerName ? (a.customerPhone ? 10 : 5) : 5);
  doc.setFont("helvetica", "bold");
  doc.text("Emissão:", 140, dy);
  doc.setFont("helvetica", "normal");
  doc.text(a.date.toLocaleDateString("pt-BR"), 165, dy);
  dy += 5;
  
  if (a.validityDate) {
    doc.setFont("helvetica", "bold");
    doc.text("Validade:", 140, dy);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(a.validityDate).toLocaleDateString("pt-BR"), 165, dy);
  }
  
  y += 10;

  // Table Header
  doc.setFillColor(245, 245, 245);
  doc.rect(left, y, contentWidth, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Descrição", left + 5, y + 7);
  doc.text("Qtd", 140, y + 7, { align: "center" });
  doc.text("V. Unit", 165, y + 7, { align: "right" });
  doc.text("Total", right - 5, y + 7, { align: "right" });
  y += 15;

  // Table Body
  doc.setFont("helvetica", "normal");
  for (const it of a.items) {
    // Break long names
    const splitName = doc.splitTextToSize(it.name, 100);
    const itemHeight = splitName.length * 5;
    
    // Check page break
    if (y + itemHeight > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(splitName, left + 5, y);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(it.isService ? "Serviço" : "Produto", left + 5, y + (splitName.length * 5));
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    doc.text(it.quantity.toString(), 140, y, { align: "center" });
    doc.text(formatBRL(it.unitPrice), 165, y, { align: "right" });
    doc.text(formatBRL(it.unitPrice * it.quantity), right - 5, y, { align: "right" });
    
    y += Math.max(itemHeight + 5, 10);
    doc.setDrawColor(240, 240, 240);
    doc.line(left, y - 3, right, y - 3);
  }

  y += 10;

  // Totals
  if (y > 240) { doc.addPage(); y = 20; }
  
  doc.setFontSize(11);
  doc.text("Subtotal:", 145, y, { align: "right" });
  doc.text(formatBRL(a.subtotal), right - 5, y, { align: "right" });
  y += 6;

  if ((a.laborValue || 0) > 0) {
    const label = a.laborLabel || "Mão de Obra";
    doc.text(`${label}:`, 145, y, { align: "right" });
    doc.text(formatBRL(a.laborValue || 0), right - 5, y, { align: "right" });
    y += 6;
  }
  
  if (a.discount > 0) {
    doc.setTextColor(220, 38, 38); // red
    doc.text("Desconto:", 145, y, { align: "right" });
    doc.text(`-${formatBRL(a.discount)}`, right - 5, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 6;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL:", 130, y + 4, { align: "right" });
  doc.text(formatBRL(a.total), right - 5, y + 4, { align: "right" });
  y += 15;

  // Conditions & Notes
  doc.setFontSize(10);
  if (a.paymentConditions || a.notes) {
    doc.setDrawColor(200, 200, 200);
    doc.line(left, y, right, y);
    y += 10;
    
    if (a.paymentConditions) {
      doc.setFont("helvetica", "bold");
      doc.text("Condições de Pagamento:", left, y);
      doc.setFont("helvetica", "normal");
      const splitLines = doc.splitTextToSize(a.paymentConditions, contentWidth);
      doc.text(splitLines, left, y + 5);
      y += 10 + (splitLines.length * 5);
    }
    
    if (a.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Observações:", left, y);
      doc.setFont("helvetica", "normal");
      const splitLines = doc.splitTextToSize(a.notes, contentWidth);
      doc.text(splitLines, left, y + 5);
    }
  }

  const safeName = (a.customerName || "cliente").replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`orcamento_${safeName}_${a.quoteId.slice(0, 6)}.pdf`);
}
