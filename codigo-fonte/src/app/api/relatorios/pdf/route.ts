import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { titulo, filtros, dados } = body;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 800;

  function draw(text: string, size = 12, bold = false) {
    page.drawText(text, {
      x: 40,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= size + 6;
  }

  // ─── TÍTULO ─────────────────────
  draw(titulo, 18);
  y -= 10;

  // ─── FILTROS ────────────────────
  draw("Filtros:", 14);
  Object.entries(filtros).forEach(([k, v]) => {
    draw(`${k}: ${v}`);
  });

  y -= 10;

  // ─── DADOS ──────────────────────
  draw("Resultados:", 14);

  dados.forEach((item: any) => {
    Object.entries(item).forEach(([k, v]) => {
      draw(`${k}: ${v}`);
    });
    y -= 6;
  });

  const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=relatorio.pdf",
        },
    });
}