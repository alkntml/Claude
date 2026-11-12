import { DE_1 } from "./de-1";
import { DE_2 } from "./de-2";
import { DE_3 } from "./de-3";
import { DE_4 } from "./de-4";
import { DE_5 } from "./de-5";
import type { BlogPostEn } from "./types";

/** Almanca blog yazıları (D143; anahtar: Türkçe adres). Bağlantılar /de/blog/<almanca adres> biçimindedir. */
export const DE_POSTS: Record<string, BlogPostEn> = { ...DE_1, ...DE_2, ...DE_3, ...DE_4, ...DE_5 };
