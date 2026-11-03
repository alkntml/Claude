"use client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { CheckCircle2, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import Link from "@/components/l-link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { createBrowser } from "@/lib/supabase/browser";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="relative w-full max-w-md animate-rise">
        <div className="mb-8 flex items-center justify-center gap-4"><Link href="/"><Logo variant="full" className="!h-14" /></Link><LanguageSwitch /></div>
        <div className="glass rounded-3xl p-8">{children}</div>
      </div>
    </div>
  );
}

/**
 * Şifremi unuttum (D74): e-posta adresine sıfırlama bağlantısı gönderilir. Hesabın var olup olmadığı
 * açık edilmez (her durumda aynı mesaj). Bağlantı /api/auth/callback üzerinden /sifre-yenile sayfasına döner.
 */
export function ForgotPasswordForm() {
  const { t } = useT();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(params.get("hata") ? t("Şifre yenileme bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.") : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await createBrowser().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent("/sifre-yenile")}` });
      // Çok sık deneme dışında hata gösterilmez (hesabın varlığı sızdırılmasın)
      if (error && /rate|limit|too many|security purposes/i.test(error.message)) throw new Error(t("Kısa sürede çok fazla istek yapıldı. Lütfen birkaç dakika sonra tekrar deneyin."));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Bir hata oluştu"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      {sent ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Mail className="h-6 w-6" /></div>
          <h1 className="text-xl font-semibold">{t("E-postanızı kontrol edin")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("{email} adresiyle kayıtlı bir hesap varsa, şifrenizi yenilemeniz için bir bağlantı gönderdik. Bağlantı kısa bir süre geçerlidir.", { email })}</p>
          <p className="mt-3 text-xs text-ink-400">{t("E-posta birkaç dakika içinde gelmezse gereksiz (spam) klasörünü kontrol edin. Google ile kayıt olduysanız şifreye gerek yoktur; giriş ekranında “Google ile devam et”i kullanın.")}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Button variant="secondary" onClick={() => setSent(false)}>{t("Farklı bir e-posta dene")}</Button>
            <Link href="/giris" className="text-sm font-medium text-brand-600">{t("Giriş ekranına dön")}</Link>
          </div>
        </div>
      ) : (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><KeyRound className="h-6 w-6" /></span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">{t("Şifrenizi mi unuttunuz?")}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{t("Hesabınızın e-posta adresini yazın; şifrenizi yenilemeniz için bir bağlantı gönderelim.")}</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div><label className="label" htmlFor="email">{t("E-posta")}</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus /></div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>{t("Yenileme bağlantısı gönder")}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-500">{t("Şifrenizi hatırladınız mı?")} <Link href="/giris" className="font-medium text-brand-600">{t("Giriş yapın")}</Link></p>
        </>
      )}
    </Shell>
  );
}

/** Yeni şifre belirleme: e-postadaki bağlantıyla açılan oturumda (veya giriş yapmış kullanıcıda) çalışır. */
export function ResetPasswordForm() {
  const { t } = useT();
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "nosession">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      createBrowser().auth.getUser().then(({ data }) => {
        if (data.user) { setEmail(data.user.email ?? ""); setReady("ok"); } else setReady("nosession");
      }).catch(() => setReady("nosession"));
    } catch { setReady("nosession"); }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError(t("Şifre en az 8 karakter olmalıdır.")); return; }
    if (password !== confirm) { setError(t("Şifreler birbiriyle aynı değil.")); return; }
    setLoading(true);
    try {
      const { error } = await createBrowser().auth.updateUser({ password });
      if (error) throw new Error(/different from the old|same/i.test(error.message) ? t("Yeni şifre eski şifrenizle aynı olamaz.") : /weak|short|characters/i.test(error.message) ? t("Bu şifre çok zayıf; daha uzun ve tahmini zor bir şifre seçin.") : error.message);
      setDone(true);
      setTimeout(() => { router.push("/panel"); router.refresh(); }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Bir hata oluştu"));
    } finally {
      setLoading(false);
    }
  }

  if (ready === "checking") return <Shell><p className="text-center text-sm text-ink-500">{t("Bağlantı kontrol ediliyor…")}</p></Shell>;
  if (ready === "nosession") return (
    <Shell>
      <h1 className="text-xl font-semibold text-ink-900">{t("Bağlantının süresi dolmuş")}</h1>
      <p className="mt-2 text-sm text-ink-500">{t("Şifre yenileme bağlantısı geçersiz, daha önce kullanılmış veya süresi dolmuş olabilir. Yeni bir bağlantı isteyin.")}</p>
      <Link href="/sifremi-unuttum" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink-900 text-sm font-medium text-white hover:bg-ink-800">{t("Yeni bağlantı iste")}</Link>
    </Shell>
  );
  return (
    <Shell>
      {done ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-3 text-xl font-semibold">{t("Şifreniz güncellendi")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("Çalışma alanınıza yönlendiriliyorsunuz…")}</p>
        </div>
      ) : (
        <>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><KeyRound className="h-6 w-6" /></span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">{t("Yeni şifre belirleyin")}</h1>
          {email && <p className="mt-1.5 text-sm text-ink-500">{t("Hesap: {email}", { email })}</p>}
          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="label" htmlFor="pw">{t("Yeni şifre")}</label>
              <div className="relative">
                <input id="pw" type={show ? "text" : "password"} className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" autoFocus />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label={t("Şifreyi göster")}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <p className="mt-1 text-xs text-ink-400">{t("En az 8 karakter. Harf, rakam ve işaret karışık olursa daha güvenli olur.")}</p>
            </div>
            <div><label className="label" htmlFor="pw2">{t("Yeni şifre (tekrar)")}</label><input id="pw2" type={show ? "text" : "password"} className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" /></div>
            {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading}>{t("Şifreyi kaydet")}</Button>
          </form>
        </>
      )}
    </Shell>
  );
}
