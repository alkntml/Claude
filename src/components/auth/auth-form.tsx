"use client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail } from "lucide-react";
import Link from "@/components/l-link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { createBrowser } from "@/lib/supabase/browser";

type OAuthProvider = "google" | "apple";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true" fill="currentColor">
      <path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79a4.43 4.43 0 0 0-3.75 2.27c-1.6 2.77-.41 6.87 1.15 9.12.76 1.1 1.67 2.33 2.86 2.29 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.77-2.22.87-1.27 1.23-2.5 1.25-2.57-.03-.01-2.39-.92-2.41-3.65zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z" />
    </svg>
  );
}

export function AuthForm({ mode, providers = [] }: { mode: "login" | "signup"; providers?: OAuthProvider[] }) {
  const { t } = useT();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/panel";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";
  // Davet kodu: bağlantıdan gelir, oturum boyunca saklanır (kayıt formuna geçişte kaybolmasın)
  const [ref] = useState(() => {
    const fromUrl = (params.get("ref") ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 16).toUpperCase();
    try { if (fromUrl) sessionStorage.setItem("akademi:ref", fromUrl); return fromUrl || sessionStorage.getItem("akademi:ref") || ""; } catch { return fromUrl; }
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get("hata") ? t("Doğrulama bağlantısı geçersiz veya süresi dolmuş.") : null);
  const [sent, setSent] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<OAuthProvider | null>(null);

  async function oauth(provider: OAuthProvider) {
    setError(null);
    if (mode === "signup" && !consent) { setError(t("Devam etmek için aydınlatma metnini onaylayın.")); return; }
    setOauthBusy(provider);
    const q = new URLSearchParams({ next: safeNext, ...(ref ? { ref } : {}) });
    const { error } = await createBrowser().auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/api/auth/callback?${q}` } });
    // Başarılıysa tarayıcı sağlayıcının sayfasına yönlenir; hata olursa burada kalırız
    if (error) { setError(t("{p} ile giriş şu anda kullanılamıyor. E-posta ile devam edebilirsiniz.", { p: provider === "google" ? "Google" : "Apple" })); setOauthBusy(null); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowser();
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error(t("Şifre en az 8 karakter olmalıdır."));
        if (!consent) throw new Error(t("Devam etmek için aydınlatma metnini onaylayın."));
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, ...(ref ? { ref } : {}) }, emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}` } });
        if (error) throw error;
        if (!data.session) { setSent(true); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? t("E-posta veya şifre hatalı.") : error.message);
      }
      router.push(safeNext);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Bir hata oluştu"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-4"><Link href="/"><Logo variant="full" className="!h-14" /></Link><LanguageSwitch /></div>
        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Mail className="h-6 w-6" /></div>
              <h1 className="text-xl font-semibold">{t("E-postanızı kontrol edin")}</h1>
              <p className="mt-2 text-sm text-ink-500">{t("{email} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra çalışma alanınız açılacak.", { email })}</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{mode === "login" ? t("Tekrar hoş geldiniz") : t("Akademik çalışma alanınızı oluşturun")}</h1>
              <p className="mt-1.5 text-sm text-ink-500">{mode === "login" ? t("Kaldığınız yerden devam edin.") : t("Ücretsiz başlayın, kredi kartı gerekmez.")}</p>
              {mode === "signup" && ref && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] text-emerald-800">{t("Davetle geldiniz: e-postanızı doğruladığınızda size ve sizi davet edene ek yapay zekâ isteği ve kaynak tarama hakkı tanımlanır.")}</p>}
              {mode === "signup" && <p className="mt-2 text-[12.5px] text-ink-500">{t("Üniversite e-postanızla (.edu.tr) kayıt olursanız ücretli paketlerde öğrenci indirimi uygulanır.")}</p>}
              {providers.length > 0 && (
                <div className="mt-7 space-y-2.5">
                  {providers.includes("google") && (
                    <button type="button" onClick={() => oauth("google")} disabled={!!oauthBusy} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-ink-200 bg-white text-[15px] font-medium text-ink-800 transition hover:bg-ink-50 disabled:opacity-60">
                      <GoogleIcon /> {oauthBusy === "google" ? t("Yönlendiriliyor…") : t("Google ile devam et")}
                    </button>
                  )}
                  {providers.includes("apple") && (
                    <button type="button" onClick={() => oauth("apple")} disabled={!!oauthBusy} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-black text-[15px] font-medium text-white transition hover:bg-ink-900 disabled:opacity-60">
                      <AppleIcon /> {oauthBusy === "apple" ? t("Yönlendiriliyor…") : t("Apple ile devam et")}
                    </button>
                  )}
                  {mode === "login" && <p className="text-center text-[12px] leading-snug text-ink-400">{t("Google veya Apple ile ilk kez girişte hesabınız oluşturulur ve KVKK aydınlatma metni ile kullanım koşullarını kabul etmiş olursunuz.")}</p>}
                  {mode === "signup" && <p className="text-center text-[12px] text-ink-400">{t("Önce aşağıdaki onay kutusunu işaretleyin.")}</p>}
                  <div className="flex items-center gap-3 pt-2 text-xs text-ink-400"><span className="h-px flex-1 bg-ink-100" />{t("veya e-posta ile")}<span className="h-px flex-1 bg-ink-100" /></div>
                </div>
              )}
              <form onSubmit={submit} className={providers.length ? "mt-4 space-y-4" : "mt-7 space-y-4"}>
                {mode === "signup" && (
                  <div><label className="label" htmlFor="name">{t("Ad soyad")}</label><input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></div>
                )}
                <div><label className="label" htmlFor="email">{t("E-posta")}</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                <div>
                  <label className="label" htmlFor="pw">{t("Şifre")}</label>
                  <div className="relative">
                    <input id="pw" type={show ? "text" : "password"} className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                    <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={t("Şifreyi göster")}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                {mode === "signup" && (
                  <label className="flex items-start gap-2.5 text-[13px] text-ink-600">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600" />
                    <span><Link href="/gizlilik" className="text-brand-600 underline-offset-2 hover:underline" target="_blank">{t("KVKK aydınlatma metnini")}</Link> {t("ve")} <Link href="/kosullar" className="text-brand-600 underline-offset-2 hover:underline" target="_blank">{t("kullanım koşullarını")}</Link> {t("okudum, kabul ediyorum.")}</span>
                  </label>
                )}
                {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</motion.p>}
                <Button type="submit" size="lg" className="w-full" loading={loading}>{mode === "login" ? t("Giriş yap") : t("Hesap oluştur")}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-ink-500">
                {mode === "login" ? <>{t("Hesabınız yok mu?")} <Link href={`/kayit?next=${encodeURIComponent(safeNext)}`} className="font-medium text-brand-600">{t("Kayıt olun")}</Link></> : <>{t("Zaten hesabınız var mı?")} <Link href={`/giris?next=${encodeURIComponent(safeNext)}`} className="font-medium text-brand-600">{t("Giriş yapın")}</Link></>}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
