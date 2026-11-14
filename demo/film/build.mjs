/**
 * Film (D194) derlemesi: demo/film/dist/index.html (yalnızca kayıt içindir; siteye konmaz).
 * Kullanım: node demo/film/build.mjs
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const demo = path.resolve(here, "..");
const root = path.resolve(demo, "..");
const out = path.join(here, "dist");
fs.mkdirSync(out, { recursive: true });
const flat = path.join(out, "_in.css");
fs.writeFileSync(flat, fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8") + "\n" + fs.readFileSync(path.join(demo, "styles.css"), "utf8").replace(/^@import.*$/m, ""));
execFileSync(path.join(root, "node_modules/.bin/tailwindcss"), ["-c", path.join(demo, "tailwind.config.cjs"), "-i", flat, "-o", path.join(out, "app.css"), "--minify"], { stdio: "inherit", cwd: root });
const shim = (p) => path.join(demo, "shims", p);
await build({
  entryPoints: [path.join(here, "entry.tsx")],
  bundle: true, minify: true, format: "iife", target: "es2020", outfile: path.join(out, "app.js"),
  jsx: "automatic", loader: { ".css": "empty" }, legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_SUPABASE_URL": '""', "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": '""' },
  alias: { "next/link": shim("link.tsx"), "next/navigation": shim("navigation.ts"), "@/lib/supabase/browser": shim("supabase-browser.ts"), "server-only": path.join(root, "tests/stubs/empty.ts") },
  tsconfig: path.join(root, "tsconfig.json"), logLevel: "warning",
});
const css = fs.readFileSync(path.join(out, "app.css"), "utf8");
const js = fs.readFileSync(path.join(out, "app.js"), "utf8").replace(/<\/script/gi, "<\\/script");
fs.writeFileSync(path.join(out, "index.html"), `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Academiana</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap">
<style>${css}
html,body{background:rgb(247 248 252);color:#151829;color-scheme:light}</style></head><body><div id="root"></div><script>${js}</script></body></html>`);
for (const f of ["_in.css", "app.css", "app.js"]) fs.rmSync(path.join(out, f));
console.log("demo/film/dist/index.html hazır");
