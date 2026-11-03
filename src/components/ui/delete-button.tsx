"use client";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/client";
import { cn } from "./cn";
import { useToast } from "./toast";

interface Props {
  /** Sunucuda silmeyi yapan çağrı; hata fırlatırsa liste değişmez ve hata gösterilir */
  onDelete: () => Promise<unknown>;
  /** Silme başarıyla bitince (ör. listeden çıkar) */
  onDone?: () => void;
  /** Onay sorusu (çevrilmiş metin). Verilmezse genel soru sorulur */
  confirmText?: string;
  label?: string;
  className?: string;
  /** Simgenin yanında yazı da gösterilsin */
  withText?: boolean;
}

/**
 * Kullanıcının kendi kaydı için ortak silme düğmesi (D65): onay sorar, sunucudan gerçekten silindiği
 * yanıtı gelmeden listeden çıkarmaz, hata olursa bildirir. Bağlantı (Link) içinde de güvenle kullanılır.
 */
export function DeleteButton({ onDelete, onDone, confirmText, label, className, withText }: Props) {
  const { t } = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const text = label ?? t("Sil");
  return (
    <button
      type="button"
      aria-label={text}
      title={text}
      disabled={busy}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(confirmText ?? t("Bu kayıt kalıcı olarak silinsin mi? Bu işlem geri alınamaz."))) return;
        setBusy(true);
        try {
          await onDelete();
          onDone?.();
          toast({ tone: "success", title: t("Silindi") });
        } catch (err) {
          toast({ tone: "error", title: t("Silinemedi"), detail: (err as Error).message });
        } finally {
          setBusy(false);
        }
      }}
      className={cn("inline-flex items-center gap-1.5 rounded-lg p-1.5 text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50", className)}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      {withText && <span className="text-[12px] font-medium">{text}</span>}
    </button>
  );
}
