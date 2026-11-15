import { DE_1 } from "./de-1";
import { DE_2 } from "./de-2";
import { DE_3 } from "./de-3";
import { DE_4 } from "./de-4";
import { DE_5 } from "./de-5";
import { DE_6 } from "./de-6";
import { DE_7 } from "./de-7";
import { DE_8 } from "./de-8";
import { DE_9 } from "./de-9";
import { DE_10 } from "./de-10";
import type { BlogPostEn } from "./types";

/** Almanca blog yazıları (D143; anahtar: Türkçe adres). Bağlantılar /de/blog/<almanca adres> biçimindedir. */
export const DE_POSTS: Record<string, BlogPostEn> = { ...DE_1, ...DE_2, ...DE_3, ...DE_4, ...DE_5, ...DE_6, ...DE_7, ...DE_8, ...DE_9, ...DE_10 };
