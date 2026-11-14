/** Film (D194): uygulama yüklenmeden önce çalışır — film bayrağı, Türkçe arayüz, ?fresh ile boş başlangıç. */
const W = window as unknown as { __FILM__?: boolean };
W.__FILM__ = true;
try {
  document.cookie = "lang=tr; path=/";
  localStorage.setItem("academiana-theme", "light");
  localStorage.setItem("academiana-gift-seen", "1");
  localStorage.setItem("academiana-gift-peek", "1");
  localStorage.setItem("akademi:install-dismissed", "1");
  localStorage.setItem("akademi:tour:v1", "1");
  if (/[?&]fresh\b/.test(location.search)) {
    localStorage.setItem("akademi-ai-demo-v1", JSON.stringify({ projects: [], stages: [], sources: [], memory: [], comments: [], revisions: [], reports: [], feedback: [], files: [] }));
    localStorage.removeItem("academiana-film-csv");
    history.replaceState(null, "", location.pathname + "#panel");
  }
} catch { /* depolama kapalı */ }
export {};
