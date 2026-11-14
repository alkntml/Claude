const fs = require("fs");
const { mk, chromium, D } = require("./drv.cjs");
const { scenes } = require("./scenes.cjs");
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1600, height: 900 } });
  if (process.env.MODE !== "record") await pg.addInitScript(() => { window.__FILM_SPEED__ = 5; });
  pg.on("pageerror", (e) => console.log("PAGEERR", e.message.slice(0, 300)));
  const start = process.env.START;
  if (start) {
    const snap = JSON.parse(fs.readFileSync(`${D}/state-${start}.json`, "utf8"));
    await pg.addInitScript((s) => { if (!sessionStorage.getItem("loaded")) { sessionStorage.setItem("loaded", "1"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } }, snap);
    await pg.goto("http://localhost:8790/index.html#panel");
    await pg.waitForTimeout(1200);
    await pg.getByText(/^Üniversite Öğrencilerinde Akıllı Telefon Bağımlılığı/).first().click();
  } else await pg.goto("http://localhost:8790/index.html?fresh");
  await pg.waitForTimeout(1500);
  const d = mk(pg); await d.f("mark", true); await d.f("move", 800, 450);
  let skipping = !!start;
  for (const [name, fn] of scenes) {
    if (skipping && name !== start) continue;
    skipping = false;
    // Her sahnenin başındaki durumu sakla (sonraki denemeler oradan başlayabilsin)
    const st = await pg.evaluate(() => Object.fromEntries(["akademi-ai-demo-v1", "academiana-film-csv"].map((k) => [k, localStorage.getItem(k) ?? ""])));
    fs.writeFileSync(`${D}/state-${name}.json`, JSON.stringify(st));
    try { await fn(pg, d); } catch (e) { console.log("FAIL", name, e.message.split("\n")[0]); await pg.screenshot({ path: `${D}/fail.png` }); await d.dump("FAIL"); break; }
    console.log("ok", name);
    if (process.env.UNTIL === name) break;
  }
  fs.writeFileSync(`${D}/db.json`, await pg.evaluate(() => localStorage.getItem("akademi-ai-demo-v1")));
  await b.close();
})();
