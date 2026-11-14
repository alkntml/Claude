const { chromium } = require("playwright");
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await pg.goto("file://" + __dirname + "/cover.html"); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  await pg.screenshot({ path: __dirname + "/cover.png" }); await b.close(); })();
