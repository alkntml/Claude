import { it, expect } from "vitest";
import { POSTS, EN_POSTS } from "@/lib/blog";
import { PUBLIC_PATHS } from "@/lib/seo";
it("blog iç bağlantıları var olan yazılara ve herkese açık sayfalara gider", () => {
  const tr = new Set(POSTS.map((p) => p.slug)), en = new Set(Object.values(EN_POSTS).map((e) => e.slug));
  const bad: string[] = [];
  const all = [...POSTS.map((p) => p.body), ...Object.values(EN_POSTS).map((e) => e.body)];
  for (const b of all) for (const m of b.matchAll(/\]\(([^)]+)\)/g)) {
    const u = m[1];
    if (u.startsWith("/en/blog/")) { if (!en.has(u.slice(9))) bad.push(u); }
    else if (u.startsWith("/blog/")) { if (!tr.has(u.slice(6))) bad.push(u); }
    else { const q = u.replace(/^\/en(?=\/)/, ""); if (!PUBLIC_PATHS.includes(q)) bad.push(u); }
  }
  expect(bad).toEqual([]);
});
