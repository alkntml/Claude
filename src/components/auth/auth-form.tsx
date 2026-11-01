"use client";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { createBrowser } from "@/lib/supabase/browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/panel";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/panel";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get("hata") ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş." : null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createBrowser();
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalıdır.");
        if (!consent) throw new Error("Devam etmek için aydınlatma metnini onaylayın.");
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(safeNext)}` } });
        if (error) throw error;
        if (!data.session) { setSent(true); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
      }
      router.push(safeNext);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute left-1/2 top-0 h-96 w-[600px] -translate-x-1/2 rounded-full bg-brand-200/50 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center"><Link href="/"><Logo /></Link></div>
        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Mail className="h-6 w-6" /></div>
              <h1 className="text-xl font-semibold">E-postanızı kontrol edin</h1>
              <p className="mt-2 text-sm text-ink-500"><b>{email}</b> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra çalışma alanınız açılacak.</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{mode === "login" ? "Tekrar hoş geldiniz" : "Akademik çalışma alanınızı oluşturun"}</h1>
              <p className="mt-1.5 text-sm text-ink-500">{mode === "login" ? "Kaldığınız yerden devam edin." : "Ücretsiz başlayın, kredi kartı gerekmez."}</p>
              <form onSubmit={submit} className="mt-7 space-y-4">
                {mode === "signup" && (
                  <div><label className="label" htmlFor="name">Ad soyad</label><input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" /></div>
                )}
                <div><label className="label" htmlFor="email">E-posta</label><input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
                <div>
                  <label className="label" htmlFor="pw">Şifre</label>
                  <div className="relative">
                    <input id="pw" type={show ? "text" : "password"} className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 8 : undefined} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                    <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700" aria-label="Şifreyi göster">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </div>
                </div>
                {mode === "signup" && (
                  <label className="flex items-start gap-2.5 text-[13px] text-ink-600">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-600" />
                    <span><Link href="/gizlilik" className="text-brand-600 underline-offset-2 hover:underline" target="_blank">KVKK aydınlatma metnini</Link> ve <Link href="/kosullar" className="text-brand-600 underline-offset-2 hover:underline" target="_blank">kullanım koşullarını</Link> okudum, kabul ediyorum.</span>
                  </label>
                )}
                {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</motion.p>}
                <Button type="submit" size="lg" className="w-full" loading={loading}>{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</Button>
              </form>
              <p className="mt-6 text-center text-sm text-ink-500">
                {mode === "login" ? <>Hesabınız yok mu? <Link href={`/kayit?next=${encodeURIComponent(safeNext)}`} className="font-medium text-brand-600">Kayıt olun</Link></> : <>Zaten hesabınız var mı? <Link href={`/giris?next=${encodeURIComponent(safeNext)}`} className="font-medium text-brand-600">Giriş yapın</Link></>}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
