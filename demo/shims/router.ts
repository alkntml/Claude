import { useSyncExternalStore } from "react";

/** Demo için minimal yönlendirici: yol + sorgu bellekte, yalnızca görünüm adı URL hash'inde tutulur. */
export interface Route { path: string; query: URLSearchParams }

const HASH_TO_PATH: Record<string, string> = {
  panel: "/panel", yeni: "/yeni", calisma: "/proje/__current__", kalite: "/proje/__current__/kalite",
  kaynaklar: "/kaynaklar", dosyalar: "/dosyalar", hesap: "/hesap", yonetim: "/yonetim", fiyatlar: "/fiyatlar",
};

let currentProject = "";
export function setCurrentProject(id: string) { currentProject = id; }
export function getCurrentProject() { return currentProject; }

function hashFor(path: string): string {
  if (path.startsWith("/proje/")) return path.endsWith("/kalite") ? "kalite" : "calisma";
  const name = path.replace(/^\//, "").split("/")[0];
  return name in HASH_TO_PATH ? name : "";
}

function parse(href: string): Route {
  const u = new URL(href, "https://demo.local");
  let path = u.pathname;
  // Demo kullanıcısı her zaman oturum açmış sayılır
  if (path === "/giris" || path === "/kayit") path = "/panel";
  if (path.startsWith("/proje/")) { const id = path.split("/")[2]; if (id && id !== "__current__") currentProject = id; }
  return { path: path.replace("__current__", currentProject), query: u.searchParams };
}

function initial(): Route {
  let h = "";
  try { h = window.location.hash.replace("#", ""); } catch { /* yok */ }
  return parse(HASH_TO_PATH[h] ?? "/");
}

let route: Route = typeof window === "undefined" ? { path: "/", query: new URLSearchParams() } : initial();
const listeners = new Set<() => void>();

export function navigate(href: string, replace = false) {
  if (/^https?:\/\//.test(href)) { window.open(href, "_blank", "noopener"); return; }
  const [base, anchor] = href.split("#");
  const next = parse(base || route.path);
  const samePage = next.path === route.path;
  route = next;
  const h = hashFor(route.path);
  try {
    const target = h ? `#${h}` : " ";
    if (replace) history.replaceState(null, "", h ? `#${h}` : window.location.pathname);
    else if (window.location.hash !== target) history.pushState(null, "", h ? `#${h}` : window.location.pathname);
  } catch { /* geçmiş API'si engellenmiş olabilir */ }
  listeners.forEach((l) => l());
  setTimeout(() => {
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
    else if (!samePage) window.scrollTo({ top: 0 });
  }, 50);
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => { route = initial(); listeners.forEach((l) => l()); });
}

export function useRoute(): Route {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => route, () => route);
}
