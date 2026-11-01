import { describe, expect, it } from "vitest";
import { aggregateVenues, enrichVenues, journalQuery } from "@/lib/sources/journals";

const work = (title: string, src: Record<string, unknown> | null) => ({ display_name: title, publication_year: 2022, doi: "https://doi.org/10.1/x", primary_location: src ? { source: src } : null });
const J1 = { id: "https://openalex.org/S1", display_name: "Journal of OCRD", type: "journal", issn_l: "2211-3649", host_organization_name: "Elsevier", is_oa: false, is_in_doaj: false };
const J2 = { id: "https://openalex.org/S2", display_name: "Türk Psikoloji Dergisi", type: "journal", issn_l: "1300-4433", is_oa: true, is_in_doaj: true };
const REPO = { id: "https://openalex.org/S3", display_name: "PsyArXiv", type: "repository" };

describe("dergi önerisi", () => {
  it("yalnızca dergileri sayar, en çok yayın yapanı öne alır", () => {
    const list = aggregateVenues([work("a", J1), work("b", J2), work("c", J1), work("d", REPO), work("e", null)]);
    expect(list.map((j) => [j.id, j.count])).toEqual([["S1", 2], ["S2", 1]]);
    expect(list[0]).toMatchObject({ name: "Journal of OCRD", issn: "2211-3649", publisher: "Elsevier", isOa: false });
    expect(list[0].examples[0]).toEqual({ title: "a", year: 2022, doi: "10.1/x" });
    expect(list[1]).toMatchObject({ isOa: true, inDoaj: true });
  });
  it("dergi metrikleri eklenir", () => {
    const list = enrichVenues(aggregateVenues([work("a", J1)]), { results: [{ id: "https://openalex.org/S1", summary_stats: { h_index: 30, "2yr_mean_citedness": 2.4 }, homepage_url: "https://j.example" }] });
    expect(list[0]).toMatchObject({ hIndex: 30, meanCitedness: 2.4, homepage: "https://j.example" });
  });
  it("arama ifadesi anahtar kelimelerden", () => {
    expect(journalQuery({ title: "Başlık", keywords: ["relationship OCD", "attachment"] })).toBe("relationship OCD attachment");
    expect(journalQuery({ title: "Ebeveyn tutumları ve OKB" })).toBe("Ebeveyn tutumları OKB");
  });
});
