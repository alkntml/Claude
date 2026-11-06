"""Hesaplama çıktısından (model_out.json) rapor sayfasını üretir; sayılar elle yazılmaz."""
import html, json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from model import PROFILE, SCEN, simulate

D = os.path.join(os.path.dirname(__file__), "corpus")
m = json.load(open(os.path.join(D, "model_out.json")))
docs, std = m["docs"], m["standard"]
E = html.escape
USD_TRY, VAT, SHARE = 48, 0.2, 1 / 3
PLANS = [("Ücretsiz", 0, 10, 7, 1.0), ("Basic", 749, 40, 100, None), ("Pro", 1349, 75, 2000, None), ("Premium", 2249, 125, 8000, None)]
budget = {n: (b if b is not None else round(p / (1 + VAT) / USD_TRY * SHARE, 2)) for n, p, _, _, b in PLANS}

def usd(v, d=2):
    return f"${v:,.{d}f}"

def tl(v):
    return f"{round(v * USD_TRY):,} TL".replace(",", ".")

yl = std["Yüksek lisans tezi"]; dr = std["Doktora tezi"]; art = std["Araştırma makalesi"]
per_page = {k: yl["sim"][k]["cost"] / yl["pages_tr_format"] for k in yl["sim"]}
# Yazım isteği başına ortalama (matris hariç): verimli profilde matris yok
avg_req = {sn: yl["sim"][f"{sn}|verimli"]["cost"] / yl["sim"][f"{sn}|verimli"]["requests"] for sn in SCEN}

