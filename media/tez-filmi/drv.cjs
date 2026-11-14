// Film sürücüsü: görünür imleç, yazma, adım yazıları. MODE=explore (hızlı + ekran görüntüsü) | record
const { chromium } = require("playwright");
const D = __dirname;
const EXPLORE = process.env.MODE !== "record";
function mk(pg) {
  const S = Number(process.env.SPEED || (EXPLORE ? 6 : 1));
  const w = (ms) => pg.waitForTimeout(Math.max(30, ms / S));
  const f = (name, ...a) => pg.evaluate(([n, a]) => window.__film[n](...a), [name, a]);
  async function move(loc, opts = {}) {
    loc = loc.filter({ visible: true }).first();
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const bb = await loc.boundingBox();
    if (!bb) throw new Error("no box");
    const x = bb.x + (opts.dx ?? bb.width / 2), y = bb.y + (opts.dy ?? Math.min(bb.height / 2, 18));
    await f("move", x, y); await w(opts.wait ?? 650);
    return [x, y];
  }
  async function click(loc, opts = {}) {
    loc = loc.filter({ visible: true }).first();
    await loc.waitFor({ state: "visible", timeout: opts.timeout ?? 15000 });
    await move(loc, opts); await f("click");
    await loc.click({ timeout: 5000, ...(opts.force ? { force: true } : {}) }); await w(opts.after ?? 450);
  }
  async function type(loc, text, opts = {}) {
    await click(loc, opts);
    if (opts.clear) { await pg.keyboard.press("Control+A"); await pg.keyboard.press("Backspace"); }
    const d = opts.delay ?? 38;
    if (EXPLORE || opts.fill) await loc.first().fill(opts.clear ? text : (await loc.first().inputValue().catch(() => "")) + text);
    else await pg.keyboard.type(text, { delay: d });
    await w(400);
  }
  const cap = (step, text) => f("caption", step, text);
  let shot = 0;
  async function snap(name) { if (EXPLORE) await pg.screenshot({ path: `${D}/s-${String(++shot).padStart(2, "0")}-${name}.png` }); }
  const btn = (name, exact = false) => pg.getByRole("button", { name, exact });
  const txt = (t, exact = false) => pg.getByText(t, { exact });
  async function dump(tag='') { console.log('==== DUMP', tag); console.log(await pg.evaluate(() => [...document.querySelectorAll('label,button,a,input,select,textarea,h1,h2,h3,h4,[role=dialog] p')].filter(e=>e.offsetParent && e.getBoundingClientRect().width>0).map((e) => `${e.tagName}:${(e.innerText || e.placeholder || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 70)}`).filter((x,i,a)=>a.indexOf(x)===i).join('\n'))); }
  return { dump, w, f, move, click, type, cap, snap, btn, txt, S, EXPLORE };
}
module.exports = { mk, chromium, D, EXPLORE };
