import jsPDF from "jspdf";
import { formatBRL } from "@/lib/store";

type Item = { name: string; quantity: number; unitPrice: number };
type Args = {
  osId: string;
  date: Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  type: string;
  description?: string;
  status: string;
  items: Item[];
  serviceValue: number;
  total: number;
  businessName?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
};

export function generateOSPDF(a: Args) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  const left = 20;
  const right = 190;
  const contentWidth = right - left;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("ORDEM DE SERVIÇO", left, y);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`#${a.osId.slice(0, 8).toUpperCase()}`, left, y + 6);
  
  // Business Info
  doc.setTextColor(0, 0, 0);
  let by = 20;
  if (a.businessName) {
    doc.setFont("helvetica", "bold");
    doc.text(a.businessName, right, by, { align: "right" });
    doc.setFont("helvetica", "normal");
    by += 5;
  }
  if (a.businessPhone) { doc.text(a.businessPhone, right, by, { align: "right" }); by += 5; }
  if (a.businessEmail) { doc.text(a.businessEmail, right, by, { align: "right" }); by += 5; }
  if (a.businessAddress) { doc.text(a.businessAddress, right, by, { align: "right" }); by += 5; }

  y = Math.max(y + 15, by + 10);
  doc.setDrawColor(200, 200, 200);
  doc.line(left, y, right, y);
  y += 10;

  // OS Info
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
  doc.text("Data:", 140, dy);
  doc.setFont("helvetica", "normal");
  doc.text(a.date.toLocaleDateString("pt-BR"), 155, dy);
  dy += 5;
  
  doc.setFont("helvetica", "bold");
  doc.text("Status:", 140, dy);
  doc.setFont("helvetica", "normal");
  doc.text(a.status, 155, dy);
  y += 10;

  // OS Details
  doc.setFillColor(245, 245, 245);
  doc.rect(left, y, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Serviço / Problema", left + 2, y + 6);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text(a.type, left, y);
  y += 6;

  if (a.description) {
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(a.description, contentWidth);
    doc.text(descLines, left, y);
    y += descLines.length * 5;
  }
  y += 5;

  // Table Header
  if (a.items.length > 0) {
    doc.setFillColor(245, 245, 245);
    doc.rect(left, y, contentWidth, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Peças Utilizadas", left + 5, y + 7);
    doc.text("Qtd", 140, y + 7, { align: "center" });
    doc.text("V. Unit", 165, y + 7, { align: "right" });
    doc.text("Total", right - 5, y + 7, { align: "right" });
    y += 15;

    // Table Body
    doc.setFont("helvetica", "normal");
    for (const it of a.items) {
      const splitName = doc.splitTextToSize(it.name, 100);
      const itemHeight = splitName.length * 5;
      
      if (y + itemHeight > 270) { doc.addPage(); y = 20; }

      doc.text(splitName, left + 5, y);
      doc.text(it.quantity.toString(), 140, y, { align: "center" });
      doc.text(formatBRL(it.unitPrice), 165, y, { align: "right" });
      doc.text(formatBRL(it.unitPrice * it.quantity), right - 5, y, { align: "right" });
      
      y += Math.max(itemHeight, 8);
      doc.setDrawColor(240, 240, 240);
      doc.line(left, y - 3, right, y - 3);
    }
    y += 5;
  }

  // Totals
  if (y > 240) { doc.addPage(); y = 20; }
  
  const partsTotal = a.total - a.serviceValue;
  
  if (partsTotal > 0) {
    doc.setFontSize(11);
    doc.text("Peças:", 150, y);
    doc.text(formatBRL(partsTotal), right - 5, y, { align: "right" });
    y += 6;
  }
  
  doc.setFontSize(11);
  doc.text("Mão de Obra:", 150, y);
  doc.text(formatBRL(a.serviceValue), right - 5, y, { align: "right" });
  y += 8;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL:", 150, y + 2);
  doc.text(formatBRL(a.total), right - 5, y + 2, { align: "right" });

  const safeName = (a.customerName || "cliente").replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`os_${safeName}_${a.osId.slice(0, 6)}.pdf`);
}
