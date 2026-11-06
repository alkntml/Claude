"""
Academiana maliyet modeli: ölçülen 46 tam metnin her biri sistemde (Türkçe) yazılsaydı kaç istek, kaç token ve
kaç dolar tutardı? Girdiler: korpus ölçümleri, kodla ölçülen bağlam boyutları, model fiyatları (resmî referans).
Belirsiz katsayılar üç senaryoda (iyimser / temel / kötümser) verilir.
"""
import glob, json, math, os, re, statistics as st

D = os.path.join(os.path.dirname(__file__), "corpus")

# ---------- Fiyatlar (USD / milyon token) ----------
P = {
    "sonnet": {"in": 2.0, "out": 10.0, "read": 0.1},
    "haiku": {"in": 0.10, "out": 0.50, "read": 0.1, "tok_mult": 1.30},  # Haiku 5.5: yeni tokenizer ~%30 fazla token
    "opus": {"in": 4.0, "out": 20.0, "read": 0.05},
}
WRITE = 1.25  # önbelleğe yazma

# ---------- Ölçülen sabitler ----------
SYS_CHARS = 16451           # sistem talimatı + çıktı protokolü + kullanım rehberi (kodla ölçüldü)
HISTORY_CHARS = 6000        # compactHistory sonrası tipik sohbet geçmişi
SRC_LINE = 1350             # bağlamdaki bir kaynak satırı (künye + 1.200 karaktere kadar özet)
MEM_LINE = 170
STAGE_LINE = 470            # diğer bölümlerden 400 karakterlik özet satırı
CHUNK = 1550                # tam metin parçası

# Türkçe karakter/kelime: korpustaki Türkçe paragraflardan
paras = []
for f in glob.glob(os.path.join(D, "dp_*.txt")):
    for p in open(f).read().split("\n\n"):
        p = re.sub(r"\s+", " ", p).strip()
        if len(p.split()) > 60 and len(re.findall(r"[çğışöü]", p)) / max(1, len(p)) > 0.02:
            paras.append(p)
# PDF metinleri depoda tutulmaz; yoksa 2026-11 ölçümü (24 DergiPark makalesi) kullanılır
CHARS_PER_WORD = sum(len(p) + 1 for p in paras) / sum(len(p.split()) for p in paras) if paras else 8.06

SCEN = {
    "iyimser": {"cpt": 3.4, "hit": 0.70, "think": 0.7},
    "temel": {"cpt": 3.0, "hit": 0.50, "think": 1.0},
    "kötümser": {"cpt": 2.6, "hit": 0.30, "think": 1.4},
}
PROFILE = {
    # rewrite: yeniden ürettirilen taslak oranı; edit: taslak başına düzeltme isteği; chat: taslak başına soru/plan
    "verimli": {"rewrite": 0.3, "edit": 0.5, "chat": 0.3, "quality": 1, "matrix_share": 0.0},
    "yoğun": {"rewrite": 0.8, "edit": 1.2, "chat": 0.6, "quality": 3, "matrix_share": 1.0},
}
WORDS_PER_DRAFT = 1000  # bir “Bölümü yaz” isteğinde kalıcı metne giren ortalama kelime (alt başlık başına)


def call_cost(model, in_chars_cached, in_chars_plain, out_tokens, s):
    m = P[model]
    mult = m.get("tok_mult", 1.0)
    cached_t = in_chars_cached / s["cpt"] * mult
    plain_t = in_chars_plain / s["cpt"] * mult
    h = s["hit"]
    eff = cached_t * (h * m["read"] + (1 - h) * WRITE) + plain_t
    cost = (eff * m["in"] + out_tokens * mult * m["out"]) / 1e6
    return cost, cached_t + plain_t, out_tokens * mult


