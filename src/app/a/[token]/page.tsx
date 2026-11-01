import { notFound } from "next/navigation";
import { SurveyForm } from "@/components/surveys/survey-form";
import { isSupabaseConfigured } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function load(token: string) {
  if (!/^[a-f0-9]{24,128}$/.test(token) || !isSupabaseConfigured()) return null;
  // Herkese açık form: yalnızca katılımcının görmesi gereken alanlar okunur
  const { data } = await adminClient().from("surveys").select("title, description, consent, questions, is_open, closes_at, max_responses, response_count").eq("token", token).maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const s = await load(token);
  return { title: s?.title ?? "Anket", robots: { index: false, follow: false } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ onizleme?: string }> }) {
  const { token } = await params;
  const { onizleme } = await searchParams;
  const s = await load(token);
  if (!s) notFound();
  const accepting = s.is_open && !(s.closes_at && new Date(s.closes_at) < new Date()) && !(s.max_responses && s.response_count >= s.max_responses);
  return <SurveyForm token={token} title={s.title} description={s.description} consent={s.consent} questions={s.questions ?? []} accepting={accepting} preview={onizleme === "1"} />;
}
