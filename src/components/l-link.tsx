"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useT } from "@/i18n/client";
import { localizedPath } from "@/lib/seo";

/** next/link yerine: herkese açık sayfa bağlantılarını geçerli dile göre (/en önekiyle) üretir */
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const { locale } = useT();
  const h = typeof href === "string" ? localizedPath(href, locale) : href;
  return <NextLink href={h} {...rest} />;
}