def simulate(body_words, n_refs, n_sections, kind, s, prof):
    """Bir eserin sistemde baştan sona yazılması: istek, token, maliyet."""
    tok_per_word = CHARS_PER_WORD / s["cpt"]
    refs_in_ctx = min(max(n_refs, 8), 40)
    head = 6000 + refs_in_ctx * SRC_LINE + 25 * MEM_LINE
    stages = 14 if kind in ("YL", "DR") else 7
    tail = stages * STAGE_LINE + 5000 + 6 * CHUNK + 3000
    drafts = max(math.ceil(body_words / WORDS_PER_DRAFT), n_sections)
    rewrites = round(drafts * prof["rewrite"])
    edits = round(drafts * prof["edit"])
    chats = round(drafts * prof["chat"])
    rows = []

    def add(name, n, model, cached, plain, out, counts=True):
        if n <= 0:
            return
        c, ti, to = call_cost(model, cached, plain, out, s)
        rows.append({"name": name, "n": n, "model": model, "cost": c * n, "tin": ti * n, "tout": to * n, "requests": n if counts else 0})

    think = s["think"]
    draft_out = WORDS_PER_DRAFT * 1.1 * tok_per_word + 1500 * think          # metin + bloklar + düşünme
    add("Bölüm/alt başlık taslağı (Sonnet)", drafts + rewrites, "sonnet", SYS_CHARS + head, tail + HISTORY_CHARS, draft_out)
    add("Kaynak taraması kararı (Haiku)", drafts + rewrites, "haiku", 0, 9000, 400 + 200 * think, counts=False)
    sel = 2600  # ~350 kelimelik seçili metin
    add("Düzeltme: genişlet/yeniden yapılandır (Sonnet)", edits // 2, "sonnet", SYS_CHARS + head, tail + HISTORY_CHARS + sel, 600 * tok_per_word + 800 * think)
    add("Düzeltme: kısalt/akademik dil/tekrar (Haiku)", edits - edits // 2, "haiku", SYS_CHARS + head, tail + HISTORY_CHARS + sel, 350 * tok_per_word + 300 * think)
    add("Soru, plan, alt başlık önerisi (Sonnet)", chats, "sonnet", SYS_CHARS + head, tail + HISTORY_CHARS, 350 * tok_per_word + 800 * think)
    # Tek seferlik işler
    add("Başlık önerileri (Sonnet)", 1, "sonnet", 0, 4000, 900 + 600 * think)
    add("Kurgu (blueprint)", 2, "opus" if kind in ("YL", "DR") else "sonnet", 0, 9000, 3500 + 1500 * think)
    add("Bölüm tamamlama kontrolü (Haiku)", stages, "haiku", 0, 3000 + min(body_words / stages, 3200) * CHARS_PER_WORD + 3000, 1200 + 300 * think, counts=False)
    q_in = min(body_words * CHARS_PER_WORD, stages * 6000) + 4000
    add("Kalite kontrol jürisi (Opus)", prof["quality"], "opus", 0, q_in, 3000 + 2000 * think)
    add("Özet / Abstract (Sonnet)", 1, "sonnet", SYS_CHARS + head, tail + stages * 3500, 450 * tok_per_word + 1000 * think)
    nmat = round(refs_in_ctx * prof["matrix_share"])
    add("Literatür matrisi (Haiku, kaynak başına)", nmat, "haiku", 0, 3000 + 4000, 600 + 100 * think)
    tot = {k: sum(r[k] for r in rows) for k in ("cost", "tin", "tout", "requests")}
    tot["calls"] = sum(r["n"] for r in rows)
    tot["drafts"] = drafts
    return tot, rows


def load():
    docs = []
    for r in json.load(open(os.path.join(D, "dp_measured.json"))):
        kind = "derleme" if re.search(r"Literature Review|Content Analysis|Bibliometric|Bibliyometri|İnceleme|Review|Evaluation|Analysis of The|Approach", r["title"]) and not re.search(r"Teachers|Opinions|Hasta|Sigara|Öğretmen|Students|Profiles|Halk", r["title"]) else "makale"
        n_refs = r["n_refs"] if r["n_refs"] >= 5 else round(r["ref_words"] / 22)
        docs.append({"src": "DergiPark (TR)", "title": r["title"], "kind": kind, "pages": r["pages"], "words": r["words"], "body": r["body_words"],
                     "refs": n_refs, "wpp": round(r["words"] / max(1, r["pages"])), "sections": 9, "url": r["url"]})
    for r in json.load(open(os.path.join(D, "epmc_measured.json"))):
        kind = "derleme" if re.search(r"review|meta-analysis", r["type"]) else "makale"
        docs.append({"src": "Europe PMC (EN)", "title": r["title"], "kind": kind, "pages": None, "words": r["body_words"] + r["abstract_words"],
                     "body": r["body_words"], "refs": r["n_refs"], "wpp": None, "sections": len(r["sections"]) + r["n_subsections"], "url": f"https://europepmc.org/article/PMC/{r['id']}"})
    for r in json.load(open(os.path.join(D, "ax_measured.json"))):
        if r["pages"] < 30:
            continue  # makale biçiminde özet; tez sayılmaz
        n_refs = r["n_refs"] if r["n_refs"] >= 40 else round(r["ref_words"] / 22)
        docs.append({"src": "arXiv tez (EN)", "title": r["title"], "kind": r["level"], "pages": r["pages"], "words": r["words"], "body": r["body_words"],
                     "refs": n_refs, "wpp": round(r["words"] / r["pages"]), "sections": 40 if r["level"] == "YL" else 90, "url": f"https://arxiv.org/abs/{r['id']}"})
    excluded = [r for r in json.load(open(os.path.join(D, "ax_measured.json"))) if r["pages"] < 30]
    return docs, excluded


def main():
    docs, excluded = load()
    for d in docs:
        d["sim"] = {}
        for sn, s in SCEN.items():
            for pn, pr in PROFILE.items():
                tot, rows = simulate(d["body"], d["refs"], d["sections"], d["kind"], s, pr)
                d["sim"][f"{sn}|{pn}"] = {k: round(v, 4) if isinstance(v, float) else v for k, v in tot.items()}
                if sn == "temel" and pn == "verimli":
                    d["breakdown"] = [{**r, "cost": round(r["cost"], 4)} for r in rows]
        # Sistemdeki tez biçiminde (Times 12, 1,5 satır: ölçülen 344 kelime/sayfa) kaç sayfa eder
        d["pages_in_tr_thesis_format"] = round(d["body"] / 344)
    # Standart senaryolar (Türkiye ortalamaları; ana metin kelimesi)
    std = {
        "Lisans bitirme / dönem ödevi": (9000, 25, 10, "makale"),
        "Araştırma makalesi": (6500, 45, 10, "makale"),
        "Derleme / sistematik derleme": (7000, 70, 9, "derleme"),
        "Araştırma önerisi / TÜBİTAK": (5000, 35, 12, "makale"),
        "Yüksek lisans tezi": (28000, 120, 40, "YL"),
        "Doktora tezi": (55000, 220, 80, "DR"),
    }
    std_out = {}
    for name, (body, refs, secs, kind) in std.items():
        std_out[name] = {"body": body, "refs": refs, "pages_tr_format": round(body / 344), "sim": {}}
        for sn, s in SCEN.items():
            for pn, pr in PROFILE.items():
                tot, rows = simulate(body, refs, secs, kind, s, pr)
                std_out[name]["sim"][f"{sn}|{pn}"] = {k: round(v, 4) if isinstance(v, float) else v for k, v in tot.items()}
                if sn == "temel" and pn == "verimli":
                    std_out[name]["breakdown"] = [{**r, "cost": round(r["cost"], 4)} for r in rows]
    json.dump({"docs": docs, "excluded": [{"id": r["id"], "title": r["title"], "pages": r["pages"]} for r in excluded], "standard": std_out,
               "constants": {"chars_per_word": round(CHARS_PER_WORD, 2), "sys_chars": SYS_CHARS, "scenarios": SCEN, "profiles": PROFILE, "words_per_draft": WORDS_PER_DRAFT}},
              open(os.path.join(D, "model_out.json"), "w"), ensure_ascii=False, indent=1)
    print("karakter/kelime:", round(CHARS_PER_WORD, 2), "belge:", len(docs))
    for name, v in std_out.items():
        b = v["sim"]["temel|verimli"]; y = v["sim"]["temel|yoğun"]; k = v["sim"]["kötümser|yoğun"]
        print(f"{name:32s} istek {b['requests']:4d}/{y['requests']:4d}  token(M) {(b['tin']+b['tout'])/1e6:5.2f}  maliyet ${b['cost']:6.2f} / yoğun ${y['cost']:6.2f} / kötü ${k['cost']:6.2f}  ort/istek ${b['cost']/max(1,b['requests']):.3f}")


if __name__ == "__main__":
    main()
