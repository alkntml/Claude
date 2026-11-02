import { describe, expect, it } from "vitest";
import { completion, nextStage, shouldWaitFor, writingOrder } from "@/lib/workflows/order";

const st = (key: string, position: number, status = "not_started") => ({ id: key, key, position, status });
const article = [st("title_abstract", 0), st("introduction", 1), st("methods_article", 2), st("results_article", 3), st("references", 4)];

describe("yazım sırası", () => {
  it("özet sona alınır, kaynakça sıraya girmez", () => {
    expect(writingOrder(article).map((s) => s.key)).toEqual(["introduction", "methods_article", "results_article", "title_abstract"]);
  });
  it("sıradaki bölüm ilk tamamlanmamış bölümdür", () => {
    expect(nextStage(article)?.key).toBe("introduction");
    const s2 = article.map((s) => (s.key === "introduction" ? { ...s, status: "done" } : s));
    expect(nextStage(s2)?.key).toBe("methods_article");
    expect(nextStage(s2, "methods_article")?.key).toBe("results_article");
  });
  it("özet erken açılırsa önce yazılacak bölüm önerilir; hepsi bitince öneri yok", () => {
    expect(shouldWaitFor(article, article[0])?.key).toBe("introduction");
    const all = article.map((s) => (s.key === "title_abstract" ? s : { ...s, status: "done" }));
    expect(shouldWaitFor(all, all[0])).toBeUndefined();
    expect(nextStage(all)?.key).toBe("title_abstract");
  });
  it("tamamlanma sayacı kaynakçayı saymaz", () => {
    expect(completion([...article.slice(0, 4), { ...article[4], status: "done" }])).toEqual({ done: 0, total: 4 });
  });
});
