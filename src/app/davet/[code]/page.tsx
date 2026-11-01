import { redirect } from "next/navigation";

/** Kısa davet bağlantısı: /davet/KOD -> kayıt sayfası */
export default async function Invite({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/kayit?ref=${encodeURIComponent(code.replace(/[^A-Za-z0-9]/g, "").slice(0, 16))}`);
}
