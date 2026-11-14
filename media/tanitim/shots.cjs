const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await pg.goto("file://" + __dirname + "/index.html?rec=1"); await pg.evaluate(() => document.fonts.ready);
  for (const t of process.argv.slice(2)) { await pg.evaluate((t) => render(t), Number(t)); await pg.screenshot({ path: __dirname + `/k_${t}.png` }); }
  await b.close();
})();
