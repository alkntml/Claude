import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";

/** D173: yönetim panelinden eklenen araştırma desenleri (yeni proje sihirbazında gösterilir) */
export const GET = route("designs.list", async () => {
  await requireUser();
  const { extra } = await getSetting("workflows.designs");
  return json({ designs: Array.isArray(extra) ? extra.filter((d) => d && /^[a-z_]{2,40}$/.test(d.id) && d.label && ["quantitative", "qualitative", "mixed"].includes(d.approach)) : [] });
});
