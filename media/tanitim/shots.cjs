const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: process.env.V ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  await pg.goto("file://" + __dirname + "/index.html?rec=1" + (process.env.V ? "&v=1" : "")); await pg.evaluate(() => document.fonts.ready);
  for (const t of process.argv.slice(2)) { await pg.evaluate((t) => render(t), Number(t)); await pg.screenshot({ path: __dirname + `/${process.env.V ? "v" : "k"}_${t}.png` }); }
  await b.close();
})();
