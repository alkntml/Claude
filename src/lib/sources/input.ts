import { z } from "zod";
import { normalizeDoi } from "@/lib/citations";

const Person = z.object({ family: z.string().max(200).optional(), given: z.string().max(200).optional(), literal: z.string().max(300).optional() });
export const SourceInput = z.object({
  type: z.enum(["article-journal", "book", "chapter", "paper-conference", "thesis", "report", "webpage", "preprint", "dataset", "other"]).default("article-journal"),
  title: z.string().trim().min(1).max(1000),
  authors: z.array(Person).max(500).default([]),
  editors: z.array(Person).max(50).optional(),
  year: z.number().int().min(1000).max(2100).nullable().optional(),
  month: z.number().int().min(1).max(12).nullable().optional(),
  containerTitle: z.string().max(500).nullable().optional(),
  volume: z.string().max(50).nullable().optional(),
  issue: z.string().max(50).nullable().optional(),
  pages: z.string().max(50).nullable().optional(),
  publisher: z.string().max(300).nullable().optional(),
  publisherPlace: z.string().max(200).nullable().optional(),
  edition: z.string().max(50).nullable().optional(),
  doi: z.string().max(300).nullable().optional(),
  pmid: z.string().max(30).nullable().optional(),
  pmcid: z.string().max(30).nullable().optional(),
  arxivId: z.string().max(50).nullable().optional(),
  isbn: z.string().max(30).nullable().optional(),
  openalexId: z.string().max(50).nullable().optional(),
  url: z.string().url().max(2000).nullable().optional().or(z.literal("")),
  oaUrl: z.string().url().max(2000).nullable().optional().or(z.literal("")),
  abstract: z.string().max(20000).nullable().optional(),
  license: z.string().max(300).nullable().optional(),
  language: z.string().max(20).nullable().optional(),
  accessLevel: z.enum(["metadata", "abstract", "full_text"]).optional(),
  origins: z.array(z.string()).max(12).default(["manual"]),
  relevanceNote: z.string().max(4000).optional(),
});

export function toRow(b: z.infer<typeof SourceInput>) {
  // İstemciden gelen "full_text" kabul edilmez: tam metin yalnızca sunucu tarafında içe aktarılınca atanır.
  const access = b.abstract && b.abstract.trim().length > 40 ? "abstract" : "metadata";
  return {
    type: b.type, title: b.title, authors: b.authors, year: b.year ?? null, month: b.month ?? null,
    container_title: b.containerTitle ?? null, volume: b.volume ?? null, issue: b.issue ?? null, pages: b.pages ?? null,
    publisher: b.publisher ?? null, publisher_place: b.publisherPlace ?? null, edition: b.edition ?? null,
    doi: normalizeDoi(b.doi), pmid: b.pmid ?? null, pmcid: b.pmcid ?? null, arxiv_id: b.arxivId ?? null, isbn: b.isbn ?? null,
    openalex_id: b.openalexId ?? null, url: b.url || null, oa_url: b.oaUrl || null, abstract: b.abstract ?? null,
    license: b.license ?? null, language: b.language ?? null, access_level: access,
    origin: b.origins[0] ?? "manual", relevance_note: b.relevanceNote ?? "",
    ...(b.editors?.length ? { verification: { editors: b.editors } } : {}),
  };
}

