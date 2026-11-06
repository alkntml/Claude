"""DergiPark resmî OAI-PMH arayüzünden makale üst verisi toplar (kibar: istekler arası bekleme)."""
import json, re, subprocess, sys, time, html

OUT = sys.argv[1]
windows = [("2024-03-04", "2024-03-05"), ("2024-10-07", "2024-10-08"), ("2025-02-10", "2025-02-11"), ("2025-05-12", "2025-05-13")]
recs = []
for a, b in windows:
    url = f"https://dergipark.org.tr/api/public/oai/?verb=ListRecords&metadataPrefix=oai_dc&from={a}&until={b}"
    pages = 0
    while url and pages < 6:
        x = subprocess.run(["curl", "-s", "--max-time", "60", url], capture_output=True, text=True).stdout
        for r in re.findall(r"<record>(.*?)</record>", x, re.S):
            def f(tag):
                return [html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", v)).strip() for v in re.findall(rf"<{tag}[^>]*>(.*?)</{tag}>", r, re.S)]
            ids = [i for i in f("dc:identifier") if "/article/" in i]
            recs.append({"title": (f("dc:title") or [""])[0], "subjects": f("dc:subject"), "lang": (f("dc:language") or [""])[0],
                         "type": (f("dc:type") or [""])[0], "url": ids[0] if ids else None, "source": (f("dc:source") or [""])[0],
                         "date": (f("dc:date") or [""])[0], "desc": (f("dc:description") or [""])[0][:400]})
        tok = re.search(r"<resumptionToken[^>]*>([^<]+)</resumptionToken>", x)
        url = f"https://dergipark.org.tr/api/public/oai/?verb=ListRecords&resumptionToken={tok.group(1)}" if tok else None
        pages += 1
        time.sleep(2)
json.dump(recs, open(OUT, "w"), ensure_ascii=False)
print(len(recs))
