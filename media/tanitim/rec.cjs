const { chromium } = require("playwright");
const FPS = 30, DUR = 80, N = FPS * DUR, W = 4;
(async () => {
  const b = await chromium.launch();
  await Promise.all([...Array(W)].map(async (_, w) => {
    const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await pg.goto("file://" + __dirname + "/index.html?rec=1"); await pg.evaluate(() => document.fonts.ready);
    for (let f = w; f < N; f += W) {
      await pg.evaluate((t) => render(t), f / FPS);
      await pg.screenshot({ path: `${__dirname}/frames/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 93 });
    }
  }));
  await b.close();
})();
