"""Europe PMC resmî REST arayüzünden tam metin (JATS XML) alır: bölüm bölüm kelime, kaynak, tablo, şekil sayısı."""
import json, os, re, subprocess, sys, time
import xml.etree.ElementTree as ET

D = os.path.join(os.path.dirname(__file__), "corpus")
ids = sys.argv[1].split(",")
meta = {r["pmcid"]: r for r in json.load(open(os.path.join(D, "epmc.json")))["resultList"]["result"]}


def words(t):
    return len(re.findall(r"[A-Za-z0-9][\w'\-]*", t or ""))


def txt(el):
    return " ".join(el.itertext()) if el is not None else ""


out = []
for pid in ids:
    x = subprocess.run(["curl", "-s", "--max-time", "60", f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pid}/fullTextXML"], capture_output=True, text=True).stdout
    try:
        root = ET.fromstring(x)
    except ET.ParseError:
        print("xml yok", pid); continue
    body = root.find(".//body")
    if body is None:
        print("gövde yok", pid); continue
    # Tablolar ve şekil açıklamaları ana metin kelimesinden ayrı sayılır
    tables = body.findall(".//table-wrap")
    figs = body.findall(".//fig")
    table_words = sum(words(txt(t)) for t in tables)
    fig_words = sum(words(txt(f)) for f in figs)
    body_words = words(txt(body)) - table_words - fig_words
    secs = []
    for s in body.findall("./sec"):
        title = (s.findtext("title") or "").strip()
        w = words(txt(s)) - sum(words(txt(t)) for t in s.findall(".//table-wrap")) - sum(words(txt(f)) for f in s.findall(".//fig"))
        secs.append({"title": title[:60], "words": w, "subsecs": len(s.findall(".//sec"))})
    abstract = words(txt(root.find(".//abstract")))
    refs = root.findall(".//ref-list/ref")
    m = meta.get(pid, {})
    out.append({"id": pid, "title": m.get("title", ""), "journal": m.get("journalTitle", ""), "type": m.get("pubType", ""),
                "abstract_words": abstract, "body_words": body_words, "table_words": table_words, "n_tables": len(tables),
                "n_figures": len(figs), "n_refs": len(refs), "sections": secs, "n_subsections": sum(s["subsecs"] for s in secs)})
    print(pid, body_words, len(refs), len(tables), m.get("title", "")[:60])
    time.sleep(1.5)
json.dump(out, open(os.path.join(D, "epmc_measured.json"), "w"), ensure_ascii=False, indent=1)
print(len(out))
