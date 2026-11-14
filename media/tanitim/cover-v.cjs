const { chromium } = require("playwright");
(async () => { const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.goto("file://" + __dirname + "/cover-v.html"); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  await pg.screenshot({ path: __dirname + "/cover-v.png" }); await b.close(); })();
