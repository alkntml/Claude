import { readFileSync, writeFileSync } from "fs";
import * as S from "./src/lib/stats/tests";
const D = "/tmp/claude-0/-home-user-Claude/9c416760-27e3-5a06-bd30-ad2277884a68/scratchpad/tl/";
const csv = (f: string) => { const [h, ...r] = readFileSync(D + "stats/" + f, "utf8").trim().split("\n").map((l) => l.split(",").map((x) => x.replace(/"/g, ""))); return r.map((row) => Object.fromEntries(h.map((k, i) => [k, row[i]]))); };
const mt = csv("mtcars.csv"), iris = csv("iris.csv"), pg = csv("plantgrowth.csv"), tg = csv("toothgrowth.csv"), sl = csv("sleep_wide.csv");
const num = (rows: any[], k: string) => rows.map((r) => Number(r[k]));
const out: Record<string, number> = {};
const sets: Record<string, number[]> = { mpg: num(mt, "mpg"), sepal: num(iris, "Sepal.Length"), pg_ctrl: num(pg, "weight").slice(0, 10), sleep1: num(sl, "a"), n3: [1, 2, 4], n4: [1, 2, 4, 9], n5: [2.1, 3.5, 1.2, 8.8, 4.4], tg: num(tg, "len"), fib: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55], n11: [3, 7, 2, 9, 4, 4, 8, 1, 6, 5, 12], n12: [3, 7, 2, 9, 4, 4, 8, 1, 6, 5, 12, 30] };
for (const [k, v] of Object.entries(sets)) { const s = S.shapiroWilk(v); out[`sw.${k}.W`] = s.W; out[`sw.${k}.p`] = s.p; }
// R matrix(c(a,b,c,d),2) sütun sırası: [[a,c],[b,d]]
const tabs: Record<string, number[]> = { tea: [3, 1, 1, 3], t2: [10, 3, 2, 15], t3: [1, 9, 11, 3], t4: [0, 5, 6, 1], t5: [20, 15, 12, 30] };
for (const [k, [a, b, c, d]] of Object.entries(tabs)) { const t = [[a, c], [b, d]]; out[`fisher.${k}.p`] = S.fisherExact2x2(t).p; const y = S.yatesChi2(t); out[`yates.${k}.chi2`] = y.chi2; out[`yates.${k}.p`] = y.p; }
const pv = [0.01, 0.04, 0.03, 0.005, 0.2, 0.049];
for (const m of ["holm", "BH"] as const) S.pAdjust(pv, m).forEach((x, i) => (out[`padj.${m}.${i + 1}`] = x));
const grp = (rows: any[], dv: string, g: string) => { const levels = [...new Set(rows.map((r) => r[g]))]; return { levels, groups: levels.map((l) => rows.filter((r) => r[g] === l).map((r) => Number(r[dv]))) }; };
for (const [nm, G] of [["pg", grp(pg, "weight", "group")], ["iris", grp(iris, "Sepal.Width", "Species")]] as const) {
  const a = S.oneWayAnova(G.groups);
  S.tukeyHSD(G.groups, G.levels, a).forEach((r, i) => { out[`tukey.${nm}.${i + 1}.diff`] = r.diff; out[`tukey.${nm}.${i + 1}.lwr`] = r.lwr; out[`tukey.${nm}.${i + 1}.upr`] = r.upr; out[`tukey.${nm}.${i + 1}.p`] = r.p; });
  S.gamesHowell(G.groups, G.levels).forEach((r, i) => { out[`gh.${nm}.${i + 1}.diff`] = r.diff; out[`gh.${nm}.${i + 1}.lwr`] = r.lwr; out[`gh.${nm}.${i + 1}.upr`] = r.upr; out[`gh.${nm}.${i + 1}.p`] = r.p; });
  const ci = S.eta2CI(a.F, a.dfBetween, a.dfWithin); out[`eta.${nm}.e`] = a.etaSquared; out[`eta.${nm}.lo`] = ci[0]; out[`eta.${nm}.hi`] = ci[1];
}
const am0 = mt.filter((r) => r.am === "0").map((r) => Number(r.mpg)), am1 = mt.filter((r) => r.am === "1").map((r) => Number(r.mpg));
let t = S.independentT(am0, am1); let ci = S.dCI(t.student.t, t.student.df, Math.sqrt(1 / am0.length + 1 / am1.length)); out["d.mt.d"] = t.cohensD; out["d.mt.lo"] = ci[0]; out["d.mt.hi"] = ci[1];
const oj = tg.filter((r) => r.supp === "OJ").map((r) => Number(r.len)), vc = tg.filter((r) => r.supp === "VC").map((r) => Number(r.len));
t = S.independentT(oj, vc); ci = S.dCI(t.student.t, t.student.df, Math.sqrt(1 / oj.length + 1 / vc.length)); out["d.tg.d"] = t.cohensD; out["d.tg.lo"] = ci[0]; out["d.tg.hi"] = ci[1];
const pt = S.pairedT(num(sl, "a"), num(sl, "b")); ci = S.dCI(pt.t, pt.df, 1 / Math.sqrt(pt.df + 1)); out["d.paired.d"] = pt.cohensDz; out["d.paired.lo"] = ci[0]; out["d.paired.hi"] = ci[1];
const os = S.oneSampleT(num(mt, "mpg"), 20); ci = S.dCI(os.t, os.df, 1 / Math.sqrt(os.df + 1)); out["d.one.d"] = os.cohensD; out["d.one.lo"] = ci[0]; out["d.one.hi"] = ci[1];
const X = mt.map((r) => [Number(r.wt), Number(r.hp)]), y = num(mt, "mpg");
const reg = S.linearRegression(y, X, ["wt", "hp"]); const dg = S.regressionDiagnostics(y, X, reg);
out["reg.bp.stat"] = dg.breuschPagan.stat; out["reg.bp.p"] = dg.breuschPagan.p; out["reg.dw"] = dg.durbinWatson; out["reg.sw.W"] = dg.shapiro!.W; out["reg.sw.p"] = dg.shapiro!.p;
const ref = Object.fromEntries(readFileSync(D + "stats2/ref2.tsv", "utf8").trim().split("\n").map((l) => { const [k, v] = l.split("\t"); return [k, Number(v)]; }));
const rows = Object.keys(ref).map((k) => { const r = ref[k], e = out[k]; const tol = Math.max(1e-6, Math.abs(r) * 1e-5); return { id: k, r, e, diff: e === undefined ? null : Math.abs(e - r), ok: e !== undefined && (Math.abs(e - r) <= tol || (r < 1e-12 && e < 1e-12) || (k.startsWith("gh.") && k.endsWith(".p") && Math.abs(Math.round(e * 1000) / 1000 - r) < 1e-9)) }; });
writeFileSync(D + "stats2/compare2.json", JSON.stringify(rows, null, 1));
for (const r of rows.filter((x) => !x.ok)) console.log("FARK", r.id, "R", r.r, "motor", r.e);
console.log("eşleşen", rows.filter((x) => x.ok).length, "/", rows.length, "en büyük fark", Math.max(...rows.filter((x) => x.ok).map((x) => x.diff!)));
