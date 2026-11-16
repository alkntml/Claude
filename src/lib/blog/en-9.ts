import type { BlogPostEn } from "./types";

/** English versions, file 9 (D199). Numbers are identical to the Turkish posts (tests/blog-d199.test.ts). */
export const EN_9: Record<string, BlogPostEn> = {
  "korelasyon-analizi-pearson-spearman": {
    slug: "pearson-vs-spearman-correlation",
    title: "Correlation Analysis: When to Use Pearson or Spearman and How to Interpret It",
    seoTitle: "Pearson vs Spearman Correlation: Choosing and Interpreting",
    description: "The difference between Pearson and Spearman correlation, when to use each, how to interpret r, outliers and APA 7 reporting, with a worked example.",
    keywords: ["how to do correlation analysis", "interpret Pearson correlation", "Spearman correlation", "correlation coefficient interpretation", "report correlation APA", "Pearson vs Spearman"],
    cta: { text: "Upload your data file and add Pearson or Spearman coefficients to your document in APA format via “Tools” → “Statistical analysis” → “Correlation analysis”.", label: "Compute my correlation" },
    body: `Correlation analysis shows whether two variables vary together and gives the **direction** and **strength** of the relationship. Questions such as “Does vocabulary grow as reading time increases?” or “Is anxiety related to exam performance?” are most often examined with correlation in a thesis. The two most common types are **Pearson** and **Spearman** correlation. This guide shows the difference, when to choose each and how to report the results, using the same example data.

All numbers in this article were computed from the example data below with Academiana’s statistics engine.

## What does a correlation coefficient tell you?

A correlation coefficient ranges from −1 to +1:

- **Positive value:** As one variable increases, the other tends to increase.
- **Negative value:** As one variable increases, the other tends to decrease.
- **Value near zero:** No linear (Pearson) or monotonic (Spearman) relationship.

The size of the coefficient shows the strength of the relationship. By Cohen’s (1988) widely used benchmarks, .10 is small, .30 medium and .50 large. These are rough guides; interpret them alongside typical values in your field.

> Correlation is not causation. Two related variables do not show that one causes the other; a third variable may affect both.

## Pearson or Spearman?

| Feature | Pearson | Spearman |
| --- | --- | --- |
| What it measures | Linear relationship | Monotonic (rank) relationship |
| Data type | Continuous (interval/ratio) | Ordinal or continuous |
| Normality | Both variables roughly normal | Not required |
| Sensitivity to outliers | High | Low |
| Computed on | Raw scores | Ranks of scores |

Rule of thumb: if both continuous variables are roughly normal and the scatterplot looks linear, use **Pearson**; if one variable is ordinal, the distribution is clearly skewed or there are outliers, use **Spearman**. See our [normality test guide](/en/blog/normality-test-skewness-kurtosis) for checking normality.

## Worked example: reading time and vocabulary

A researcher records the weekly reading time (hours) and a vocabulary test score for 12 students:

- **Reading time:** 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 20
- **Vocabulary score:** 52, 61, 54, 57, 58, 66, 60, 70, 62, 65, 73, 59

The last student reads 20 hours a week, far from everyone else (an outlier).

### 1. Look at the scatterplot first

Plotting a scatterplot before computing a correlation is the fastest way to see the shape of the relationship and any outliers. Here, eleven students form an upward line while the 20-hour student sits alone at the bottom right.

### 2. Pearson and Spearman results

| Analysis | Coefficient | df | p | 95% CI |
| --- | --- | --- | --- | --- |
| Pearson (12 students) | r = .24 | 10 | .443 | [−.38, .72] |
| Spearman (12 students) | rs = .64 | 10 | .025 | |
| Pearson (outlier removed, 11 students) | r = .84 | 9 | .001 | [.47, .96] |
| Spearman (outlier removed, 11 students) | rs = .81 | 9 | .002 | |

### 3. What happened?

- **Pearson missed the relationship because of one outlier.** With twelve students r = .24, not significant (p = .443). With the outlier removed, a strong, significant relationship appears, r = .84.
- **Spearman was far less affected.** Working with ranks, it treated the 20-hour value simply as “the highest rank” and detected the relationship, rs = .64 (p = .025).

This is why you should look at your data and choose the right coefficient before reporting a correlation.

### 4. What to do with an outlier

You cannot remove a value just because you dislike the result. First check whether it is a **data entry error**. If it is a real value:

- use an outlier-resistant method such as Spearman, or
- report the analysis with and without the outlier and justify this in the methods section.

## Coefficient of determination: r²

The square of Pearson’s r is the proportion of variance the two variables share. For r = .84 in the example, r² ≈ .70: about 70% of the variance in vocabulary scores is shared with reading time. This is an easy way to convey practical importance.

## Correlation matrix

With several variables, give all pairwise correlations in one table, usually in the lower triangle with significance marked by asterisks. When you compute many correlations, some will be significant by chance; state in your methods which relationships you hypothesized in advance.

## Reporting in APA 7

**Pearson:** “There was a strong positive relationship between weekly reading time and vocabulary score, r(9) = .84, p = .001, 95% CI [.47, .96].”

**Spearman:** “Because one variable contained an outlier, Spearman’s rank correlation was used. Reading time was positively and significantly related to vocabulary score, rs(10) = .64, p = .025.”

**Formatting rules:**

- Italicize r and p; give the degrees of freedom (n − 2) in parentheses.
- No leading zero for correlations and p values (.84, .025).
- If p is below .001, write “p < .001”.

## Common mistakes

- Computing a correlation without looking at the scatterplot
- Interpreting correlation causally (“reading time increases vocabulary”)
- Measuring a non-linear relationship with Pearson and concluding “no relationship”
- Removing outliers without justification
- Reporting only significance without interpreting the size of the coefficient

To test how well one variable predicts another, move from correlation to regression: see our [regression guide](/en/blog/how-to-report-regression-apa-7). For which analysis fits which question, see our guide on [which statistical test to use](/en/blog/which-statistical-test-to-use).

## Correlation with Academiana

After uploading your data file to your project, choose the variables under “Tools” → “Statistical analysis” → “Correlation analysis” and select Pearson or Spearman. You get coefficients, degrees of freedom and p values in APA format, which you can add to your document as a table. To show the shape of the relationship, add a scatter plot with a regression line via “Create chart” → “Scatter plot”. The numbers are not generated by AI; the site’s statistics engine computes them from your data.`,
  },
  "etki-buyuklugu-rehberi-cohen-d-eta-kare": {
    slug: "effect-size-guide-cohens-d-eta-squared",
    title: "What Is Effect Size? A Guide to Interpreting Cohen’s d, Eta Squared, r and R²",
    seoTitle: "Effect Size Guide: Cohen’s d, Eta Squared, r and R²",
    description: "What effect size is and why it matters more than p. How to interpret Cohen’s d, eta squared, omega squared, r, R² and Cramér’s V and report them in APA 7.",
    keywords: ["what is effect size", "interpret Cohen's d", "interpret eta squared", "calculate effect size", "omega squared", "effect size APA"],
    cta: { text: "Academiana’s statistical analysis tool computes the appropriate effect size (Cohen’s d, η², R², Cramér’s V) with every test and reports it in APA format.", label: "Run my analysis" },
    body: `Saying “a significant difference was found” tells only half the story. The measure that says **how large** a difference or relationship is, is the **effect size**. APA 7 asks for effect sizes, and where possible confidence intervals, alongside statistical tests. This guide covers the most common effect sizes, how to interpret them and which one to report with which test.

The example values in this article are results computed with Academiana’s statistics engine in the worked examples on our blog.

## Why is a p value not enough?

A p value measures how compatible the observed difference or relationship is with chance alone. It has two important limits:

- **It depends on sample size.** In very large samples, trivially small differences can be significant.
- **It says nothing about size.** The difference between p = .001 and p = .04 does not directly tell you how large an effect is.

Effect sizes are largely independent of sample size and make it possible to compare studies and combine them in a meta-analysis.

## Types of effect size

### Cohen’s d (difference between two means)

The difference between two group means expressed in standard deviation units, reported with independent and paired t-tests. In the example in our [t-test guide](/en/blog/how-to-run-and-interpret-a-t-test), the experimental and control groups differed by **d = 1.46**: about one and a half standard deviations.

For paired tests, **dz** is computed with the standard deviation of the difference scores; in the pre-test/post-test example in the same guide, dz = 2.79.

### Eta squared (η²) and omega squared (ω²)

In ANOVA, the proportion of total variance in the dependent variable explained by the groups. In our [ANOVA guide](/en/blog/one-way-anova-how-to-run-and-report), **η² = .33**: 33% of the variability in scores was explained by teaching method. η² tends to overestimate the effect, especially in small samples; the less biased **ω²** in the same example is .28.

### r (correlation coefficient)

A correlation coefficient is itself an effect size. In our [correlation guide](/en/blog/pearson-vs-spearman-correlation), **r = .84** after removing an outlier.

### R² and adjusted R²

In regression, the proportion of variance explained by the model. In the two-predictor model in our [regression guide](/en/blog/how-to-report-regression-apa-7), **R² = .65** and adjusted **R² = .60**.

### Cramér’s V

The strength of the relationship between two categorical variables, reported with a chi-square test. In our [chi-square guide](/en/blog/chi-square-test-of-independence), **V = .31**.

## Interpretation benchmarks

| Effect size | Small | Medium | Large | Used with |
| --- | --- | --- | --- | --- |
| Cohen’s d | 0.20 | 0.50 | 0.80 | t-tests |
| η² | .01 | .06 | .14 | ANOVA |
| r | .10 | .30 | .50 | Correlation |
| f² | .02 | .15 | .35 | Regression |

These thresholds are the rough benchmarks Cohen (1988) proposed for the behavioral sciences, and Cohen himself stressed that they should be interpreted in context. A “small” effect in an educational intervention may mean a meaningful practical gain when applied to thousands of students. Where possible, compare with effect sizes in similar studies in your field. Benchmarks for Cramér’s V depend on the size (degrees of freedom) of the table.

## Which effect size with which test?

| Analysis | Effect size to report |
| --- | --- |
| Independent samples t-test | Cohen’s d (and the CI of the difference) |
| Paired samples t-test | dz |
| One-way ANOVA | η² or ω² |
| Correlation | r (or rs) and r² if useful |
| Regression | R², adjusted R², standardized β |
| Chi-square | Cramér’s V (φ for 2 × 2 tables) |
| Mann–Whitney U | r (z / √N) |

## Effect size and sample size

Effect size is also used when planning a study. In a power analysis you enter the expected effect size to compute the required sample size: the smaller the expected effect, the larger the sample needed. See our [sample size guide](/en/blog/how-to-calculate-sample-size) and the free [sample size calculator](/en/araclar/orneklem-hesaplayici).

## Reporting in APA 7

Give the effect size right after the test statistic:

- “… t(22) = 3.57, p = .002, d = 1.46, 95% CI [3.66, 13.84].”
- “… F(2, 27) = 6.74, p = .004, η² = .33.”

Italicize d and R²; Greek letters such as η², ω² and β are not italicized. Values that cannot exceed 1 (η², r, R²) take no leading zero; d can exceed 1, so it does (e.g. 0.45).

## Common mistakes

- Reporting only the p value
- Omitting effect sizes for non-significant results (they should still be reported)
- Treating Cohen’s thresholds as strict cut-offs regardless of context
- Confusing dz in paired designs with d for independent groups
- Interpreting η² uncorrected in small samples

## Effect sizes with Academiana

Academiana’s statistical analysis tool computes the appropriate effect size with every test: Cohen’s d and confidence interval for t-tests, η² for ANOVA, R² and standardized β for regression, Cramér’s V for chi-square. Results come in APA format and can be added to your document as a table with one click; when you ask the assistant to interpret them, the effect size is interpreted too and no new numbers are generated.`,
  },
  "ki-kare-bagimsizlik-testi-nasil-yapilir": {
    slug: "chi-square-test-of-independence",
    title: "How to Run a Chi-Square Test of Independence: Crosstabs, Cramér’s V and APA Reporting",
    seoTitle: "Chi-Square Test of Independence: How to Run and Interpret",
    description: "Chi-square test of independence step by step: crosstab, expected frequencies, assumptions, Cramér’s V and APA 7 reporting, with a worked example.",
    keywords: ["how to do a chi-square test", "chi-square test of independence", "interpret crosstab", "Cramér's V", "report chi-square APA", "categorical data analysis"],
    cta: { text: "Upload your data file and get the crosstab, χ² value and Cramér’s V in APA format via “Tools” → “Statistical analysis” → “Chi-square test of independence”.", label: "Compute my chi-square" },
    body: `The chi-square (χ²) test of independence tests **whether two categorical variables are related**. Questions such as “Does preferred learning mode differ by gender?” or “Is graduation status related to employment status?” are often examined with chi-square in theses that use survey data. This guide walks through the test from the crosstab to APA reporting with an example.

All numbers in this article were computed from the example data below with Academiana’s statistics engine.

## When is it used?

- Both variables are **categorical** (gender, preference, yes/no, education level).
- Observations are **independent**: each participant falls into exactly one cell.
- Data are **frequencies** (counts of people), not percentages or means.

If your outcome is a continuous score, use a [t-test](/en/blog/how-to-run-and-interpret-a-t-test) or [ANOVA](/en/blog/one-way-anova-how-to-run-and-report) instead.

## Hypotheses

- **H0 (null):** The two variables are independent; preference does not differ by gender.
- **H1 (alternative):** The two variables are related.

## Worked example: gender and preferred learning mode

120 university students are asked whether they prefer face-to-face, online or blended (hybrid) learning.

### 1. Observed frequencies (crosstab)

| Gender | Face-to-face | Online | Blended | Total |
| --- | --- | --- | --- | --- |
| Female | 18 | 10 | 32 | 60 |
| Male | 28 | 18 | 14 | 60 |
| Total | 46 | 28 | 46 | 120 |

### 2. Expected frequencies

The expected frequency is the count each cell would have if the variables were independent: row total × column total / grand total. For “Female – Blended”: 60 × 46 / 120 = 23.

| Gender | Face-to-face | Online | Blended |
| --- | --- | --- | --- |
| Female | 23 | 14 | 23 |
| Male | 23 | 14 | 23 |

More women prefer blended learning than expected (32 versus 23), and more men prefer face-to-face (28 versus 23) and online learning (18 versus 14) than expected.

### 3. Test result

- **χ²(2, N = 120) = 11.50, p = .003:** Preferred learning mode is significantly related to gender.
- **Degrees of freedom:** (rows − 1) × (columns − 1) = (2 − 1) × (3 − 1) = 2.
- **Cramér’s V = .31:** The strength of the relationship, from 0 to 1; for a table of this size, a medium relationship. For a general guide to interpreting effect sizes, see our [effect size guide](/en/blog/effect-size-guide-cohens-d-eta-squared).

### 4. Checking assumptions: expected frequencies

For the test to be reliable, expected frequencies must be large enough. A common rule: **at least 80% of cells should have expected counts of 5 or more, and no cell below 1.** Here the smallest expected count is 14, so the assumption is met.

If expected counts are small:

- use **Fisher’s exact test** for 2 × 2 tables;
- for larger tables, combine categories where it makes sense (e.g. grouping two rarely chosen options as “other”) and justify this in the methods section.

## Reporting in APA 7

“A chi-square test of independence examined whether preferred learning mode differed by gender. Preference was significantly related to gender, χ²(2, N = 120) = 11.50, p = .003, Cramér’s V = .31. Female students more often preferred blended learning (53.3%), whereas male students more often preferred face-to-face learning (46.7%).”

**Formatting rules:**

- After χ², give the degrees of freedom and sample size in parentheses.
- Present the crosstab with counts and row percentages so readers can see the direction of the relationship.
- No leading zero for p.

For table format, see our [APA 7 tables and figures guide](/en/blog/apa-7-tables-and-figures).

## Difference from the goodness-of-fit test

Chi-square has two common uses:

- **Test of independence** (this article): Are two categorical variables related?
- **Goodness-of-fit test:** Does the distribution of one categorical variable match an expected distribution? (E.g. “Were the options chosen equally often?”)

The computations are similar, but the questions differ; state clearly which one you used.

## Common mistakes

- Running chi-square on percentages or means (use counts)
- Applying chi-square to multiple-response questions where one person appears in several cells
- Not checking the expected-frequency assumption
- Not interpreting the direction of a significant relationship from the table
- Not reporting the effect size (Cramér’s V)

## Chi-square with Academiana

After uploading your data file to your project, choose two categorical variables under “Tools” → “Statistical analysis” → “Chi-square test of independence”. You get observed counts with row percentages, the χ² value, degrees of freedom, p value and Cramér’s V in APA format; for 2×2 tables the Yates-corrected χ² and Fisher’s exact test are also computed, and if any expected count is below 5 the result is reported with Fisher’s test. The table can be added to your document with one click. For which test fits which question, see our guide on [which statistical test to use](/en/blog/which-statistical-test-to-use).`,
  },
  "doi-nedir-nasil-bulunur": {
    slug: "what-is-a-doi-how-to-find-it",
    title: "What Is a DOI, How Do You Find and Verify It? A Guide to DOIs in Reference Lists",
    seoTitle: "What Is a DOI and How Do You Find It? Reference Guide",
    description: "What a DOI is, how to find an article’s DOI, how to verify it and write it in a reference list: APA 7 rules, sources without DOIs, fake DOIs.",
    keywords: ["what is a DOI", "how to find a DOI", "DOI lookup", "DOI in reference list", "APA 7 DOI", "verify DOI"],
    cta: { text: "Academiana verifies sources by DOI, finds missing DOIs and details, and writes them correctly in your chosen style.", label: "Verify my sources" },
    body: `At the end of references you often see a link starting with “https://doi.org/10…”. That is the publication’s **DOI**: an identifier assigned to a publication that never changes. Used correctly, it lets readers reach the source with one click and makes it easy to verify that the source exists. This guide explains what a DOI is, how to find and verify it and how to write it in a reference list.

## What is a DOI?

A DOI (Digital Object Identifier) is a persistent identifier assigned to a publication or dataset. Even if the publication’s web address changes or the journal moves to another publisher, the DOI stays the same and always leads to the publication’s current page. The system is run by the International DOI Foundation; most DOIs for scholarly articles are registered through **Crossref**, and many dataset DOIs through **DataCite**.

## Structure of a DOI

Every DOI has two parts and starts with “10.”:

- **Prefix:** the part starting with “10.” that identifies the publisher or registrant.
- **Suffix:** the part after the slash, set by the publisher and unique to the publication.

To turn a DOI into a link, add **https://doi.org/** in front of it. Opening the link in a browser takes you to the publication’s page.

## Which publications have DOIs?

- Most articles in international peer-reviewed journals
- Many journal articles on DergiPark (DOI use varies by journal)
- Some academic books and book chapters
- Conference papers, reports and datasets (if the publisher registered them)

Theses, older publications and some national journals may not have DOIs. A source without a DOI is not invalid; give the full reference and a stable address if available.

## How to find a DOI

1. **Look at the article.** The DOI is usually on the first page, below the title or in the header.
2. **Check the journal’s web page.** The article page lists the DOI with the reference details.
3. **Search Crossref.** Type the article title into Crossref’s search to find the DOI.
4. **Use a reference manager.** Zotero and Mendeley save the DOI when capturing details from an article page; see our [Zotero and Mendeley guide](/en/blog/zotero-mendeley-reference-management-guide).
5. **Use our free tool.** Our [reference generator](/en/araclar/kaynakca-olusturucu) finds reference details from a DOI or title.

## How to verify a DOI

Check that a DOI is real and correct in two steps:

1. **Open the link:** a link starting with https://doi.org/ should resolve to a publication page. If you get “DOI not found”, it may be mistyped or fabricated.
2. **Compare the details:** the title, authors, year and journal on the page must match your reference exactly. If the DOI resolves but to **a different article**, the reference and DOI do not match.

## AI and fabricated DOIs

AI chat tools can produce realistic-looking references that do not exist, sometimes with fabricated DOIs. Fake DOIs either resolve nowhere or lead to a completely different publication. Verify every AI-suggested source by its DOI and never cite a source you have not read. You can check your whole list with our free [fabricated reference checker](/en/araclar/uydurma-kaynak-kontrolu) and read more in our guide to [detecting AI-fabricated references](/en/blog/detecting-ai-fabricated-references).

## How to write a DOI in a reference list

APA 7 rules for DOIs:

- Write the DOI as a link starting with **https://doi.org/**.
- Do not use older formats (“doi:” or “DOI:” prefixes, “dx.doi.org”).
- Do not write “Retrieved from” before the DOI.
- Do not put a full stop after the DOI.
- If a source has a DOI, do not add the database name or another URL.

Other styles may differ: IEEE and Vancouver may also use the “doi:” prefix; ISNAD accepts the link format. For the same source in seven styles side by side, see our [reference list guide](/en/blog/how-to-write-a-bibliography-citation-styles).

## Sources without a DOI

- **Journal article, no DOI:** Give the full reference (authors, year, title, journal, volume, issue, pages). If the article is available online, APA 7 allows the URL of the journal’s article page.
- **Thesis:** Give the thesis type, university and, if available, the repository number.
- **Web page:** Give a stable address and, if the content may change, the access date.

## Common mistakes

- Writing the DOI in the old “doi:10…” format
- Putting a full stop after the DOI (it can break the link)
- Copying only part of the DOI
- Not opening the DOI and comparing it with the reference
- Using the book’s DOI for a chapter, or the journal’s for an article

## DOIs with Academiana

When you add a source in Academiana, its DOI is verified through Crossref, DataCite or PubMed and the verification status is shown next to each source. Missing DOIs and details are completed from databases, and the reference list writes the DOI correctly in your chosen style. The quality check lists sources that should have a DOI but lack one, and sources that could not be verified.`,
  },
  "yapay-zeka-kullanim-beyani-nasil-yazilir": {
    slug: "how-to-write-an-ai-use-statement",
    title: "How to Write an AI Use Statement: Examples for Theses and Journal Articles",
    seoTitle: "How to Write an AI Use Statement, with Examples",
    description: "Where and how to write an AI use statement in a thesis or article: what it must include, example statements by type of use and how to cite AI in APA.",
    keywords: ["AI use statement", "AI disclosure statement example", "ChatGPT disclosure", "AI statement thesis", "cite AI APA", "journal AI policy"],
    cta: { text: "Academiana never fabricates sources, data or findings and records everything it does in the version history. Use AI transparently and in a way you can disclose.", label: "Work transparently" },
    body: `As AI tools spread in academic writing, many journals and universities have started to require that their use be **clearly disclosed**. A well-written statement protects academic integrity and prevents questions later. This guide explains where to put the statement, what it must include and gives example statements for different kinds of use. We discuss the ethical limits of AI use more generally in our guide on [whether writing a thesis with AI is ethical](/en/blog/is-it-ethical-to-use-ai-for-thesis-writing).

## Why disclose?

- **Transparency:** Readers and reviewers should know which tool was used, for what and in which parts of the text.
- **Accountability:** The publication ethics body COPE and the International Committee of Medical Journal Editors (ICMJE) stress that AI tools cannot be listed as authors because they cannot take responsibility for the work. Responsibility lies with the author using the tool.
- **Compliance:** Many journals and institutes require a statement; undisclosed use may be treated as an ethics violation.

## Read the rules first

The form and place of the statement vary. Before writing, check:

- **For a thesis:** your institute’s thesis guidelines and any AI use policy.
- **For an article:** the target journal’s author guidelines and the publisher’s AI policy.
- **Your supervisor:** discuss at the start at which stages you plan to use AI.

Some institutions exempt limited uses such as language editing; others require every use to be disclosed. Your institution’s rule is what counts.

## What a statement must include

1. **Tool:** the name and, if possible, version of the tool.
2. **Purpose:** what it was used for (language editing, translation, search strategy, coding, drafting).
3. **Scope:** in which sections it was used.
4. **Oversight:** that the author checked and edited the output and verified the sources.
5. **Responsibility:** that the author is responsible for the content.

## Where does it go?

- **In an article:** journals usually ask for the statement in the methods, in the acknowledgements or under a separate “AI use statement” heading before the references.
- **In a thesis:** if the guidelines do not specify, it can go next to the ethics declaration or as a separate paragraph at the end of the methods chapter.
- **For code and data analysis:** if AI was used to write code, state this in the analysis part of the methods.

## Example statements by type of use

The texts below are examples; fill in the bracketed parts with your own details and adapt them to your institution’s rules.

**Language editing:**
“[Tool name, version] was used to check the language and grammar of this work. The tool was used only for grammar and wording; the content, findings and interpretations are the author’s own. All suggested edits were reviewed by the author.”

**Search support in the literature review:**
“[Tool name] was used to suggest keywords and search strings for the literature review. All sources were found in databases, read and verified by the author.”

**Drafting and editing:**
“[Tool name] was used to create first drafts of the [chapter names] chapters. The drafts were extensively revised by the author, and all citations were verified against the original sources. The author is responsible for the content of this work.”

**Code for data analysis:**
“[Tool name] was used to write the [software] code for data analysis. The author tested the code and checked the results independently.”

**Translation:**
“The first translation of the English abstract was produced with [tool name] and corrected by the author.”

## Citing AI in APA

If you quote an output from an AI tool directly in your text (for example, showing a response as an illustration in the methods), APA suggests a citation format with the developing organization as author and the version date as the year. It is also recommended to give the prompt you used in the text or an appendix. However, AI output is **not an academic source**: to support a claim, cite the original source of the information, not the AI tool.

## What to avoid

- Understating how the tool was used
- Vague statements such as “written with AI” with no scope
- Listing the AI tool as an author or as a “contributor” in the acknowledgements
- Adding a statement only after a plagiarism report raises questions

## Keep a record of your process

Keep records that support your statement: the prompts you used, version history and drafts showing your edits. Since AI detectors can produce false positives, these records protect you; see our [guide to AI detection tools](/en/blog/are-ai-detectors-reliable) for more.

## Transparent use with Academiana

Academiana does not fabricate sources, data or findings: citations go only to real sources in your library, and unknown information is marked “data to be entered”. Every draft the assistant adds to your text is saved in the version history with an “AI” label, so you can later see which section was written with AI support at which stage and prepare your statement accordingly.`,
  },
};
