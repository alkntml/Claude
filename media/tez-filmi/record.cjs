// Kayıt: CDP ekran akışı (JPEG) → ffmpeg (sabit 30 fps, 1920×1080). Sahneler scenes.cjs ile aynı.
const fs = require("fs");
const { spawn } = require("child_process");
const { mk, chromium, D } = require("./drv.cjs");
const { scenes } = require("./scenes.cjs");
const FPS = 30;
(async () => {
  const b = await chromium.launch({ args: ["--force-color-profile=srgb", "--font-render-hinting=none"] });
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.2, acceptDownloads: true });
  const pg = await ctx.newPage();
  const pages = fs.readdirSync(`${D}/www/pages`).filter((f) => f.endsWith(".jpg")).length;
  await pg.addInitScript((n) => { window.__FILM_PAGES__ = n; }, pages);
  pg.on("pageerror", (e) => console.log("PAGEERR", e.message.slice(0, 300)));
  await pg.goto("http://localhost:8790/index.html?fresh");
  await pg.waitForTimeout(2500);
  const d = mk(pg); await d.f("mark", true); await d.f("move", 800, 450);
  await d.f("card", "Academiana · canlı kayıt", "Bir nicel tez, baştan sona", "");
  await pg.waitForTimeout(800);

  const out = process.env.OUT || `${D}/film.mp4`;
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-vf", "scale=1920:1080:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "stillimage", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const cdp = await ctx.newCDPSession(pg);
  let last = null, written = 0, t0 = 0;
  const pump = () => { if (!last) return; const need = Math.floor(((Date.now() - t0) / 1000) * FPS); while (written < need) { ff.stdin.write(last); written++; } };
  cdp.on("Page.screencastFrame", async (f) => { last = Buffer.from(f.data, "base64"); if (!t0) t0 = Date.now(); pump(); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  const timer = setInterval(pump, 1000 / FPS);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  await pg.waitForTimeout(500);
  const marks = [];
  for (const [name, fn] of scenes) {
    marks.push([name, (Date.now() - t0) / 1000]);
    try { await fn(pg, d); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); await pg.screenshot({ path: `${D}/rec-fail.png` }); break; }
    console.log("ok", name, ((Date.now() - t0) / 1000).toFixed(1));
  }
  await pg.waitForTimeout(500);
  clearInterval(timer); pump();
  await cdp.send("Page.stopScreencast").catch(() => {});
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  fs.writeFileSync(`${D}/marks.json`, JSON.stringify(marks));
  console.log("duration", (written / FPS).toFixed(1));
  await b.close();
})();
