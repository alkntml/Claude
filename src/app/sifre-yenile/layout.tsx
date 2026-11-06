import type { Metadata } from "next";

/** Kullanıcıya özel / teknik sayfa: arama motorlarında listelenmez (D107) */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
