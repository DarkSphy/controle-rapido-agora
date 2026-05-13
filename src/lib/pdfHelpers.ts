import jsPDF from "jspdf";

export async function loadLogoDataURL(url?: string | null): Promise<{ dataUrl: string; width: number; height: number; format: "PNG" | "JPEG" } | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = reject;
      img.src = dataUrl;
    });
    const isPng = dataUrl.startsWith("data:image/png");
    return { dataUrl, width: dims.w, height: dims.h, format: isPng ? "PNG" : "JPEG" };
  } catch {
    return null;
  }
}

export function drawLogo(doc: jsPDF, logo: Awaited<ReturnType<typeof loadLogoDataURL>>, x: number, y: number, maxW = 30, maxH = 18) {
  if (!logo) return 0;
  const ratio = logo.width / logo.height;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  doc.addImage(logo.dataUrl, logo.format, x, y, w, h);
  return h;
}
