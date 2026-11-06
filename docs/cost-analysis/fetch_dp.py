"""Seçilen DergiPark makalelerinin PDF’lerini indirir ve ölçer (istekler arası bekleme)."""
import json, os, re, subprocess, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from measure import measure

D = os.path.join(os.path.dirname(__file__), "corpus")
recs = json.load(open(os.path.join(D, "dp_meta.json")))
tr = [r for r in recs if r["lang"] == "tr" and r["url"]]
# Alan çeşitliliği: her ana konudan en fazla 2
picked, seen = [], {}
for r in tr:
    k = (r["subjects"][0] if r["subjects"] else "?").split("(")[0].strip()
    if seen.get(k, 0) >= 1:
        continue
    seen[k] = seen.get(k, 0) + 1
    picked.append(r)
picked = picked[: int(sys.argv[1]) if len(sys.argv) > 1 else 24]
out = []
for i, r in enumerate(picked):
    try:
        page = subprocess.run(["curl", "-s", "--max-time", "40", r["url"]], capture_output=True, text=True).stdout
        m = re.search(r"/(?:en|tr)/download/article-file/(\d+)", page)
        if not m:
            print("pdf yok", r["url"]); continue
        pdf = os.path.join(D, f"dp_{i}.pdf")
        time.sleep(2)
        subprocess.run(["curl", "-s", "-L", "--max-time", "90", "-o", pdf, f"https://dergipark.org.tr/en/download/article-file/{m.group(1)}"])
        head = open(pdf, "rb").read(5)
        if head != b"%PDF-":
            print("pdf değil", r["url"]); continue
        mm = measure(pdf)
        out.append({**{k: r[k] for k in ("title", "subjects", "source", "url", "desc")}, **mm})
        print(i, mm["pages"], mm["words"], mm["n_refs"], r["title"][:60])
    except Exception as e:  # noqa
        print("hata", r["url"], e)
    time.sleep(3)
json.dump(out, open(os.path.join(D, "dp_measured.json"), "w"), ensure_ascii=False, indent=1)
print(len(out))
