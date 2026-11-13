"use client";
import { useT } from "@/i18n/client";
import { Download, FileText, Link2, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "@/components/l-link";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { LEGAL_DOCS } from "@/lib/legal/docs";

interface ShareRow { id: string; projectId: string; projectTitle: string; label: string; expiresAt: string | null; createdAt: string; active: boolean; revoked: boolean; expired: boolean }
interface AcceptRow { doc: string; version: string; kind: "accept" | "notice"; source: string; accepted_at: string }

/**
 * Hesap → Gizlilik ve Veri Yönetimi (D154): verileri JSON indirme, KVKK veri talebi, danışman paylaşım bağlantılarını
 * görme/iptal etme, kabul edilen hukuki belge sürümleri ve hesabı silme.
 */
export function PrivacySection() {
  const { t, dl, locale } = useT();
  const toast = useToast();
  const [shares, setShares] = useState<ShareRow[] | null>(null);
  const [accepts, setAccepts] = useState<AcceptRow[] | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<{ removedFiles: number } | null>(null);

  useEffect(() => {
    api<{ shares: ShareRow[] }>("/api/account/shares").then((r) => setShares(r.shares), () => setShares([]));
    api<{ acceptances: AcceptRow[] }>("/api/legal/accept").then((r) => setAccepts(r.acceptances), () => setAccepts([]));
  }, []);

  async function revoke(sh: ShareRow) {
    try {
      await api(`/api/projects/${sh.projectId}/shares`, { method: "DELETE", json: { shareId: sh.id } });
      setShares((list) => (list ?? []).map((x) => (x.id === sh.id ? { ...x, active: false, revoked: true } : x)));
      toast({ tone: "success", title: t("Paylaşım bağlantısı iptal edildi"), detail: t("Bu bağlantı artık açılmaz.") });
    } catch (e) { toast({ tone: "error", title: t("İptal edilemedi"), detail: (e as Error).message }); }
  }
  async function request() {
    try {
      await api("/api/account/data-request", { method: "POST" });
      toast({ tone: "success", title: t("Veri talebiniz alındı"), detail: t("KVKK kapsamındaki talebiniz yasal süre (30 gün) içinde ücretsiz olarak e-posta adresinize iletilecektir.") });
    } catch (e) { toast({ tone: "error", title: t("Talep oluşturulamadı"), detail: (e as Error).message }); }
  }
  async function deleteAccount() {
    setDeleting(true);
    try {
      const r = await api<{ removedFiles: number }>("/api/account", { method: "DELETE", json: { confirm } });
      setDeleted({ removedFiles: r.removedFiles ?? 0 });
    } catch (e) { toast({ tone: "error", title: t("Hesap silinemedi"), detail: (e as Error).message }); } finally { setDeleting(false); }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString(dl, { day: "numeric", month: "short", year: "numeric" });
  const docTitle = (id: string) => LEGAL_DOCS.find((d) => d.id === id)?.title[locale] ?? id;
  const sourceLabel = (s: string) => ({ email: t("E-posta ile kayıt"), google: "Google", apple: "Apple", consent_page: t("Onay sayfası"), purchase: t("Satın alma öncesi") } as Record<string, string>)[s] ?? s;
  const active = (shares ?? []).filter((x) => x.active);

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> {t("Gizlilik ve Veri Yönetimi")}</h2>
      <p className="mt-1 text-sm text-ink-500">{t("Tüm projelerinizi, bölümlerinizi, kaynaklarınızı, sohbetlerinizi ve kullanım kayıtlarınızı taşınabilir JSON biçiminde indirebilir veya hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz.")} <Link href="/kvkk" className="text-brand-700 hover:underline">{t("KVKK Aydınlatma Metni")}</Link></p>
      <div className="mt-4 flex flex-wrap gap-2">
        {/* D155: hak dolsa da veriler her zaman indirilebilir */}
        <a href="/api/account?export=1" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-ink-50"><Download className="h-4 w-4" /> {t("Verilerimi JSON olarak indir")}</a>
        <Button variant="secondary" onClick={request}><FileText className="h-4 w-4" /> {t("Veri talebi oluştur (KVKK)")}</Button>
        <Button variant="danger" onClick={() => setDelOpen(true)}><Trash2 className="h-4 w-4" /> {t("Hesabımı ve verilerimi sil")}</Button>
      </div>

      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800"><Link2 className="h-4 w-4" /> {t("Danışman paylaşım bağlantılarım")}</h3>
        {shares == null ? <p className="mt-2 text-sm text-ink-400">{t("Yükleniyor…")}</p>
          : active.length === 0 ? <p className="mt-2 text-sm text-ink-500">{t("Açık paylaşım bağlantınız yok.")}</p>
          : (
            <ul className="mt-2 divide-y divide-ink-100 rounded-xl border border-ink-100">
              {active.map((sh) => (
                <li key={sh.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-800">{sh.projectTitle || t("Çalışma")}{sh.label ? <span className="font-normal text-ink-500"> · {sh.label}</span> : null}</p>
                    <p className="text-xs text-ink-400">{t("Oluşturma")}: {fmt(sh.createdAt)} · {sh.expiresAt ? `${t("Son geçerlilik")}: ${fmt(sh.expiresAt)}` : t("Süresiz")}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => revoke(sh)}>{t("İptal et")}</Button>
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-ink-800">{t("Kabul ettiğiniz hukuki belgeler")}</h3>
        {accepts == null ? <p className="mt-2 text-sm text-ink-400">{t("Yükleniyor…")}</p>
          : accepts.length === 0 ? <p className="mt-2 text-sm text-ink-500">{t("Kayıt bulunamadı.")}</p>
          : (
            <ul className="mt-2 space-y-1 text-[13px] text-ink-600">
              {accepts.slice(0, 10).map((a, i) => (
                <li key={i}>{docTitle(a.doc)} · {t("Sürüm")} {a.version} · {a.kind === "accept" ? t("Kabul edildi") : t("Bilgilendirme gösterildi")} · {fmt(a.accepted_at)} · {sourceLabel(a.source)}</li>
              ))}
            </ul>
          )}
      </div>

      <Modal open={delOpen} onClose={() => { if (!deleted) setDelOpen(false); }} title={deleted ? t("Hesabınız silindi") : t("Hesabı kalıcı olarak sil")}
        footer={deleted
          ? <Button onClick={() => { window.location.href = "/"; }}>{t("Ana sayfaya dön")}</Button>
          : <><Button variant="ghost" onClick={() => setDelOpen(false)}>{t("Vazgeç")}</Button><Button variant="danger" loading={deleting} disabled={confirm !== "SİL"} onClick={deleteAccount}>{t("Kalıcı olarak sil")}</Button></>}>
        {deleted ? (
          <div className="space-y-2 text-sm text-ink-600">
            <p>{t("Hesabınız ve hesabınıza bağlı veriler silindi; oturumunuz kapatıldı.")} {t("Silinen dosya sayısı: {n}.", { n: deleted.removedFiles })}</p>
            <p>{t("Geri bildirim mesajları ve teknik hata kayıtları sizinle bağlantısı kaldırılarak kalabilir. Barındırma sağlayıcısının yedeklerindeki kopyalar, yedek saklama süresi dolunca silinir.")}</p>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-ink-600">
            <p>{t("Şunlar geri alınamaz şekilde silinecek: çalışmalarınız ve bölümleriniz, sürüm geçmişi ve yorumlar, kaynaklar ve notlar, dosyalarınız, yapay zekâ sohbetleri, kullanım kayıtları, cihaz kimliği kayıtları, gönderdiğiniz ortak yazar davetleri, danışman paylaşım bağlantıları ve site içi bildirimler.")}</p>
            <p className="text-ink-500">{t("Geri bildirim mesajları ve teknik hata kayıtları sizinle bağlantısı kaldırılarak kalabilir. Barındırma sağlayıcısının yedeklerindeki kopyalar, yedek saklama süresi dolunca silinir.")}</p>
            <p>{t("Onaylamak için ")}<b>SİL</b> {t("yazın.")}</p>
            <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label={t("Onay")} />
          </div>
        )}
      </Modal>
    </section>
  );
}
