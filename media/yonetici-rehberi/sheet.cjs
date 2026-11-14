const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  pg.on("pageerror", (e) => console.log("ERR", e.message));
  await pg.goto("file://" + __dirname + "/admin.html?rec=1"); await pg.evaluate(() => document.fonts.ready);
  const T = await pg.evaluate(() => window.T);
  for (let i = 0; i < T.length; i++) { await pg.evaluate((t) => render(t), T[i][1] - 1.0); await pg.screenshot({ path: __dirname + `/e_${String(i).padStart(2, "0")}.png` }); }
  await b.close();
})();
