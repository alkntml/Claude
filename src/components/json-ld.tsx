/** Yapılandırılmış veri betiği (JSON-LD). < karakteri kaçışlanır (betik kapanışı enjeksiyonuna karşı). */
export function JsonLd({ data }: { data: unknown }) {
  const list = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return <>{list.map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />)}</>;
}
