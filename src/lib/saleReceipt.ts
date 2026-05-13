import jsPDF from "jspdf";
import { formatBRL } from "@/lib/store";
import { loadLogoDataURL, drawLogo } from "@/lib/pdfHelpers";

type Item = { name: string; quantity: number; unitPrice: number };
type Args = {
  saleId: string;
  date: Date;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: string;
  items: Item[];
  total: number;
  businessName?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  businessLogoUrl?: string | null;
};

export async function generateSaleReceiptPDF(a: Args) {
  const doc = new jsPDF({ unit: "mm", format: [80, 250] });
  let y = 6;
  const left = 4;
  const right = 76;
  const center = 40;

  const logo = await loadLogoDataURL(a.businessLogoUrl);
  if (logo) {
    const ratio = logo.width / logo.height;
    let w = 30;
    let h = w / ratio;
    if (h > 18) { h = 18; w = h * ratio; }
    doc.addImage(logo.dataUrl, logo.format, center - w / 2, y, w, h);
    y += h + 2;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(a.businessName || "Comprovante", center, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  if (a.businessPhone) { doc.text(a.businessPhone, center, y, { align: "center" }); y += 3.2; }
  if (a.businessEmail) { doc.text(a.businessEmail, center, y, { align: "center" }); y += 3.2; }
  if (a.businessAddress) {
    const lines = doc.splitTextToSize(a.businessAddress, 70);
    for (const ln of lines) { doc.text(ln, center, y, { align: "center" }); y += 3.2; }
  }

  doc.setFontSize(8);
  doc.text("Comprovante de Venda", center, y, { align: "center" }); y += 3.5;
  doc.text(a.date.toLocaleString("pt-BR"), center, y, { align: "center" }); y += 3;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(left, y, right, y); y += 4;

  doc.text(`Pedido: ${a.saleId.slice(0, 8).toUpperCase()}`, left, y); y += 4;
  if (a.customerName) { doc.text(`Cliente: ${a.customerName}`, left, y); y += 4; }
  if (a.customerPhone) { doc.text(`Tel: ${a.customerPhone}`, left, y); y += 4; }
  if (a.customerEmail) { doc.text(`Email: ${a.customerEmail}`, left, y); y += 4; }
  if (a.paymentMethod) { doc.text(`Pagamento: ${a.paymentMethod}`, left, y); y += 4; }

  doc.line(left, y, right, y); y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Itens", left, y); y += 4;
  doc.setFont("helvetica", "normal");

  for (const it of a.items) {
    const lineName = doc.splitTextToSize(it.name, 70);
    for (const ln of lineName) { doc.text(ln, left, y); y += 3.5; }
    const sub = it.quantity * it.unitPrice;
    doc.text(`${it.quantity} x ${formatBRL(it.unitPrice)}`, left, y);
    doc.text(formatBRL(sub), right, y, { align: "right" });
    y += 4.5;
  }

  doc.line(left, y, right, y); y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL", left, y);
  doc.text(formatBRL(a.total), right, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Obrigado pela preferencia!", center, y, { align: "center" });

  const safeName = (a.customerName || "cliente").replace(/[^a-zA-Z0-9]+/g, "_");
  doc.save(`venda_${safeName}_${a.saleId.slice(0, 6)}.pdf`);
}
