import { describe, expect, it } from "vitest";
import { buildRoadmap, GRANT_PROGRAMS, PROGRAM_NOTES } from "@/lib/workflows";
import { POSTS, EN_POSTS, DE_POSTS } from "@/lib/blog";

describe("D153: yeni TÜBİTAK programları", () => {
  const ids = ["tubitak_1002a", "tubitak_3005", "tubitak_2204a", "tubitak_2242"];
  it("programlar listede ve her birinin yapay zekâ notu var", () => {
    for (const id of ids) {
      expect(GRANT_PROGRAMS.some((p) => p.id === id)).toBe(true);
      expect(PROGRAM_NOTES[id as keyof typeof PROGRAM_NOTES]).toBeTruthy();
    }
  });
  it("yarışmalarda bütçe bölümü çıkar, araştırma desteklerinde kalır", () => {
    const has = (program: string) => JSON.stringify(buildRoadmap({ workType: "grant_proposal", level: "undergraduate", program } as unknown as Parameters<typeof buildRoadmap>[0])).includes("grant_budget");
    expect(has("tubitak_2204a")).toBe(false);
    expect(has("tubitak_2242")).toBe(false);
    expect(has("tubitak_1002a")).toBe(true);
    expect(has("tubitak_3005")).toBe(true);
  });
  it("program rehberleri üç dilde yayında", () => {
    for (const slug of ["tubitak-1002-a-hizli-destek-basvurusu", "tubitak-2204-a-lise-proje-nasil-hazirlanir", "tubitak-2242-proje-yarismasi-rehberi", "tubitak-3005-sosyal-bilimler-proje-onerisi"]) {
      expect(POSTS.some((p) => p.slug === slug)).toBe(true);
      expect(EN_POSTS[slug]).toBeTruthy();
      expect(DE_POSTS[slug]).toBeTruthy();
    }
  });
});
