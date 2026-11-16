import type { BlogPostEn } from "./types";

/** English versions, file 8 (D197). Numbers are identical to the Turkish posts and checked by tests/blog-d197.test.ts. */
export const EN_8: Record<string, BlogPostEn> = {
  "tek-yonlu-anova-nasil-yapilir-ve-raporlanir": {
    slug: "one-way-anova-how-to-run-and-report",
    title: "One-Way ANOVA: How to Run, Interpret and Report It (Worked Example with Bonferroni)",
    seoTitle: "One-Way ANOVA: How to Run It and Report in APA 7",
    description: "One-way ANOVA step by step: assumptions, Levene’s test, the F table, eta squared, Bonferroni post hoc tests and APA 7 reporting, with a worked example.",
    keywords: ["how to run one-way ANOVA", "interpret ANOVA results", "report ANOVA APA 7", "Bonferroni post hoc", "eta squared", "ANOVA thesis"],
    cta: { text: "Upload your data file to your project and run “Tools” → “Statistical analysis” → “One-way analysis of variance (ANOVA)” to get the F table, eta squared and Tukey HSD / Games–Howell comparisons in APA format.", label: "Run my ANOVA" },
    body: `One-way analysis of variance (ANOVA) compares the means of **three or more independent groups** in a single test. Questions such as “Which of three teaching methods works best?” or “Do anxiety scores differ by year of study?” are usually tested with ANOVA in a thesis. This guide walks through every step, from choosing the test to reporting it in APA 7, interpreting each number on the same example data.

All numbers in this article were computed from the example data below with Academiana’s statistics engine. You can enter the data into your own software and get the same results.

## When should you use ANOVA?

- **The dependent variable must be continuous:** exam scores, scale totals, time.
- **The independent variable must be categorical with at least three levels:** method (A, B, C), year (1, 2, 3, 4), faculty.
- **The groups must be independent:** each participant belongs to one group only.

With two groups, use an [independent samples t-test](/en/blog/how-to-run-and-interpret-a-t-test) instead (with two groups, ANOVA’s F equals the square of t). If the same people were measured three or more times, you need a repeated measures ANOVA. For a general map of which test to use when, see our guide on [which statistical test to use](/en/blog/which-statistical-test-to-use).

### Why not run three separate t-tests?

Comparing three groups pairwise means three separate tests. If each is run at .05, the chance of at least one false “significant” result rises to about 14% (1 − 0.95³). ANOVA first asks one question with one test: “Is there any difference between the groups?” If there is, you find out where with corrected pairwise (post hoc) comparisons.

## Assumptions and how to check them

1. **Independent observations:** This comes from the research design and is justified in the methods section rather than tested.
2. **Normality:** Each group should be roughly normally distributed. Check skewness and kurtosis per group; see our [normality test guide](/en/blog/normality-test-skewness-kurtosis). With equal and adequate group sizes, ANOVA is fairly robust to small departures.
3. **Homogeneity of variances:** Group variances should be similar. Test this with Levene’s test. If Levene is significant (p < .05), prefer **Welch’s ANOVA** with Games–Howell comparisons.

If normality is seriously violated and groups are small, consider the non-parametric alternative, the **Kruskal–Wallis H test**.

## Worked example: three teaching methods

A researcher examines the effect of three teaching methods on exam performance. Each method has 10 students (N = 30):

- **Lecture:** 62, 70, 75, 58, 68, 73, 66, 79, 64, 71
- **Question and answer:** 70, 66, 78, 74, 81, 69, 72, 85, 63, 76
- **Project-based:** 75, 82, 71, 88, 79, 84, 69, 90, 77, 80

Research question: *Do students’ exam scores differ significantly by teaching method?*

### 1. Descriptive statistics

| Group | n | M | SD |
| --- | --- | --- | --- |
| Lecture | 10 | 68.60 | 6.33 |
| Question and answer | 10 | 73.40 | 6.80 |
| Project-based | 10 | 79.50 | 6.82 |

Means rise from lecture to project-based teaching, while the standard deviations are very similar, a first hint that homogeneity of variances is likely met.

### 2. Levene’s test

Levene’s test gave F(2, 27) = 0.03, p = .969. Because p is above .05, the assumption of equal variances is not rejected and the classic ANOVA table can be used.

### 3. The ANOVA table

| Source | SS | df | MS | F | p | η² |
| --- | --- | --- | --- | --- | --- | --- |
| Between groups | 596.87 | 2 | 298.43 | 6.74 | .004 | .33 |
| Within groups | 1195.30 | 27 | 44.27 | | | |
| Total | 1792.17 | 29 | | | | |

Reading it row by row:

- **SS (sum of squares):** Of the total variability in scores (1792.17), 596.87 comes from differences between groups and 1195.30 from individual differences within groups.
- **df (degrees of freedom):** Between groups = number of groups − 1 = 2; within groups = N − number of groups = 27.
- **MS (mean square):** SS divided by df. F is the ratio of between-groups MS to within-groups MS: 298.43 / 44.27 = 6.74.
- **F(2, 27) = 6.74, p = .004:** The difference between groups is too large to be explained by chance. At least two group means differ.
- **η² = .33:** 33% of the variability in scores is explained by teaching method, a large effect by Cohen’s (1988) benchmarks (.01 small, .06 medium, .14 large). In small samples you can also report the less biased **ω² = .28**.

### 4. Post hoc: which groups differ?

ANOVA only tells you that a difference exists somewhere. Bonferroni-corrected pairwise comparisons show where:

| Comparison | Mean difference | p (Bonferroni) |
| --- | --- | --- |
| Lecture – Question and answer | −4.80 | .355 |
| Lecture – Project-based | −10.90 | .003 |
| Question and answer – Project-based | −6.10 | .151 |

Only the difference between **lecture and project-based teaching** is significant. The question-and-answer group sits between the two and does not differ significantly from either.

> The Bonferroni correction multiplies each pairwise p value by the number of comparisons (here 3). It is conservative: it controls false positives well but can miss small differences. With more groups, alternatives such as Tukey’s HSD are common; justify your choice in the methods section.

### 5. Reading the result correctly

There are only 10 students per group here. The non-significant comparisons involving the question-and-answer group do not mean “no difference”; with a small sample, the test has low power to detect differences of this size. That is why you should calculate the required group size in advance: see our [sample size guide](/en/blog/how-to-calculate-sample-size) and the free [sample size calculator](/en/araclar/orneklem-hesaplayici).

## Reporting in APA 7

**In the text:**

“Exam scores differed significantly by teaching method, F(2, 27) = 6.74, p = .004, η² = .33. Bonferroni-corrected comparisons showed that students taught with the project-based method (M = 79.50, SD = 6.82) scored significantly higher than those taught by lecture (M = 68.60, SD = 6.33), p = .003. The question-and-answer group (M = 73.40, SD = 6.80) did not differ significantly from the other two groups.”

**Formatting rules:**

- Italicize F, p, M and SD; Greek letters such as η² are not italicized.
- Give both degrees of freedom in parentheses after F: F(2, 27).
- Do not put a leading zero before p (.004); if p is below .001, write “p < .001”, never “p = .000”.
- If you ran ANOVAs on several dependent variables, combine group means, SDs, F, p and η² in one table. For table format, see our [APA 7 tables and figures guide](/en/blog/apa-7-tables-and-figures).

## Common mistakes

- Interpreting post hoc results when the ANOVA itself was not significant
- Reporting classic ANOVA without checking Levene’s test
- Reporting only p and leaving out the effect size
- Applying a one-way (independent) ANOVA to repeated measurements of the same people
- Using uncorrected t-tests as post hoc tests
- Interpreting “not significant” as “the groups are equal”
- Discussing the result against the literature in the results section; interpretation belongs in the [discussion](/en/blog/how-to-write-results-and-discussion)

## ANOVA with Academiana

After uploading your data file (CSV or XLSX) to your project, choose “One-way analysis of variance (ANOVA)” under “Tools” → “Statistical analysis” and select the dependent and grouping variables. You get group descriptives, the ANOVA table, η² with its 95% CI, Levene’s test and, if the ANOVA is significant, post hoc comparisons (Tukey HSD with equal variances, Games–Howell otherwise) in APA format, which you can add to your document as a numbered table with one click. To show group means in a bar chart with error bars, use the “Create chart” tool. The numbers are not generated by AI; the site’s statistics engine computes them from your data.`,
  },
  "regresyon-analizi-apa-7-raporlama": {
    slug: "how-to-report-regression-apa-7",
    title: "How to Report Regression Results in APA 7: Simple and Multiple Linear Regression",
    seoTitle: "How to Report Regression Analysis in APA 7",
    description: "Simple and multiple linear regression: how to read R², F, B, β and confidence intervals, an APA 7 table and text example, multicollinearity and common mistakes.",
    keywords: ["how to report regression APA", "interpret multiple regression", "regression table APA 7", "standardized beta", "interpret R squared", "linear regression thesis"],
    cta: { text: "Upload your data file and use “Tools” → “Statistical analysis” → “Linear regression” to add an APA table with B, β, confidence intervals and the model summary to your document.", label: "Run my regression" },
    body: `Linear regression shows how well one or more variables (predictors) explain an outcome (the dependent variable) and how the outcome changes with them. Thesis questions such as “Does study time predict exam performance?” or “How much do self-efficacy and anxiety together explain burnout?” are tested with regression. This guide shows how to read the output line by line and report it in APA 7, using the same data for simple and multiple regression.

All numbers in this article were computed from the example data below with Academiana’s statistics engine.

## Correlation versus regression

Correlation shows whether two variables vary together and how strongly; it has no direction. Regression defines one variable as the **outcome** and the others as **predictors**, and answers “how much does the outcome change when a predictor increases by one unit?”

> “Predict” does not mean “cause”. In a correlational design, regression estimates the size and direction of a relationship; causal inference requires an experimental design. State this distinction clearly in your methods and discussion.

## Example data

For 20 students, **average daily study time (hours)** in the week before the exam, **average nightly sleep (hours)** and **exam score** were recorded:

- **Study time:** 2, 4, 3, 6, 5, 8, 7, 1, 9, 6, 4, 5, 7, 3, 8, 6, 2, 5, 7, 4
- **Sleep:** 6, 7, 5, 8, 6, 7, 8, 5, 7, 6, 8, 7, 6, 5, 8, 7, 6, 6, 7, 5
- **Exam score:** 64, 61, 62, 70, 75, 71, 79, 58, 75, 74, 65, 76, 65, 60, 83, 70, 52, 71, 80, 57

First, the correlations: study time and exam score r(18) = .78 (p < .001); sleep and exam score r(18) = .62 (p = .003). Note that **study time and sleep are also correlated**, r(18) = .61 (p = .004). This detail will matter in the multiple regression.

## Simple linear regression: one predictor

With study time as the only predictor:

- **Model:** F(1, 18) = 28.23, p < .001, R² = .61, adjusted R² = .59
- **Intercept:** B = 53.17
- **Study time:** B = 2.99, β = .78, p < .001, 95% CI [1.81, 4.17]

Interpretation: daily study time explains 61% of the variance in exam scores. **Each additional hour of study is associated with an average increase of 2.99 points.** With a single predictor, the standardized β equals Pearson’s r (.78).

## Multiple linear regression: two predictors

Now add sleep to the model. The output is:

| Predictor | B | SE | β | t | p | 95% CI |
| --- | --- | --- | --- | --- | --- | --- |
| (Intercept) | 43.52 | 8.00 | | 5.44 | < .001 | [26.65, 60.40] |
| Study time | 2.44 | 0.70 | .64 | 3.50 | .003 | [0.97, 3.90] |
| Sleep | 1.92 | 1.47 | .24 | 1.30 | .209 | [−1.18, 5.02] |

*Note.* R² = .65, adjusted R² = .60, F(2, 17) = 15.51, p < .001.

### 1. Model summary: R², adjusted R² and F

- **F(2, 17) = 15.51, p < .001:** The model as a whole is significant; the two predictors together explain exam scores.
- **R² = .65:** About 65% (exactly 64.6%) of the variance in exam scores is explained by the two predictors.
- **Adjusted R² = .60:** Corrected for the number of predictors and the sample size. Always report it with small samples and many predictors.

Adding sleep raised R² from .61 to .65, so sleep explains only about **4 percentage points of additional variance** beyond study time.

### 2. B: the unstandardized coefficient

**B** is the average change in the outcome for a one-unit increase in the predictor, holding the other predictors constant. Holding sleep constant, each additional hour of study is associated with an average increase of **2.44 points**. B is in the variables’ own units, so it is not used to compare predictors measured in different units.

### 3. β: the standardized coefficient

**β** is the coefficient computed on standardized scores and is used to compare the relative importance of predictors. The β for study time (.64) is clearly larger than for sleep (.24).

### 4. t, p and the confidence interval

- **Study time:** t = 3.50, p = .003, 95% CI [0.97, 3.90]. The interval excludes zero: a significant predictor.
- **Sleep:** t = 1.30, p = .209, 95% CI [−1.18, 5.02]. The interval includes zero: not a significant predictor once study time is controlled.

### 5. Why is sleep related on its own but not significant in the model?

Sleep was significantly related to exam scores on its own (r = .62) but was not significant in the multiple regression. The reason is that sleep is also related to study time (r = .61). Most of the variance sleep shares with exam scores is also shared with study time; once study time enters the model, sleep’s **unique** contribution shrinks. This is a typical consequence of correlated predictors (multicollinearity). Always phrase the interpretation as “controlling for the other predictors”.

## Assumptions

1. **Linearity:** The predictor–outcome relationship should be linear; check with a scatterplot.
2. **Independence of errors:** Observations should be independent (the Durbin–Watson statistic is a common check).
3. **Normality of errors:** Residuals should be roughly normal.
4. **Homoscedasticity:** The spread of residuals should be similar across predicted values.
5. **No severe multicollinearity:** Very high correlations among predictors (usually above .80) make coefficients unstable; report VIF and tolerance.

A common rule of thumb for sample size is at least 10–15 observations per predictor; a power analysis is more robust. The 20-person example here is for illustration only; a real thesis would need a larger sample.

## Reporting in APA 7

**In the text:**

“Multiple linear regression was used to examine whether daily study time and nightly sleep predicted exam scores. The model was significant, F(2, 17) = 15.51, p < .001, and explained 65% of the variance in exam scores (R² = .65, adjusted R² = .60). Study time was a significant predictor of exam scores, B = 2.44, β = .64, t = 3.50, p = .003, 95% CI [0.97, 3.90], whereas sleep was not a significant predictor when controlling for study time, B = 1.92, β = .24, t = 1.30, p = .209.”

**Table:** Use a table like the one above with B, SE, β, t, p and the confidence interval for each predictor, and give the model summary (R², adjusted R², F) in the table note. For titles and numbering, see our [APA 7 tables and figures guide](/en/blog/apa-7-tables-and-figures).

**Formatting rules:**

- Italicize B, t, p, F and R²; Greek letters such as β are not italicized.
- No leading zero for values that cannot exceed 1, such as p and R² (.65, .003).
- Distinguish unstandardized (B) and standardized (β) coefficients; reporting both gives readers the most information.

## Common mistakes

- Writing regression results in causal language (“study time increases achievement”)
- Reporting R² without adjusted R²
- Confusing B and β, or comparing B values measured in different units
- Concluding “no relationship” when a significant correlation becomes non-significant in a multiple model
- Not checking predictor intercorrelations and VIF
- Using many predictors with a small sample

## Regression with Academiana

After uploading your data file, choose the outcome and predictors under “Tools” → “Statistical analysis” → “Linear regression”. You get a table with B, standard error, β, t, p and 95% confidence intervals, plus a model summary with R², adjusted R² and F, in APA format, which you can add to your document as a numbered table with one click. Show the correlations among variables with “Correlation analysis” in the same tool and the shape of the relationship with “Create chart” → “Scatter plot” (with the regression line). When you ask the assistant to interpret the results, every number in the text stays identical to the table; no new values are generated. Our [results and discussion guide](/en/blog/how-to-write-results-and-discussion) also helps when writing up.`,
  },
  "literatur-matrisi-nasil-hazirlanir": {
    slug: "how-to-create-a-literature-matrix",
    title: "How to Create a Literature Matrix: A Step-by-Step Synthesis Table for Your Thesis",
    seoTitle: "How to Create a Literature Matrix: Step-by-Step Guide",
    description: "What a literature matrix (synthesis table) is, which columns to include, how to fill it in and how to turn it into synthesis writing in your literature review.",
    keywords: ["how to create a literature matrix", "literature matrix example", "synthesis matrix", "literature review table", "concept matrix", "literature comparison table"],
    cta: { text: "Add your sources to your project and use “Sources” → “Literature matrix” to fill in each source’s aim, method, sample and findings from the abstract or full text actually read (Pro plan).", label: "Build my matrix" },
    body: `The most common mistake in a literature review is to **summarize sources one by one and line them up**: “Smith (2019) found this. Jones (2020) found that.” Readers cannot get a picture of the field from such writing. The most effective tool to avoid it is the **literature matrix**: a comparison table in which you record every source against the same criteria, then write by reading down the columns rather than across the rows. This guide explains what a matrix is, which columns it needs and how to move from the table to a synthesis paragraph.

## What is a literature matrix?

A literature matrix (synthesis table, comparison table, the “matrix method”) is a table with one source per row and one comparison criterion per column. The criteria follow from your research question: aim, method, sample, instrument, main findings, limitations and the relevance to your own study.

The approach was popularized in the health sciences as the “matrix method” (Garrard). The **concept matrix** proposed by Webster and Watson in information systems rests on the same logic: organize sources by concept rather than by author. The review thus becomes **concept-centric** instead of **author-centric**.

## Why does a matrix help?

- **Synthesis gets easier:** Reading down a column shows which studies agree and which diverge.
- **Gaps become visible:** An unstudied sample, method or context appears as an empty cell, and that becomes the rationale of your thesis.
- **Less rereading:** You do not need to reread a source months later to remember it.
- **Better supervisor meetings:** The table shows at a glance how much of the literature you have covered.

## Which columns should it have?

A basic matrix needs these columns:

1. **Source:** Author and year (keep the full reference in your reference manager).
2. **Aim / research question:** What did the study examine?
3. **Method and design:** Quantitative, qualitative, mixed; survey, experimental, case study…
4. **Sample and context:** With whom, where, how many?
5. **Instrument / data collection:** Which scale, interview guide or database?
6. **Main findings:** Include effect sizes for numerical results.
7. **Limitations:** Those stated by the authors and those you notice.
8. **Relevance to my study:** Where and why will this source be used in my thesis?

Add columns specific to your research: theoretical framework, country, age group, statistics used, effect size. In a systematic review, the matrix becomes a **data extraction form**; see our [systematic review and PRISMA guide](/en/blog/systematic-review-meta-analysis-prisma-2020).

## Building a literature matrix step by step

### 1. Clarify your research question

Columns derive from the research question. For “Is social media use related to academic procrastination among university students?”, sample, scale and strength-of-association columns are critical.

### 2. Collect sources and record your search decisions

Note which databases, keywords and years you searched. For search strategy, see our [literature review guide](/en/blog/how-to-write-a-literature-review).

### 3. Fill it in while reading, not afterwards

Complete each row as you read the source. **Write only what you have actually read**: do not guess the sample size of a study whose abstract you read; leave the cell empty and mark it “read full text”. This prevents incorrect citations later.

### 4. Use your own words

Do not paste long quotations into cells; write briefly in your own words. If you need a direct quote, note it in quotation marks with the page number. This habit also reduces the risk of plagiarism.

### 5. Read the columns to find themes

Once the matrix is filled, read the columns rather than the rows. Look for recurring patterns in the findings column, dominant designs in the method column and gaps in the sample column. Each pattern can become a **theme** heading in your review.

## Example matrix

The table below is a **fictional** example prepared to illustrate the method; the rows do not represent real publications.

| Source | Aim | Method | Sample | Main finding | Relevance to my study |
| --- | --- | --- | --- | --- | --- |
| Study A (2019) | Social media time and procrastination | Correlational survey | 412 undergraduates | Moderate positive relationship | Rationale for hypothesis 1 |
| Study B (2021) | Effect of notifications on attention | Experimental | 60 students | Longer task time with notifications on | Discussion of mechanism |
| Study C (2022) | Students’ experiences of procrastination | Qualitative, interviews | 18 students | “Short breaks” on social media grow longer | When interpreting findings |
| Study D (2023) | Adaptation of a procrastination scale | Validity and reliability | 540 students | One-factor structure, α = .86 | Data collection instrument |

Reading the columns reveals three things:

- **Findings column:** Correlational, experimental and qualitative studies point the same way; this consistency can be a theme (“consistent findings across methods”).
- **Method column:** There is only one experiment, so causal evidence is limited. That is a gap.
- **Sample column:** All studies used undergraduates; graduate students have not been studied. This can become your thesis’s original contribution.

## From matrix to synthesis paragraph

A simple pattern turns a column into a paragraph: **general claim → supporting studies → diverging study → interpretation.**

Weak (source-by-source summary): “Study A found a relationship between social media and procrastination. Study B showed that notifications distract attention. Study C reported that students said their breaks grew longer.”

Strong (synthesis): “The relationship between social media use and academic procrastination has been shown consistently across methods: correlational studies report a moderate relationship (Study A), experimental findings show that notifications prolong task time (Study B), and qualitative findings reveal that short breaks grow longer on social media (Study C). However, causal evidence rests on a single experiment, and all studies were conducted with undergraduates.”

The second paragraph uses the same sources but gives the reader a **conclusion** and points to a **gap**. That is the job of a literature review. For the difference between a theoretical framework and a literature review, see our [theoretical vs. conceptual framework guide](/en/blog/theoretical-vs-conceptual-framework).

## Common mistakes

- Filling in the matrix from memory after finishing your reading
- Guessing information you have not read (e.g. sample size from an abstract)
- Opening too many columns and filling none of them consistently
- Pasting the table into the literature review as is (the table is a working tool; a thesis expects synthesis writing, with a summary table if needed)
- Leaving the “relevance to my study” column empty, so it is unclear why the source is in your thesis

## Which tool should you use?

Excel, Google Sheets or a Word table is enough. Keeping references in a reference manager makes the work easier: see our [Zotero and Mendeley guide](/en/blog/zotero-mendeley-reference-management-guide).

## Literature matrix with Academiana

After adding your sources to a project, the “Literature matrix” button on the “Sources” tab fills in the aim, method, sample, findings and “relevance to our study” columns for each source. The matrix is extracted **only from the abstract or full text that was actually read**; rows for sources with metadata only stay empty and are marked as such, never filled in by guesswork. You can download the table as CSV for Excel or add it to your document as a table. “Tools” → “Literature map” also helps you see citation links and topic clusters among your sources. (The literature matrix and map are included in the Pro plan.)`,
  },
};
