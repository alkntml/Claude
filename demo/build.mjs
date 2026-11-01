/**
 * Tarayıcı demosunu tek bir HTML dosyasına derler: demo/dist/index.html
 * Kullanım: npm run build:demo
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(here, "dist");
fs.mkdirSync(out, { recursive: true });

// 1) CSS: Tailwind (uygulamanın globals.css'i + demo yazı tipi değişkenleri)
const flat = path.join(out, "_in.css");
fs.writeFileSync(flat, fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8") + "\n" + fs.readFileSync(path.join(here, "styles.css"), "utf8").replace(/^@import.*$/m, ""));
execFileSync(path.join(root, "node_modules/.bin/tailwindcss"), ["-c", path.join(here, "tailwind.config.cjs"), "-i", flat, "-o", path.join(out, "app.css"), "--minify"], { stdio: "inherit", cwd: root });

// 2) JS: gerçek uygulama bileşenleri + Next.js uyumluluk katmanı
const shim = (p) => path.join(here, "shims", p);
await build({
  entryPoints: [path.join(here, "main.tsx")],
  bundle: true, minify: true, format: "iife", target: "es2020", outfile: path.join(out, "app.js"),
  jsx: "automatic", loader: { ".css": "empty" }, legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_SUPABASE_URL": '""', "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": '""' },
  alias: {
    "next/link": shim("link.tsx"),
    "next/navigation": shim("navigation.ts"),
    "@/lib/supabase/browser": shim("supabase-browser.ts"),
    "server-only": path.join(root, "tests/stubs/empty.ts"),
  },
  tsconfig: path.join(root, "tsconfig.json"),
  logLevel: "warning",
});

// 3) Tek dosya: Artifact iskeleti <html>/<head>/<body> etiketlerini kendisi ekler
const css = fs.readFileSync(path.join(out, "app.css"), "utf8");
const js = fs.readFileSync(path.join(out, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
const html = `<title>Akademi AI Demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap">
<style>${css}
html,body{background:rgb(247 248 252);color:#151829;color-scheme:light}
</style>
<div id="root"></div>
<script>${js}</script>
`;
fs.writeFileSync(path.join(out, "index.html"), html);
for (const f of ["_in.css", "app.css", "app.js"]) fs.rmSync(path.join(out, f));
console.log(`demo/dist/index.html: ${(html.length / 1024).toFixed(0)} KB`);
