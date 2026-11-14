const { chromium } = require("playwright");
const fs = require("fs");
// D184: seslendirmeye göre zaman eşleme — plan.json varsa film zamanı (tau) sahne zamanına (S) parça parça doğrusal eşlenir
const plan = fs.existsSync(__dirname + "/plan.json") ? JSON.parse(fs.readFileSync(__dirname + "/plan.json", "utf8")) : null;
const FPS = 30, DUR = plan ? plan.total : 80, N = Math.round(FPS * DUR), W = 4;
function warp(x) {
  if (!plan) return x;
  const { tau, S } = plan;
  for (let i = 0; i < tau.length - 1; i++) if (x <= tau[i + 1]) return S[i] + ((x - tau[i]) / (tau[i + 1] - tau[i])) * (S[i + 1] - S[i]);
  return S[S.length - 1];
}
(async () => {
  const b = await chromium.launch();
  await Promise.all([...Array(W)].map(async (_, w) => {
    const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    await pg.goto("file://" + __dirname + "/index.html?rec=1"); await pg.evaluate(() => document.fonts.ready);
    for (let f = w; f < N; f += W) {
      await pg.evaluate((t) => render(t), Math.min(79.999, warp(f / FPS)));
      await pg.screenshot({ path: `${__dirname}/frames/f${String(f).padStart(5, "0")}.jpg`, type: "jpeg", quality: 93 });
    }
  }));
  await b.close();
})();
