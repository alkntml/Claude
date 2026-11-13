"use client";
import { useEffect, useState } from "react";

/**
 * D168: Herkese açık sayfalar giriş yapmamış ziyaretçiler için önbellekten (CDN) sunulur; önbellekteki HTML her zaman
 * “giriş yapılmamış” hâlidir. Giriş yapmış kullanıcıda düğmeler (“Çalışma alanım” vb.) tarayıcıda oturum çerezine bakılarak
 * düzeltilir. Sunucudan gelen değer ilk çizimde aynen kullanılır (hydration uyumsuzluğu olmaz).
 */
export function useSignedIn(initial: boolean): boolean {
  const [signedIn, setSignedIn] = useState(initial);
  useEffect(() => {
    if (initial) return;
    try {
      if (/(?:^|;\s*)sb-[^=]+-auth-token(?:\.\d+)?=[^;]+/.test(document.cookie)) setSignedIn(true);
    } catch { /* çerezlere erişilemiyor */ }
  }, [initial]);
  return signedIn;
}
