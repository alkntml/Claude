"""PDF ölçümü: sayfa, toplam kelime, ana metin / kaynakça kelimesi, kaynak sayısı, sayfa başına kelime, başlık sayısı."""
import json, re, subprocess, sys

REF_HEAD = re.compile(r"^\s*(KAYNAKÇA|KAYNAKLAR|Kaynakça|Kaynaklar|REFERENCES|References|Bibliography|BIBLIOGRAPHY|Literature Cited|Extended Abstract|GENİŞLETİLMİŞ ÖZET|Genişletilmiş Özet|EXTENDED ABSTRACT)\s*:?\s*$", re.M)
YEAR = re.compile(r"\(?(19|20)\d{2}[a-z]?\)?[.,]")


def words(t: str) -> int:
    return len(re.findall(r"[A-Za-zÇĞİÖŞÜçğıöşüÂâÎîÛû0-9][\wÇĞİÖŞÜçğıöşüÂâÎîÛû’'\-]*", t))


def measure(pdf: str) -> dict:
    info = subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout
    pages = int(re.search(r"Pages:\s+(\d+)", info).group(1)) if "Pages:" in info else 0
    size = re.search(r"Page size:\s+([\d.]+) x ([\d.]+)", info)
    text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout
    per_page = text.split("\f")
    total = words(text)
    # Kaynakça: belgenin son yarısındaki ilk “Kaynakça/References” başlığından sonrası (genişletilmiş özet varsa onu ayrı say)
    refs_words = 0
    n_refs = 0
    heads = [m for m in REF_HEAD.finditer(text) if m.start() > len(text) * 0.45]
    if heads:
        start = heads[0].start()
        nxt = [m.start() for m in REF_HEAD.finditer(text, heads[0].end()) if re.search(r"Extended|EXTENDED|Genişletilmiş|GENİŞLETİLMİŞ", m.group(0))]
        end = nxt[0] if nxt else len(text)
        ref = text[start:end]
        refs_words = words(ref)
        # Kaynak sayısı: yıl içeren ve satır başında soyadı ile başlayan girdiler
        n_refs = len(re.findall(r"(?m)^\s{0,12}[A-ZÇĞİÖŞÜ][\wçğıöşü’'\-]+,\s*[A-ZÇĞİÖŞÜ]", ref))
    dense = [words(p) for p in per_page if words(p) > 120]
    dense.sort()
    median_wpp = dense[len(dense) // 2] if dense else 0
    return {"pages": pages, "words": total, "ref_words": refs_words, "body_words": total - refs_words, "n_refs": n_refs,
            "median_words_per_page": median_wpp, "page_w_pt": float(size.group(1)) if size else None}


if __name__ == "__main__":
    print(json.dumps(measure(sys.argv[1]), ensure_ascii=False))
