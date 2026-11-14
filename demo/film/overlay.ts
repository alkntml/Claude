/**
 * Film (D194): ekran üstü katman — imleç, adım yazısı, kalıcı “kurgusal” notu ve dışa aktarılan PDF’in sayfaları.
 * Uygulamanın arayüzüne dokunmaz; yalnızca kayıt için üstte çizilir.
 */
const css = `
#film-cursor{position:fixed;left:0;top:0;width:22px;height:22px;z-index:2147483647;pointer-events:none;transition:transform .55s cubic-bezier(.3,.8,.3,1);will-change:transform}
#film-cursor svg{filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
#film-cursor.click::after{content:"";position:absolute;left:-14px;top:-14px;width:28px;height:28px;border-radius:50%;background:rgba(79,70,229,.35);animation:fr .45s ease-out forwards}
@keyframes fr{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}
#film-cap{position:fixed;left:44%;bottom:22px;transform:translate(-50%,14px);opacity:0;z-index:2147483646;pointer-events:none;transition:all .45s ease;max-width:min(720px,80vw);
  background:rgba(17,20,40,.9);color:#fff;border-radius:16px;padding:10px 20px;font:500 19px/1.35 Inter,system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.3);display:flex;gap:14px;align-items:center}
#film-cap.on{opacity:1;transform:translate(-50%,0)}
#film-cap.high{bottom:auto;top:64px}
#film-cap b{font-weight:700;color:#a5b4fc;white-space:nowrap}
#film-mark{position:fixed;left:12px;bottom:8px;z-index:2147483645;pointer-events:none;background:rgba(255,251,235,.94);color:#92400e;border:1px solid #fcd34d;border-radius:999px;padding:3px 10px;font:600 11.5px Inter,system-ui,sans-serif}
#film-card{position:fixed;inset:0;z-index:2147483640;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:linear-gradient(135deg,#1e1b4b,#312e81 55%,#4338ca);color:#fff;opacity:0;pointer-events:none;transition:opacity .7s ease;text-align:center;padding:40px}
#film-card.on{opacity:1}
#film-card .k{font:600 15px Inter,system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#a5b4fc}
#film-card .t{font:500 64px/1.1 Fraunces,Georgia,serif;max-width:1200px}
#film-card .s{font:400 24px/1.45 Inter,system-ui,sans-serif;color:#c7d2fe;max-width:1000px}
#film-pdf{position:fixed;inset:0;z-index:2147483600;background:rgba(30,32,44,.96);display:none;flex-direction:column}
#film-pdf .bar{height:52px;display:flex;align-items:center;gap:12px;padding:0 22px;color:#e5e7eb;font:500 15px Inter,system-ui,sans-serif;background:#111318;border-bottom:1px solid #2a2d38}
#film-pdf .bar span{opacity:.6}
#film-pdf .pages{flex:1;overflow-y:auto;padding:28px 0;display:flex;flex-direction:column;align-items:center;gap:22px}
#film-pdf img{width:min(820px,80vw);box-shadow:0 8px 30px rgba(0,0,0,.5);background:#fff}
`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
function el<T extends HTMLElement>(id: string, tag = "div"): T { let e = document.getElementById(id) as T | null; if (!e) { e = document.createElement(tag) as T; e.id = id; document.body.appendChild(e); } return e; }

type FilmWindow = Window & { __film?: Record<string, unknown>; __FILM_PAGES__?: number };
const W = window as FilmWindow;
let cx = 640, cy = 400;
/** Adım yazısı imlecin olduğu yeri kapatmasın: imleç alttaysa yazı üste çıkar */
function dodge() { const c = document.getElementById("film-cap"); if (!c) return; if (cy > innerHeight - 190) c.classList.add("high"); else if (cy < innerHeight - 330) c.classList.remove("high"); }
W.__film = {
  move(x: number, y: number) { const c = el("film-cursor"); if (!c.innerHTML) c.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 2l15 11-6.5 1.2L16.8 21l-3 1.4-3.6-6.6L5 20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`; cx = x; cy = y; dodge(); c.style.transform = `translate(${x - 3}px,${y - 2}px)`; },
  click() { const c = el("film-cursor"); c.classList.remove("click"); void c.offsetWidth; c.classList.add("click"); },
  pos() { return [cx, cy]; },
  caption(step: string, text: string) { const c = el("film-cap"); if (!text) { c.classList.remove("on"); return; } c.innerHTML = `${step ? `<b>${step}</b>` : ""}<span>${text}</span>`; dodge(); c.classList.add("on"); },
  mark(on: boolean) { const m = el("film-mark"); m.textContent = "Örnek çalışma · kaynaklar ve veriler kurgusaldır"; m.style.display = on ? "block" : "none"; },
  card(kicker: string, title: string, sub: string) { const c = el("film-card"); if (!title) { c.classList.remove("on"); return; } c.innerHTML = `<div class="k">${kicker}</div><div class="t">${title}</div><div class="s">${sub}</div>`; void c.offsetWidth; c.classList.add("on"); },
  scrollPdf(dy: number) { const p = document.querySelector("#film-pdf .pages"); p?.scrollBy({ top: dy, behavior: "smooth" }); },
  closePdf() { el("film-pdf").style.display = "none"; },
};
window.addEventListener("film-export", () => {
  const n = W.__FILM_PAGES__ ?? 0;
  if (!n) return;
  const box = el("film-pdf");
  box.innerHTML = `<div class="bar">📄 tez.pdf <span>· ${n} sayfa · Academiana’dan indirildi</span></div><div class="pages">${Array.from({ length: n }, (_, i) => `<img src="pages/p-${String(i + 1).padStart(2, "0")}.jpg" alt="">`).join("")}</div>`;
  setTimeout(() => { box.style.display = "flex"; }, 900);
});
export {};