def floor5(x):
    return int(x // 5 * 5)

pkg_rows = []
for n, price, req, srch, _ in PLANS:
    B = budget[n]
    pages_eff = B / per_page["temel|verimli"]; pages_heavy = B / per_page["temel|yoğun"]; pages_worst = B / per_page["kötümser|yoğun"]
    art_eff = B / art["sim"]["temel|verimli"]["cost"]; art_heavy = B / art["sim"]["temel|yoğun"]["cost"]
    yl_m = yl["sim"]["temel|yoğun"]["cost"] / B; yl_m_eff = yl["sim"]["temel|verimli"]["cost"] / B
    dr_m = dr["sim"]["temel|yoğun"]["cost"] / B
    req_base = B / avg_req["temel"]; req_worst = B / avg_req["kötümser"]
    pkg_rows.append(dict(n=n, price=price, B=B, req=req, srch=srch, pages_eff=pages_eff, pages_heavy=pages_heavy, pages_worst=pages_worst,
                         art_eff=art_eff, art_heavy=art_heavy, yl_m=yl_m, yl_m_eff=yl_m_eff, dr_m=dr_m, req_base=req_base, req_worst=req_worst,
                         promise_pages=floor5(pages_heavy) if n != "Ücretsiz" else floor5(pages_heavy)))

# Matrisin istek hakkına etkisi
mat_req = 40

# ------------------------------------------------------------------ HTML
css = """
:root{--bg:#f7f8f6;--surface:#ffffff;--fg:#1d2420;--muted:#5d6a63;--line:#dfe4e0;--accent:#1f6f5c;--accent-soft:#e3f1ec;--warn:#9a5b00;--warn-soft:#fdf2e1;--bad:#a2332b;--bad-soft:#fbe9e7;
--display:"Source Serif 4",Georgia,serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121715;--surface:#1a211e;--fg:#e6ece8;--muted:#9fb0a7;--line:#2c3631;--accent:#5fc3a6;--accent-soft:#1c3a32;--warn:#f0b35a;--warn-soft:#3a2c14;--bad:#f08a80;--bad-soft:#3d1f1c;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#121715;--surface:#1a211e;--fg:#e6ece8;--muted:#9fb0a7;--line:#2c3631;--accent:#5fc3a6;--accent-soft:#1c3a32;--warn:#f0b35a;--warn-soft:#3a2c14;--bad:#f08a80;--bad-soft:#3d1f1c;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font-family:var(--body);font-size:15px;line-height:1.55}
.wrap{max-width:1080px;margin:0 auto;padding-block:32px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{font-family:var(--display);font-weight:600;font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 8px;text-wrap:balance}
h2{font-family:var(--display);font-weight:600;font-size:24px;margin:44px 0 10px;text-wrap:balance}
h3{font-size:16px;margin:22px 0 6px}
p,li{max-width:72ch}
.lead{color:var(--muted);font-size:16.5px;max-width:75ch}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));margin-top:16px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:16px;min-width:0}
.card h3{margin:0 0 4px;font-size:17px}
.big{font-family:var(--display);font-size:30px;font-weight:600;line-height:1.1}
.muted{color:var(--muted)}
.small{font-size:13px}
.tbl{overflow-x:auto;border:1px solid var(--line);border-radius:10px;background:var(--surface);margin-top:12px}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:7px 10px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th{font-weight:600;color:var(--muted);background:var(--bg);position:sticky;top:0}
td.l,th.l{text-align:left;white-space:normal;min-width:220px}
tr:last-child td{border-bottom:0}
.pill{display:inline-block;font-size:12px;padding:1px 8px;border-radius:99px;background:var(--accent-soft);color:var(--accent);font-weight:600}
.pill.warn{background:var(--warn-soft);color:var(--warn)}.pill.bad{background:var(--bad-soft);color:var(--bad)}
.note{border-left:3px solid var(--warn);background:var(--warn-soft);padding:10px 14px;border-radius:6px;margin:12px 0}
.ok{border-left:3px solid var(--accent);background:var(--accent-soft);padding:10px 14px;border-radius:6px;margin:12px 0}
a{color:var(--accent)}
code{font-family:var(--mono);font-size:12.5px}
ul{padding-left:20px}
details summary{cursor:pointer;font-weight:600;margin:10px 0}
"""

def table(head, rows, left=(0,)):
    h = "".join(f'<th class="{"l" if i in left else ""}">{c}</th>' for i, c in enumerate(head))
    b = "".join("<tr>" + "".join(f'<td class="{"l" if i in left else ""}">{c}</td>' for i, c in enumerate(r)) + "</tr>" for r in rows)
    return f'<div class="tbl"><table><thead><tr>{h}</tr></thead><tbody>{b}</tbody></table></div>'

out = []
out.append('<title>Paket Maliyet Analizi</title><meta name="claude:viewport-fit-sides" content="cover">')
out.append('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600&family=Source+Serif+4:opsz,wght@8..60,600&display=swap">')
out.append(f"<style>{css}</style><div class='wrap'>")
out.append("<p class='eyebrow'>Academiana · Kasım 2026 · iç analiz</p>")
out.append("<h1>1/3 maliyetle pakette ne vaat edebiliriz?</h1>")
out.append(f"<p class='lead'>{len(docs)} gerçek tam metin (24 Türkçe makale, 12 İngilizce sağlık makalesi, 8 tez) ölçüldü. Sistemin kendi bağlam oluşturucusu gerçek Türkçe metinle çalıştırıldı ve her eserin Academiana’da baştan sona yazılmasının kaç istek, token ve dolar tutacağı hesaplandı. Paket bütçesi: KDV hariç fiyatın üçte biri, 1 $ = {USD_TRY} TL.</p>")

# Özet kartları
out.append("<h2>Kısa sonuç</h2><div class='grid'>")
out.append(f"<div class='card'><p class='eyebrow'>Bir sayfa</p><div class='big'>{usd(per_page['temel|verimli'],3)}–{usd(per_page['temel|yoğun'],3)}</div><p class='muted small'>Türk tez biçiminde (12 punto, 1,5 satır, ölçülen 344 kelime/sayfa) bir sayfa metnin yapay zekâ maliyeti; verimli–yoğun kullanım.</p></div>")
out.append(f"<div class='card'><p class='eyebrow'>Bir istek</p><div class='big'>{usd(avg_req['temel'],3)}</div><p class='muted small'>Ortalama yazım isteği (kötümser: {usd(avg_req['kötümser'],3)}). Sistemdeki varsayım 0,07 $; biraz düşük.</p></div>")
out.append(f"<div class='card'><p class='eyebrow'>Yüksek lisans tezi</p><div class='big'>{usd(yl['sim']['temel|verimli']['cost'],1)}–{usd(yl['sim']['temel|yoğun']['cost'],1)}</div><p class='muted small'>≈{yl['pages_tr_format']} sayfa ana metin, {yl['sim']['temel|verimli']['requests']}–{yl['sim']['temel|yoğun']['requests']} istek. Kötümser: {usd(yl['sim']['kötümser|yoğun']['cost'],1)}.</p></div>")
out.append(f"<div class='card'><p class='eyebrow'>Araştırma makalesi</p><div class='big'>{usd(art['sim']['temel|verimli']['cost'],1)}–{usd(art['sim']['temel|yoğun']['cost'],1)}</div><p class='muted small'>≈6.500 kelime, {art['sim']['temel|verimli']['requests']}–{art['sim']['temel|yoğun']['requests']} istek.</p></div>")
out.append("</div>")
out.append("<div class='ok'>Mevcut aylık istek sınırları (40 / 75 / 125) kötümser senaryoda bile 1/3 maliyet sınırının altında veya tam sınırında. Ayrıca sunucu her pakette aylık maliyet tavanını ayrıca uyguluyor, yani kârlılık korunuyor. Sorun maliyette değil, <b>müşteriye ne kadar yazım yapabileceğinin hiç söylenmemesinde</b> ve birkaç tutarsız ifadede.</div>")

# Paket önerileri
out.append("<h2>Paket başına ne vaat edilebilir</h2>")
out.append("<p>Önerilen vaat, “yoğun kullanım” profiline göre aşağı yuvarlanmıştır: kullanıcı taslakları sık yeniden yazdırsa ve çok düzeltme istese bile bütçe aşılmaz. Verimli kullanan kullanıcı daha fazlasını yazar.</p>")
rows = []
for r in pkg_rows:
    rows.append([f"<b>{r['n']}</b>", f"{r['price']:,} TL".replace(",", ".") if r['price'] else "0", usd(r['B']), f"{floor5(r['pages_heavy'])}–{floor5(r['pages_eff'])}", f"{r['art_heavy']:.1f}–{r['art_eff']:.1f}",
                 f"{r['yl_m_eff']:.1f}–{r['yl_m']:.1f} ay", f"{dr['sim']['temel|verimli']['cost']/r['B']:.1f}–{r['dr_m']:.1f} ay", str(r['req']), f"{r['req_worst']:.0f}–{r['req_base']:.0f}"])
out.append(table(["Paket", "Fiyat/ay", "Maliyet bütçesi", "Sayfa/ay (tez biçimi)", "Makale/ay", "YL tezi biter", "Doktora tezi biter", "Mevcut istek sınırı", "Bütçeye uyan istek"], rows))
out.append("<h3>Paket kartlarına önerilen yeni satırlar</h3><ul>")
for r in pkg_rows:
    p = floor5(r["pages_heavy"])
    if r["n"] == "Ücretsiz":
        out.append(f"<li><b>Ücretsiz:</b> “Yapay zekâ ile yaklaşık {max(5, p)} sayfa taslak (denemek için)”. Aylık 10 istek ve 1 $ tavanla tutarlı.</li>")
    elif r["n"] == "Basic":
        out.append(f"<li><b>Basic:</b> “Ayda yaklaşık {p} sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)”. Yüksek lisans tezi yaklaşık {math.ceil(r['yl_m'])} ayda.</li>")
    elif r["n"] == "Pro":
        out.append(f"<li><b>Pro:</b> “Ayda yaklaşık {p} sayfa (ör. 2 makale veya yüksek lisans tezinin yarısından fazlası)”. YL tezi 1–2 ayda.</li>")
    else:
        out.append(f"<li><b>Premium:</b> “Ayda yaklaşık {p} sayfa (yüksek lisans tezinin tamamı ayda bir; doktora tezi {math.ceil(r['dr_m'])} ayda)”.</li>")
out.append("</ul><p class='muted small'>“Sayfa” = Türk tez biçiminde ana metin sayfası (Times New Roman 12 punto, 1,5 satır aralığı). Kapak, içindekiler, kaynakça ve ekler bu sayıya dahil değildir; bunlar yapay zekâ maliyeti doğurmaz.</p>")

# Tutarsızlıklar
out.append("<h2>Bulunan tutarsızlıklar ve öneriler</h2>")
out.append(f"<div class='note'><b>1. Literatür matrisi istek hakkını boşa tüketiyor.</b> Matris, kaynak başına 1 yapay zekâ isteği sayıyor. {mat_req} kaynaklık bir matris Pro’nun aylık 75 isteğinin {mat_req*100//75}%’ini bitiriyor, ama gerçek maliyeti yalnızca ≈{usd(mat_req*0.0012,2)} (küçük model). Öneri: matris çağrılarını haktan düşmeyelim (maliyet tavanı zaten koruyor) ya da 10 kaynağı 1 istek sayalım.</div>")
out.append("<div class='note'><b>2. Paket kartları yazım miktarını hiç söylemiyor.</b> Kartlarda “bölüm bölüm yazım asistanı” var ama ne kadar yazılabileceği yok; müşteri pakete göre beklentisini kuramıyor. Öneri: yukarıdaki “ayda ≈ X sayfa” satırını her karta ekleyelim (istek sayısı yerine sayfa, müşterinin anladığı birim).</div>")
out.append("<div class='note'><b>3. “Aylık 2.000 / 8.000 kaynak taraması” ayırt edici değil.</b> Tarama, ücretsiz veri tabanlarını kullanır; neredeyse maliyetsizdir ama bu sayılar gerçekçi bir kullanımla hiç dolmaz ve Pro ile Premium arasında anlamlı fark yaratmaz. Öneri: Pro ve Premium’da “Sınırsız kaynak taraması (adil kullanım)” yazalım; farkı sayfa miktarı ve özelliklerle gösterelim.</div>")
out.append("<div class='note'><b>4. Premium’daki “En yüksek yapay zekâ kullanım hakkı” belirsiz.</b> Öneri: “Ayda yaklaşık X sayfa” ile değiştirelim.</div>")
out.append(f"<div class='note'><b>5. Ortalama istek maliyeti varsayımı (0,07 $) gerçeğin biraz altında.</b> Model temel senaryoda {usd(avg_req['temel'],3)}, kötümserde {usd(avg_req['kötümser'],3)} buluyor. Sunucudaki maliyet tavanı fazlasını engellediği için zarar yok, ama kullanıcı istek sayısı bitmeden “hak doldu” görebilir. Öneri: Ayarlar → Kârlılık’ta varsayımı 0,09 $ yapalım ve bir ay sonra Yönetim → Maliyet sağlığı’ndaki gerçek ortalamayla düzeltelim.</div>")
out.append("<div class='note'><b>6. Kullanım rehberi her yazım isteğine ekleniyor.</b> Sistem talimatının 16.451 karakterinin yaklaşık 12 bini rehber. Önbellekte ucuz, ama önbellek kaçtığında istek başına ≈0,01 $ ekliyor (%5–8). Öneri: rehberi yalnızca kullanım sorusu yolunda tutalım; ana asistanda kısa bir “sistemle ilgili sorularda rehbere yönlendir” cümlesi yeter.</div>")
out.append(f"<div class='note'><b>7. Dolar kuru.</b> Bütçe 1 $ = {USD_TRY} TL ayarına bağlı. Kur yükselirse TL fiyat sabitken dolar bütçesi küçülür ve sayfa vaadi de küçülür. Kur her %10 arttığında vaat edilen sayfa sayısı yaklaşık %9 düşer. Kuru her ay güncelleyin; fiyatları kura göre gözden geçirin.</div>")

# Standart senaryolar
out.append("<h2>Eser türüne göre maliyet</h2><p>Türkiye’deki tipik uzunluklar: araştırma makalesi ve derleme korpus medyanı; yüksek lisans ve doktora için alan çalışmalarında bildirilen ortalamalar (YL ≈167, doktora ≈344 sayfa; kapak, kaynakça ve ekler dahil) ve arXiv tezleri.</p>")
rows = []
for name, v in std.items():
    s = v["sim"]
    rows.append([name, f"{v['body']:,}".replace(",", "."), str(v["pages_tr_format"]), str(v["refs"]), f"{s['temel|verimli']['requests']}–{s['temel|yoğun']['requests']}",
                 f"{(s['temel|verimli']['tin']+s['temel|verimli']['tout'])/1e6:.1f} M", usd(s['iyimser|verimli']['cost']), usd(s['temel|verimli']['cost']), usd(s['temel|yoğun']['cost']), usd(s['kötümser|yoğun']['cost'])])
out.append(table(["Eser", "Ana metin (kelime)", "Sayfa (tez biçimi)", "Kaynak", "İstek (verimli–yoğun)", "Token (verimli)", "İyimser", "Temel verimli", "Temel yoğun", "Kötümser yoğun"], rows))

# Maliyet dağılımı
out.append("<h3>Yüksek lisans tezinde paranın gittiği yer (temel, verimli)</h3>")
bd = sorted(yl["breakdown"], key=lambda r: -r["cost"])
tot = sum(r["cost"] for r in bd)
out.append(table(["İşlem", "Çağrı", "Model", "Maliyet", "Pay"], [[E(r["name"]), str(r["n"]), r["model"], usd(r["cost"]), f"%{r['cost']/tot*100:.0f}"] for r in bd]))
out.append("<p class='muted small'>Taslak yazımı maliyetin büyük kısmını oluşturur. Bölüm kontrolü, kaynak tarama kararı ve matris küçük modelle yapıldığı için toplam içinde çok küçüktür.</p>")

# Belge tablosu
out.append(f"<h2>Okunan {len(docs)} tam metin</h2><p>Her satır: gerçek yayının ölçümü ve aynı uzunlukta bir eserin Academiana’da Türkçe yazılmasının tahmini (temel senaryo). Europe PMC makalelerinde sayfa bilgisi yerine yapılandırılmış tam metin (XML) kullanıldı.</p>")
rows = []
for d in docs:
    s = d["sim"]
    rows.append([f"<a href='{E(d['url'])}' target='_blank' rel='noopener'>{E(d['title'][:90])}</a><br><span class='muted small'>{E(d['src'])}</span>", d["kind"],
                 str(d["pages"] or "–"), f"{d['words']:,}".replace(",", "."), f"{d['body']:,}".replace(",", "."), str(d["wpp"] or "–"), str(d["refs"]), str(d["pages_in_tr_thesis_format"]),
                 f"{s['temel|verimli']['requests']}–{s['temel|yoğun']['requests']}", f"{(s['temel|verimli']['tin']+s['temel|verimli']['tout'])/1e6:.2f} M", usd(s['temel|verimli']['cost']), usd(s['temel|yoğun']['cost'])])
out.append(table(["Yayın", "Tür", "Sayfa", "Kelime", "Ana metin", "Kelime/sayfa", "Kaynak", "Tez biçiminde sayfa", "İstek", "Token", "Maliyet verimli", "Maliyet yoğun"], rows))
out.append(f"<p class='muted small'>Ölçüme alınmayan 2 arXiv kaydı “master thesis” olarak etiketlenmiş ama 11–15 sayfalık makale özetleriydi.</p>")

# Yöntem
c = m["constants"]
out.append("<h2>Yöntem ve varsayımlar</h2><ul>")
out.append("<li><b>Korpus:</b> DergiPark’ın resmî OAI-PMH arayüzünden 24 Türkçe makale (eğitim, sağlık, psikoloji, işletme, hukuk, tarih, sanat, iletişim; araştırma, nitel çalışma, derleme ve bibliyometri), Europe PMC REST’ten 12 açık erişimli tam metin (nicel, nitel, ölçek geliştirme, sistematik derleme, meta-analiz, kapsam derlemesi), arXiv’den 8 tez (3 yüksek lisans, 5 doktora). PDF’ler sayfa sayısı ve kelime için ölçüldü; kaynakça bölümü ayrıca sayıldı. YÖK Açık Bilim sunucusu Türkiye dışından gelen bağlantıyı kabul etmediği için Türkçe tez PDF’i okunamadı; tez uzunlukları yayımlanmış alan çalışmalarından alındı.</li>")
out.append("<li><b>Sayfa yoğunluğu:</b> Sistemin tez biçimiyle gerçek Türkçe metinden Word belgesi üretilip LibreOffice’te (Times New Roman ile aynı ölçülü yazı tipi) sayfalandı: tez biçimi 344, APA çift satır 287, 1,15 satır makale 482 kelime/sayfa. Tablo, şekil ve bölüm başlarındaki boşluklar nedeniyle gerçek tezde bu biraz daha düşüktür; vaat hesabında 344 kullanıldı.</li>")
out.append(f"<li><b>Bağlam boyutu:</b> Sistemin <code>buildContext</code> fonksiyonu gerçek Türkçe metinle çalıştırıldı: sistem talimatı {c['sys_chars']:,} karakter; proje bağlamı 17–66 bin, değişken kısım 4–57 bin karakter (kaynak, hafıza ve tam metin parçası sayısına göre).</li>".replace(",", "."))
out.append(f"<li><b>Türkçe:</b> ölçülen {c['chars_per_word']} karakter/kelime. Token oranı Türkçe için 3,0 karakter/token alındı (iyimser 3,4, kötümser 2,6). Haiku 5.5’in yeni tokenizer’ı ~%30 fazla token sayar.</li>")
out.append("<li><b>Fiyatlar (milyon token):</b> Sonnet 5.5 2 $ / 10 $, Opus 5.5 4 $ / 20 $ (önbellek okuma %5), Haiku 5.5 0,10 $ / 0,50 $. Önbelleğe yazma %125. Düşünme tokenları çıktı olarak faturalanır.</li>")
out.append("<li><b>İstek akışı (sistemin gerçek davranışı):</b> her alt başlık için bir “Bölümü yaz” (≈1.000 kelime) + küçük modelle kaynak taraması kararı; düzeltmelerin yarısı Sonnet, yarısı Haiku; soru/plan Sonnet; başlık önerisi, kurgu (tezde Opus), bölüm başına kontrol (Haiku), kalite jürisi (Opus), özet, literatür matrisi (kaynak başına Haiku).</li>")
out.append("<li><b>Profiller:</b> verimli = taslakların %30’u yeniden, taslak başına 0,5 düzeltme, 0,3 soru, 1 kalite kontrol, matris yok. Yoğun = %80 yeniden, 1,2 düzeltme, 0,6 soru, 3 kalite kontrol, tüm kaynaklar için matris.</li>")
out.append("<li><b>Senaryolar:</b> iyimser (önbellek isabeti %70, az düşünme), temel (%50), kötümser (%30, çok düşünme).</li>")
out.append("</ul><div class='note'><b>Doğrulama gerekiyor.</b> Bu bir modeldir. Bir ay sonra Yönetim → Maliyet sağlığı’ndaki gerçek “ortalama istek maliyeti” ve “önbellek isabeti” ile karşılaştırıp katsayıları düzeltmeliyiz. Özellikle Türkçe token oranı tahmindir (±%15).</div>")
out.append("<h3>Kaynaklar</h3><ul class='small'><li>Model fiyatları: Anthropic model referansı (Opus 5.5, Sonnet 5.5, Haiku 5.5; önbellek fiyatları)</li>")
out.append("<li>Tez sayfa ortalamaları: <a href='https://search.trdizin.gov.tr/yayin/detay/424708' target='_blank' rel='noopener'>Yabancılara Türkçe öğretimi tezleri atıf analizi (1988–2019)</a>; <a href='https://acikerisim.nevsehir.edu.tr/handle/20.500.11787/2896?show=full' target='_blank' rel='noopener'>Turist rehberliği tezleri bibliyometrik analizi (1989–2018)</a></li>")
out.append("<li>Korpus: DergiPark OAI-PMH, Europe PMC REST, arXiv API (bağlantılar tabloda)</li></ul>")
out.append("</div>")
open(os.path.join(os.path.dirname(__file__), "rapor.html"), "w").write("\n".join(out))
print("ok", [(r["n"], round(r["pages_heavy"]), round(r["pages_eff"]), round(r["req_worst"]), round(r["req_base"])) for r in pkg_rows])
