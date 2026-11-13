import type { BlogPostEn } from "./types";

/** İngilizce sürümler, 7. dosya (D164) */
export const EN_7: Record<string, BlogPostEn> = {
  "t-testi-nasil-yapilir-ve-yorumlanir": {
    slug: "how-to-run-and-interpret-a-t-test",
    title: "How to Run and Interpret a t-Test: Independent and Paired Samples Guide",
    seoTitle: "How to Run, Interpret and Report a t-Test (APA 7)",
    description: "Independent and paired samples t-tests: which to choose, Levene and Welch, effect size, confidence interval and APA 7 reporting, with a worked example.",
    keywords: ["how to run a t-test", "independent samples t-test interpretation", "paired samples t-test", "t-test APA reporting", "Welch t-test", "Cohen's d"],
    cta: { text: "Upload your data file to your work and run the t-test from “Tools” → “Statistical analysis”; get an APA-style report with Levene’s test and effect size.", label: "Run my analysis" },
    body: `The t-test is the most common parametric test for checking whether two means differ significantly. Two types appear most often in theses: the **independent samples t-test** (two separate groups) and the **paired samples t-test** (two measurements of the same people). This guide walks through both, interpreting every number.

All numbers in this article were computed from the sample data below with Academiana’s statistics engine; you can enter the data into your own software and get the same results.

## Which t-test should I choose?

- **Independent samples t-test:** compares the means of two different groups. Example: exam scores of an experimental and a control group.
- **Paired (dependent) samples t-test:** compares two measurements of the same participants. Example: scores before and after training.
- **One-sample t-test:** compares a group mean with a known value (e.g. the midpoint of a scale).

With three or more groups, use one-way ANOVA instead. For an overview of which test to use when, see our [guide to choosing a statistical test](/en/blog/which-statistical-test-to-use).

## Assumptions

1. **The dependent variable is continuous** (scores, times, scale totals).
2. **Observations are independent:** one participant’s score does not affect another’s.
3. **Normality:** in the independent test each group, in the paired test the difference scores, should be approximately normal. See our [normality testing guide](/en/blog/normality-test-skewness-kurtosis).
4. **Equal variances** (independent test only): checked with Levene’s test.

## Worked example 1: Independent samples t-test

A study examines the effect of a teaching method on exam performance. The two groups scored:

- **Experimental group (n = 12):** 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86
- **Control group (n = 12):** 68, 74, 70, 79, 62, 71, 73, 76, 65, 72, 69, 75

### 1. Descriptive statistics

Experimental group M = 79.92 (SD = 7.04), control group M = 71.17 (SD = 4.76). The raw difference is 8.75 points.

### 2. Levene’s test: which row do I read?

Levene’s test gave F(1, 22) = 1.87, p = .185. Because p is above .05, equal variances are not rejected and you read the **equal variances (Student) row**. Had Levene’s test been significant (p < .05), you would read the **Welch** row. Here both rows give almost the same result: Student t(22) = 3.57, p = .002; Welch t(19.33) = 3.57, p = .002.

> Some methodologists recommend using Welch’s test by default, because it performs close to Student’s test when variances are equal and is more reliable when they are not. State which one you used in your method section.

### 3. Significance, confidence interval and effect size

- **t(22) = 3.57, p = .002:** the difference is statistically significant.
- **95% CI of the difference [3.66, 13.84]:** the interval excludes zero; the true difference is likely between 3.7 and 13.8 points.
- **Cohen’s d = 1.46:** by Cohen’s (1988) rough benchmarks (0.2 small, 0.5 medium, 0.8 large) this is a large effect.

The p value only tells you whether the difference can be explained by chance; the effect size and confidence interval show how large it is. That is why APA 7 asks for both.

### 4. Reporting in APA 7

“Exam scores in the experimental group (M = 79.92, SD = 7.04) were significantly higher than in the control group (M = 71.17, SD = 4.76), t(22) = 3.57, p = .002, d = 1.46, 95% CI [3.66, 13.84].”

In APA style, statistical symbols (M, SD, t, p, d) are italicised; p has no leading zero (.002), and values below .001 are reported as “p < .001”.

## Worked example 2: Paired samples t-test

Ten participants’ scores before and after a training programme:

- **Pre-test:** 12, 15, 11, 14, 10, 13, 16, 12, 14, 11
- **Post-test:** 14, 18, 13, 15, 13, 15, 19, 14, 17, 12

Pre-test M = 12.80 (SD = 1.93), post-test M = 15.00 (SD = 2.31). Mean difference −2.20 (SD = 0.79). Result: **t(9) = −8.82, p < .001**, 95% CI of the difference [−2.76, −1.64], effect size **dz = 2.79**. The two measurements correlate at r = .95.

The negative t only reflects the order of subtraction (pre − post); interpret the means: post-test scores are higher.

Reporting example: “Participants’ post-test scores (M = 15.00, SD = 2.31) were significantly higher than their pre-test scores (M = 12.80, SD = 1.93), t(9) = −8.82, p < .001, dz = 2.79.”

> In the paired test the effect size is based on the standard deviation of the difference scores (dz). When the two measurements are strongly correlated, dz can be much larger than d for independent groups; say which one you report.

## Common mistakes

- Running an **independent** t-test on two measurements of the same people
- Reading a random row without checking Levene’s test
- Reporting only p and leaving out effect size and confidence interval
- Writing “p = .000” (correct: p < .001)
- Ignoring the non-parametric alternative (Mann–Whitney U or Wilcoxon) for small, non-normal samples
- Not calculating the required sample size beforehand: see our [sample size guide](/en/blog/how-to-calculate-sample-size) and the free [sample size calculator](/en/araclar/orneklem-hesaplayici).

## Placing it in your results chapter

Report t-test results in the order of your research questions; if there are several comparisons, put means, SDs, t, df, p and d in a single APA table. Interpret them in the discussion, together with the literature, not in the results. See our [results and discussion guide](/en/blog/how-to-write-results-and-discussion).

## t-tests with Academiana

Upload your data file (CSV or XLSX) to your work and choose an independent, paired or one-sample t-test under “Tools” → “Statistical analysis”. You get descriptive statistics, Levene’s test, the Student and Welch rows, the confidence interval and Cohen’s d together, with the recommended row clearly marked. The report can be inserted into your text in APA style. The AI never produces numbers: every value is computed from your uploaded data.`,
  },
  "normallik-testi-carpiklik-basiklik": {
    slug: "normality-test-skewness-kurtosis",
    title: "How to Test for Normality: Skewness, Kurtosis and Shapiro–Wilk Guide",
    seoTitle: "Normality Test: Skewness, Kurtosis and Shapiro–Wilk",
    description: "Is your data normally distributed? Skewness and kurtosis z values, Shapiro–Wilk and Kolmogorov–Smirnov, plots and what to do if not, with a worked example.",
    keywords: ["normality test", "skewness and kurtosis values", "interpreting skewness and kurtosis", "Shapiro-Wilk test", "normal distribution assumption", "parametric or non-parametric"],
    cta: { text: "Upload your data file; descriptive statistics show skewness and kurtosis with z scores, so you can choose a parametric or non-parametric test.", label: "Check my data" },
    body: `Parametric tests such as the t-test, ANOVA, Pearson correlation and regression assume that the data (or residuals) are approximately normal. Checking normality before the analysis is therefore one of the questions committees and reviewers ask most often. This guide shows three ways to examine normality and how to choose a test based on the result.

The numbers in this article were computed from the sample data with Academiana’s statistics engine.

## Three ways to examine normality

1. **Numerical indicators:** skewness and kurtosis and their z scores.
2. **Normality tests:** Shapiro–Wilk and Kolmogorov–Smirnov (with the Lilliefors correction).
3. **Plots:** histogram, Q–Q plot and box plot.

It is better to consider all three together than to rely on one. In large samples, normality tests flag even trivial deviations; in small samples they can miss clear ones.

## What are skewness and kurtosis?

- **Skewness** describes symmetry. 0 means perfectly symmetric. A positive value indicates a longer tail to the right (towards high values), a negative value a longer tail to the left.
- **Kurtosis** describes how heavy the tails are compared with a normal distribution. In the “excess kurtosis” reported by programs such as SPSS, the normal distribution is 0.

Raw skewness and kurtosis depend on sample size, so each value is divided by its standard error to obtain a **z score**: z = skewness / standard error.

## Which cut-offs are used?

There is no single universal cut-off. A frequently cited recommendation (Kim, 2013):

- **Small samples (n < 50):** the distribution is not considered normal if the absolute z of skewness or kurtosis exceeds 1.96.
- **Medium samples (50 ≤ n < 300):** use z = 3.29.
- **Large samples (n ≥ 300):** look at raw values and plots instead of z; absolute skewness above 2 or absolute kurtosis above 7 indicates substantial non-normality.

Some sources in the social sciences treat skewness and kurtosis within ±1 or ±2 as acceptable. State the criterion you used, with its source, in your method section.

## Worked example

### Example 1: Approximately normal

Scores (n = 12): 72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86

- Mean 79.92, standard deviation 7.04
- Skewness −0.47, z = −0.73
- Kurtosis −0.21, z = −0.17

Both z scores are below 1.96 in absolute value. There is no clear departure from normality; a parametric test (e.g. a t-test) can be used.

### Example 2: Right-skewed

Hours spent in the library in a week (n = 18): 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 12, 15, 21

- Mean 6.89, standard deviation 4.80
- Skewness 1.89, z = 3.52
- Kurtosis 3.64, z = 3.51

Both z scores clearly exceed 1.96. A few high values pull the distribution to the right. Mean and standard deviation can be misleading here; report the median and interquartile range and consider non-parametric tests for comparisons.

## Shapiro–Wilk or Kolmogorov–Smirnov?

- **Shapiro–Wilk** has generally been found more powerful at detecting non-normality, especially in small and medium samples (Razali & Wah, 2011). It is the test most theses report.
- **Kolmogorov–Smirnov** should be used with the Lilliefors correction when the mean and standard deviation are estimated from the data.

In both tests, **p > .05** means normality is not rejected; **p < .05** means the distribution differs significantly from normal. Reporting example: “Scores met the normality assumption, W(12) = …, p = ….” (Use the values from your own output.)

## What if the data are not normal?

- **Use the non-parametric counterpart:** Mann–Whitney U instead of the independent t-test, Wilcoxon signed-rank instead of the paired t-test, Kruskal–Wallis instead of one-way ANOVA, Spearman instead of Pearson.
- **Inspect outliers:** data entry error or genuine observation? Do not delete genuine observations without justification.
- **Consider sample size:** in large samples the sampling distribution of the mean approaches normal, so t-tests and ANOVA are robust to mild departures.
- **Transformation:** a log or square-root transformation can reduce right skew, but results are then interpreted on the transformed scale.

See our [guide to choosing a statistical test](/en/blog/which-statistical-test-to-use) for which test fits which situation, and our [t-test guide](/en/blog/how-to-run-and-interpret-a-t-test) for comparing two means.

## Normality of scale scores

Individual Likert items are ordinal; normality is usually examined on the scale total or mean. Check the scale’s reliability before using the score: our [Cronbach’s alpha guide](/en/blog/cronbach-alpha-explained) and free [Cronbach’s alpha calculator](/en/araclar/cronbach-alfa) help with this step.

## Checking normality with Academiana

When you upload a data file to your work, the descriptive statistics under “Statistical analysis” give the mean, standard deviation, skewness and kurtosis with z scores for each variable. Academiana does not compute the Shapiro–Wilk test in this version; run it in a program such as SPSS, R or JASP and add the result to your text. For non-normal data you can run Mann–Whitney U and Kruskal–Wallis directly in Academiana.`,
  },
  "isnad-atif-sistemi-rehberi": {
    slug: "isnad-citation-style-guide",
    title: "ISNAD Citation Style Guide: In-Text Citation and Bibliography Examples",
    seoTitle: "ISNAD Citation Style: In-Text and Bibliography Examples",
    description: "ISNAD 2nd edition in-text (author-date) citation and bibliography rules: books, articles, multi-author works, page numbers, DOI examples and common mistakes.",
    keywords: ["ISNAD citation style", "ISNAD bibliography examples", "ISNAD in-text citation", "ISNAD 2nd edition", "ISNAD journal article", "Turkish citation style"],
    cta: { text: "Add your sources to your work and choose ISNAD; in-text citations and the bibliography are generated automatically, and switching style is one click.", label: "Write with ISNAD" },
    body: `The ISNAD Citation System was developed in Turkey and is required by many DergiPark journals, especially in theology, history, literature and parts of the social sciences. The current manual is the **2nd edition**, which offers two formats: **footnote** and **in-text (author-date)**. This guide covers the in-text format with examples.

The citation and bibliography examples were generated by Academiana’s citation engine in the “ISNAD 2 (in-text)” style. The authors, works and journals in the examples are **fictional**, for illustration only, and the DOI is a placeholder. Before submitting, always check the current rules on the official site (isnadsistemi.org) and the journal’s author guidelines.

## The two ISNAD formats

- **Footnote format:** citations are written as footnotes; the first citation gives the full reference, later ones a shortened form. A bibliography also appears at the end.
- **In-text format:** citations appear in parentheses in the sentence, with surname and year. The bibliography at the end has the same structure as in the footnote format.

The journal or graduate school decides which format to use. If your guidelines just say “ISNAD”, check which format is meant.

## In-text citation rules

### Single author and page number

Surname, year and, where needed, page number in parentheses. The page number follows the year after a comma, without “p.”:

- (Yılmaz, 2021, 45)

### Two authors

In in-text citations, the two surnames are joined with a hyphen:

- (Demir - Kaya, 2022)

When the authors are part of the sentence (narrative citation), only the year stays in parentheses. With English as the document language the engine writes “and”:

- Demir and Kaya (2022) examined the relationship between teacher self-efficacy and burnout.

### Multi-author works

For works with many authors, the first surname is followed by “vd.” in Turkish texts and “et al.” in English texts. The four-author example:

- (Smith et al., 2020)

### Several sources in one parenthesis

Separate them with semicolons:

- (Yılmaz, 2021; Demir - Kaya, 2022)

## Bibliography rules

ISNAD bibliographies are sorted alphabetically by surname. Unlike APA, the author’s **first name is written in full**, not abbreviated. Titles are capitalised (except conjunctions and prepositions).

### Book

Surname, First name. Book title (italic). Place: Publisher, year.

- Yılmaz, Ayşe. *Örnek Eğitim Araştırmaları*. Ankara: Örnek Yayınları, 2021.

### Journal article

Surname, First name. “Article title” (in quotation marks). Journal title (italic) volume/issue (year), page range. DOI.

- Demir, Mehmet - Kaya, Elif. “Öğretmen Öz Yeterliği ve Tükenmişlik: Bir Örnek Çalışma”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67. https://doi.org/10.0000/ornek.2022.002

Note that volume and issue are separated by a slash (14/2) and the year is in parentheses. A DOI, if available, is added as a link.

### Multi-author article

- Smith, John et al. “An Example Study”. *Example Journal* 8/1 (2020), 1-20.

## Key differences between APA 7 and ISNAD

The same article in both styles:

- **APA 7 in-text:** (Demir & Kaya, 2022)
- **ISNAD in-text:** (Demir - Kaya, 2022)
- **APA 7 reference:** Demir, M., & Kaya, E. (2022). … *Örnek Eğitim Dergisi, 14*(2), 45–67.
- **ISNAD reference:** Demir, Mehmet - Kaya, Elif. “…”. *Örnek Eğitim Dergisi* 14/2 (2022), 45-67.

In short: ISNAD writes first names in full, places the year after volume/issue, puts article titles in quotation marks and uses a hyphen instead of “&” between two authors. For APA rules see our [APA 7 citation guide](/en/blog/apa-7-citation-guide); for a comparison of styles see our [bibliography guide](/en/blog/how-to-write-a-bibliography-citation-styles).

## Common mistakes

- Using the in-text format when the journal requires footnotes (or vice versa)
- Abbreviating first names out of APA habit (“Yılmaz, A.”)
- Writing volume and issue as “14(2)”; ISNAD uses “14/2”
- A citation in the text missing from the bibliography, or vice versa
- Fixing citations by hand when switching style and leaving inconsistencies

## Building the bibliography quickly

If you have a DOI or a reference in another style, create an ISNAD reference with our free [bibliography generator](/en/araclar/kaynakca-olusturucu), or convert an existing bibliography with the [citation converter](/en/araclar/atif-donusturucu). If you keep your sources in Zotero or Mendeley, our [reference management guide](/en/blog/zotero-mendeley-reference-management-guide) explains how to import them.

## ISNAD with Academiana

In Academiana, citations are not typed as plain text but inserted as markers linked to sources. When you choose “ISNAD 2 (in-text)”, in-text citations and the bibliography are generated with the rules in this article; if a journal asks for APA, you switch style in one click. To add a page number, simply enter a locator for the citation. For journals that require footnote ISNAD, compare your bibliography with the journal’s guidelines.`,
  },
};
