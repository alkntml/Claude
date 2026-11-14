const { chromium } = require("playwright");
const FPS = 30, W = 6;
(async () => {
  const b = await chromium.launch();
  const probe = await b.newPage(); await probe.goto("file://" + __dirname + "/admin.html?rec=1");
  const DUR = await probe.evaluate(() => window.DURATION); await probe.close();
  const N = Math.round(DUR * FPS);
  await Promise.all([...Array(W)].map(async (_, w) => {
    const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await pg.goto("file://" + __dirname + "/admin.html?rec=1"); await pg.evaluate(() => document.fonts.ready);
    for (let f = w; f < N; f += W) {
      await pg.evaluate((t) => render(t), f / FPS);
      await pg.screenshot({ path: `${__dirname}/frames/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 92 });
    }
  }));
  await b.close();
})();
