/* Tarayıcıda çalışır: SVG çizimini belgeye gömülecek PNG veri adresine çevirir. */

/** SVG → PNG veri adresi (2 kat çözünürlük; Word/PDF'te keskin görünür) */
export async function svgToPng(svg: string, w = 900, h = 560, scale = 2): Promise<string> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("svg")); img.src = url; });
    const c = document.createElement("canvas");
    c.width = w * scale; c.height = h * scale;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}
