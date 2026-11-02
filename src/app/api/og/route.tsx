import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { route } from "@/lib/api";

export const runtime = "nodejs";

let assets: Promise<[Buffer, Buffer, string]> | null = null;
const loadAssets = () => (assets ??= Promise.all([
  readFile(path.join(process.cwd(), "assets/fonts/DejaVuSerif-Bold.ttf")),
  readFile(path.join(process.cwd(), "assets/fonts/DejaVuSerif.ttf")),
  readFile(path.join(process.cwd(), "public/brand/academiana-logo-transparent.png")).then((b) => `data:image/png;base64,${b.toString("base64")}`),
]));

/** Paylaşım görseli (1200×630): başlık + alt satır, marka renklerinde. Türkçe karakterler için DejaVu yazı tipi. */
export const GET = route("og.image", async (req) => {
  const u = new URL(req.url);
  const title = (u.searchParams.get("t") || "Academiana").slice(0, 120);
  const sub = (u.searchParams.get("s") || "academiana.com.tr").slice(0, 90);
  const en = u.searchParams.get("l") === "en";
  const [bold, regular, logo] = await loadAssets();
  const size = title.length > 80 ? 52 : title.length > 50 ? 62 : 72;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "linear-gradient(135deg, #ffffff 0%, #f7f4ec 60%, #efe7d3 100%)", borderBottom: "14px solid #0f1d3d", fontFamily: "DejaVu Serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={470} height={120} alt="" />
          <div style={{ display: "flex", width: 120, height: 6, background: "#c39a45", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.15, color: "#0f1d3d", letterSpacing: -1 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#454d74" }}>
          <span style={{ fontWeight: 400 }}>{sub}</span>
          <span style={{ fontWeight: 700, color: "#a87f2e" }}>{en ? "academiana.com.tr/en" : "academiana.com.tr"}</span>
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
