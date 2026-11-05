/**
 * Ücretsiz araçlar (D90): giriş gerektirmez. “Uydurma kaynak kontrolü” dışındakiler yapay zekâ KULLANMAZ;
 * hesaplamalar tarayıcıda yapılır, künye bilgisi yalnızca kayıt otoritelerinden (Crossref, DataCite, OpenAlex) alınır.
 */
export interface ToolInfo { id: string; path: string; title: string; short: string; ai: boolean }

export const TOOLS: ToolInfo[] = [
  { id: "fake_check", path: "/araclar/uydurma-kaynak-kontrolu", title: "Uydurma kaynak kontrolü", short: "Kaynakçanızdaki her kaynağın gerçekten var olup olmadığını veri tabanlarında kontrol edin.", ai: true },
  { id: "bibliography", path: "/araclar/kaynakca-olusturucu", title: "Kaynakça oluşturucu", short: "DOI veya başlıktan APA 7, ISNAD, MLA, Chicago ve diğer stillerde kaynakça hazırlayın.", ai: false },
  { id: "convert", path: "/araclar/atif-donusturucu", title: "Atıf stili dönüştürücü", short: "Hazır kaynakçanızı tek tıkla başka bir atıf stiline çevirin.", ai: false },
  { id: "sample_size", path: "/araclar/orneklem-hesaplayici", title: "Örneklem büyüklüğü hesaplayıcı", short: "Evren, güven düzeyi ve hata payına göre gereken örneklemi hesaplayın.", ai: false },
  { id: "alpha", path: "/araclar/cronbach-alfa", title: "Cronbach alfa hesaplayıcı", short: "Ölçeğinizin güvenirliğini, madde-toplam korelasyonlarıyla birlikte hesaplayın.", ai: false },
  { id: "survey_builder", path: "/araclar/anket-olusturucu", title: "Anket oluşturucu", short: "Anket sorularınızı hazırlayın, kontrol edin ve yazdırın ya da çevrim içi yayınlayın.", ai: false },
];

export const toolByPath = (path: string) => TOOLS.find((t) => t.path === path) ?? null;
