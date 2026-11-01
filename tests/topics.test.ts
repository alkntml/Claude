import { describe, expect, it } from "vitest";
import { mergeSubtopics, parseGroupTopics, parseGroupYears, parseWorks, trendOf } from "@/lib/topics";

describe("konu bulma (OpenAlex fixture)", () => {
  it("yıllık gruplar boş yılları sıfırla doldurur", () => {
    const y = parseGroupYears({ group_by: [{ key: "2021", count: 40 }, { key: "2023", count: 90 }] }, 2020, 2024);
    expect(y).toEqual([{ year: 2020, count: 0 }, { year: 2021, count: 40 }, { year: 2022, count: 0 }, { year: 2023, count: 90 }, { year: 2024, count: 0 }]);
  });
  it("eğilim: son 3 yıl / önceki 3 yıl; az veride oran yok", () => {
    const years = [2018, 2019, 2020, 2021, 2022, 2023].map((year, i) => ({ year, count: (i + 1) * 10 }));
    expect(trendOf(years, 2023)).toEqual({ recent3: 150, prev3: 60, change: 1.5 });
    expect(trendOf([{ year: 2023, count: 3 }], 2023).change).toBeNull();
  });
  it("alt konular birleştirilir, büyüme yalnızca yeterli veride hesaplanır", () => {
    const r = parseGroupTopics({ group_by: [{ key: "https://openalex.org/T1", key_display_name: "Battery aging", count: 120 }, { key: "https://openalex.org/T2", key_display_name: "Solid electrolytes", count: 30 }] });
    const e = parseGroupTopics({ group_by: [{ key: "https://openalex.org/T1", key_display_name: "Battery aging", count: 60 }, { key: "https://openalex.org/T2", key_display_name: "Solid electrolytes", count: 2 }] });
    const m = mergeSubtopics(r, e);
    expect(m[0]).toMatchObject({ id: "T1", recent: 120, earlier: 60, growth: 1 });
    expect(m[1].growth).toBeNull();
  });
  it("çalışmalar: DOI sadeleşir, başlıksızlar atlanır", () => {
    const w = parseWorks({ results: [{ display_name: "A study", publication_year: 2022, cited_by_count: 15, doi: "https://doi.org/10.1/x", primary_location: { source: { display_name: "J" } } }, { display_name: "" }] });
    expect(w).toEqual([{ title: "A study", year: 2022, cited: 15, doi: "10.1/x", venue: "J" }]);
  });
});
