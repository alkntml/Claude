import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { route } from "@/lib/api";

export const runtime = "nodejs";

let fonts: Promise<[Buffer, Buffer]> | null = null;
const loadFonts = () => (fonts ??= Promise.all([
  readFile(path.join(process.cwd(), "assets/fonts/DejaVuSerif-Bold.ttf")),
  readFile(path.join(process.cwd(), "assets/fonts/DejaVuSerif.ttf")),
]));

/** Paylaşım görseli (1200×630): başlık + alt satır, marka renklerinde. Türkçe karakterler için DejaVu yazı tipi. */
export const GET = route("og.image", async (req) => {
  const u = new URL(req.url);
  const title = (u.searchParams.get("t") || "Academiana").slice(0, 120);
  const sub = (u.searchParams.get("s") || "academiana.com.tr").slice(0, 90);
  const en = u.searchParams.get("l") === "en";
  const [bold, regular] = await loadFonts();
  const size = title.length > 80 ? 52 : title.length > 50 ? 62 : 72;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(135deg, #f6f7fb 0%, #e9edff 55%, #dbeafe 100%)", fontFamily: "DejaVu Serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #4f63f0, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h11l3 3v12.5a.5.5 0 0 1-.5.5H6a2 2 0 0 1-2-2Z" /><path d="M8 9h7M8 13h8M8 17h5" /></svg>
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700, color: "#151829" }}>Academi<span style={{ color: "#2f4be0" }}>ana</span></div>
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.15, color: "#0b0d18", letterSpacing: -1 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#454d74" }}>
          <span style={{ fontWeight: 400 }}>{sub}</span>
          <span style={{ fontWeight: 700, color: "#2f4be0" }}>{en ? "academiana.com.tr/en" : "academiana.com.tr"}</span>
        </div>
      </div>
    ),
    {
      width: 1200, height: 630,
      fonts: [{ name: "DejaVu Serif", data: bold, weight: 700, style: "normal" }, { name: "DejaVu Serif", data: regular, weight: 400, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    },
  );
});
