import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_USD_TRY } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";

/** Dolar kuru (yönetim → Kârlılık); tanıtım sayfaları için 1 saat önbellekli, ayar kaydedilince yenilenir (D59) */
export const getUsdTry = unstable_cache(async (): Promise<number> => {
  try { return Number((await getSetting("billing.margin")).usd_try) || DEFAULT_USD_TRY; } catch { return DEFAULT_USD_TRY; }
}, ["usd-try"], { revalidate: 3600, tags: ["fx"] });
