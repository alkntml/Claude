import type { BlogPostEn } from "./types";

/** İngilizce sürümler (anahtar: Türkçe adres) */
export const EN_4: Record<string, BlogPostEn> = {
  "orneklem-buyuklugu-nasil-hesaplanir": {
    slug: "how-to-calculate-sample-size",
    title: "How to Calculate Sample Size: Cochran, Yamane and Power Analysis",
    description: "Calculate sample size for your thesis or paper step by step: Cochran and Yamane formulas, finite population correction, power analysis and response-rate margins.",
    keywords: ["sample size calculation", "cochran formula", "yamane formula", "power analysis", "how to determine sample size"],
    cta: { text: "Enter your population size and margin of error to get the sample size and a ready-to-use sentence for your methods section. No sign-up needed.", label: "Open the sample size calculator" },
    body: `One of the questions examiners ask most often about the methods section is: "Why did you reach this many participants?" Answers such as "my supervisor said 300 would be enough" or "that is how many surveys came back" do not satisfy it. Sample size is not a guess; it is a calculation you can justify in writing. This guide explains the three approaches most often used in quantitative research, with worked examples and wording for your methods section.

## First, two concepts: population and sample

The **population** is the entire group you want to generalise your findings to, for example "mathematics teachers working in public middle schools in Ankara". The **sample** is the part of that group you collect data from. A sample size calculation answers one question: how many people do I need, at minimum, to generalise to the population with confidence?

Before calculating, decide three things:

- **Population size (N):** Is it known? If so, roughly how many people?
- **Margin of error (e):** 5% (0.05) is common in the social sciences. If you want more precision you can choose 3%, but the required sample grows.
- **Confidence level:** Usually 95%. The corresponding Z value is 1.96.

## Approach 1: Cochran's formula

Cochran's formula is the most widely used method in descriptive and survey research that aims to estimate a proportion (for example, "what percentage of teachers experience burnout").

For an infinite (or very large) population:

**n₀ = Z² × p × q / e²**

Here p is the estimated proportion of the characteristic in the population. If unknown, use 0.5, which gives the largest sample; q = 1 − p.

At 95% confidence, a 5% margin of error and p = 0.5: n₀ = 1.96² × 0.5 × 0.5 / 0.05² = 384.16 → **385 people**.

If the population is known and not very large, apply the **finite population correction**:

**n = n₀ / (1 + (n₀ − 1) / N)**

**Example:** With a population of 1,000 teachers, n = 384.16 / (1 + 383.16 / 1,000) = 384.16 / 1.383 ≈ **278 teachers**.

The correction matters more as the population shrinks. For a population of 200, about 132 people are enough; for 100,000 the result is very close to 383. In large populations the required sample barely changes.

## Approach 2: Yamane's formula

Yamane's formula, common in theses in Turkey, is a simplified version of Cochran's for 95% confidence and p = 0.5:

**n = N / (1 + N × e²)**

For a population of 1,000 and a 5% margin of error: n = 1,000 / (1 + 1,000 × 0.0025) = 1,000 / 3.5 ≈ **286 people**.

Its advantage is simplicity. Its limitation is that it does not let you change the confidence level or the proportion. If the committee asks about a different confidence level, Cochran's formula is more flexible.

## Approach 3: Power analysis (for experimental and correlational studies)

If your study does not estimate a proportion but **compares groups** (for example, experimental and control) or examines **the relationship between two variables**, Cochran and Yamane are not appropriate. In that case you run a **power analysis**, which calculates the sample needed to keep the probability of detecting a real effect (statistical power) at a chosen level.

A power analysis needs four inputs:

1. **Effect size:** The size of the difference or relationship you expect, taken from previous studies; if none exist, a "medium" effect by Cohen's benchmarks is assumed.
2. **Significance level (α):** Usually 0.05.
3. **Power (1 − β):** Usually 0.80.
4. **Test type:** t-test, ANOVA, correlation, regression and so on.

Common cases with Cohen's benchmarks (α = 0.05, power = 0.80, two-tailed):

- **Independent-samples t-test, medium effect (d = 0.5):** about **64 per group**, 128 in total.
- **One-way ANOVA, three groups, medium effect (f = 0.25):** about **159 in total** (53 per group).
- **Pearson correlation, medium relationship (r = 0.30):** about **85 people**.

You can run these calculations in free software such as G*Power. In the methods section, report the program, its version and the four values you used.

> If you expect a small effect, the required sample grows quickly. For a t-test with a small effect (d = 0.2), you need about 394 people per group. That is why the effect size should be grounded in the literature.

## Allowing for response rate and data loss

The number you calculate is the number of valid responses that **enter the analysis**. In practice some surveys never come back and some are incomplete or careless. Increase the number you contact according to the expected response rate:

**People to contact = Required sample / Expected response rate**

For a required sample of 278 and an expected 70% response rate: 278 / 0.70 ≈ **398 people** should receive the survey.

## The sampling method matters as much as the number

Reaching the right number does not mean the sample represents the population. Explain the sampling method too:

- **Simple random sampling:** Everyone in the population has an equal chance of selection; you need a list of the population.
- **Stratified sampling:** The population is divided into subgroups (school type, region) and people are drawn proportionally from each.
- **Cluster sampling:** Clusters such as schools, classes or hospitals are selected instead of individuals.
- **Convenience sampling:** You work with whoever you can reach. Very common in theses, but it limits generalisation; state this clearly in the limitations.

Even with a convenience sample, reaching the calculated number still matters for the stability of your results.

## Qualitative research is different

Interview and focus-group studies do not use formulas. Sample size is usually justified by **data saturation**: data collection stops when new interviews no longer produce new codes or themes. State this principle and the interview at which you reached saturation. For details, see our guide to [qualitative interviews and thematic analysis](/en/blog/qualitative-interviews-thematic-analysis).

## How to write it in the methods section

A good sampling paragraph covers the population, the calculation method, the values used, the number reached and the sampling method. For example:

"The population consists of 1,000 mathematics teachers working in public middle schools in Ankara in the 2025–2026 school year. Using Cochran's formula with a finite population correction, a 95% confidence level and a 5% margin of error, the minimum sample size was calculated as 278. Anticipating a 70% response rate, 400 teachers were contacted; after excluding incomplete and careless forms, 291 valid forms were analysed. Participants were selected by stratified sampling by school type."

## Common mistakes

- **Giving a number without defining the population:** First state who you are generalising about.
- **Using the wrong formula:** An experimental study comparing groups needs a power analysis, not Yamane.
- **Ignoring the response rate:** Sending exactly the calculated number of surveys usually ends with too small a sample.
- **Just writing "a sufficient sample was reached":** If you do not state the values used, the committee will ask.
- **Analysing far fewer people than calculated:** If you could not reach the target, do not hide it; report it as a limitation and interpret results with caution.

## In short

Use Cochran or Yamane for surveys that estimate proportions, and power analysis for studies that compare groups or examine relationships. Inflate the number for the expected response rate, explain your sampling method and report all of this with the values you used. Instead of calculating by hand, you can use our [free sample size calculator](/en/araclar/orneklem-hesaplayici), which gives both the number and a ready-made sentence for your methods section.`,
  },
  "cronbach-alfa-nedir-nasil-yorumlanir": {
    slug: "cronbach-alpha-explained",
    title: "Cronbach's Alpha: What It Is, How to Calculate and Interpret It",
    description: "Learn what Cronbach's alpha means, which values are acceptable, how to read item-total correlations and what to do when your alpha comes out low.",
    keywords: ["cronbach's alpha", "reliability coefficient", "internal consistency", "item-total correlation", "scale reliability"],
    cta: { text: "Paste your data to compute Cronbach's alpha, item-total correlations and alpha-if-item-deleted in your browser. No sign-up; your data never leaves your device.", label: "Calculate Cronbach's alpha" },
    body: `Almost every thesis that uses a Likert-type scale contains the sentence "the Cronbach's alpha coefficient of the scale in this study was…". Yet what this number does and does not show is often unclear. Either a value below 0.70 causes panic, or a very high value such as 0.95 is reported without question. This guide explains the logic of Cronbach's alpha, how to interpret it and what you can do when something goes wrong.

## What does Cronbach's alpha measure?

Cronbach's alpha is an **internal consistency** coefficient. It shows how consistently people answer items intended to measure the same characteristic (anxiety, self-efficacy, job satisfaction). If someone strongly agrees with one anxiety item, they are expected to answer the other anxiety items similarly. The more consistent the items, the higher the alpha.

The formula is:

**α = k / (k − 1) × (1 − Σσᵢ² / σₜ²)**

- **k:** number of items
- **σᵢ²:** variance of each item
- **σₜ²:** variance of the total score

Two important consequences follow. First, the more the items correlate, the larger the total-score variance and the higher the alpha. Second, **alpha tends to rise simply because the number of items increases.** A high alpha for a 30-item scale is not automatically "better" than a lower alpha for a 4-item subscale.

## Which values are acceptable?

A rough classification often used in the literature:

- **0.90 and above:** excellent
- **0.80–0.89:** good
- **0.70–0.79:** acceptable
- **0.60–0.69:** questionable
- **below 0.60:** poor

These are not absolute rules. Short subscales (3–4 items) may show values in the 0.60s, which can be discussed with justification. For clinical or selection decisions about individuals, higher values are expected.

> **A very high alpha can also be a problem.** Values above 0.95 may indicate that some items ask almost the same thing in almost the same words (item redundancy), so the scale may be unnecessarily long.

## Item-total correlation

Alpha alone does not tell you which item is problematic. For that, look at the **corrected item-total correlation**: how strongly each item correlates with the sum of the other items.

- **0.30 and above:** the item fits the scale.
- **0.20–0.30:** the item should be reviewed.
- **Below 0.20 or negative:** the item is probably problematic.

If you see a negative value, first check whether you **forgot to reverse-score an item**. A positively worded item such as "I feel relaxed in class" on an anxiety scale must be reversed before analysis. On a 5-point Likert scale, that means replacing the score with (6 − score).

## Alpha if item deleted

Analysis output shows, for each item, what alpha would be if that item were removed. If alpha rises noticeably when an item is deleted, the item may not fit the rest of the scale.

However, **do not delete items just because alpha goes up.** Removing items from an adapted scale with established validity distorts its original structure and makes your results incomparable with other studies. Delete items only with a theoretical justification and only when you are developing a scale. With an adapted scale, it is usually better to report and discuss a problematic item in the discussion or limitations than to remove it.

## Low alpha: what to do

Before panicking, check these in order:

1. **Were reverse-scored items recoded?** This is the most common cause of low alpha.
2. **Are there data entry errors?** On a 5-point scale there should be no values such as 6, 7 or 55.
3. **Are there careless responses?** Look at participants who gave the same answer to every item or finished in implausibly little time. If you exclude them, say so and explain why in the methods section.
4. **Did you calculate alpha at the subscale level?** For multidimensional scales, report alpha for each subscale rather than only for the total. The combined alpha of items that measure different constructs can be misleading.
5. **Is the sample very small or homogeneous?** If participants are very similar, score variance falls and so does alpha.

If the value is still low after these checks, report it as it is and address it in the discussion. Selecting items or removing participants to "fix" the value violates research ethics.

## Limitations of Cronbach's alpha

- **It does not prove unidimensionality.** A high alpha does not show that a scale measures a single construct; that requires factor analysis.
- **It is not evidence of validity.** A scale can consistently measure the wrong thing. Reliability is a precondition of validity, not a substitute for it.
- **It rests on assumptions.** Alpha assumes all items contribute equally to the construct. When this does not hold, **McDonald's omega** may give a more accurate estimate, and many journals now recommend reporting omega as well.

We explain how validity studies are carried out in our guide to [scale validity and reliability studies](/en/blog/scale-adaptation-validity-reliability).

## How to write it in the methods section

A good reliability paragraph gives both the value from the original study and the value in your own data. For example:

"In the original adaptation study of the Teacher Self-Efficacy Scale, Cronbach's alpha was reported as .91. In the present study, alpha was .89 for the total score and .82 (student engagement), .85 (instructional strategies) and .87 (classroom management) for the subscales. Corrected item-total correlations ranged from .38 to .71."

In APA style, coefficients that cannot exceed 1 are reported without a leading zero (".89"). If your institution's thesis guidelines require a different format, follow them.

## In short

Cronbach's alpha shows whether items are answered consistently; 0.70 and above is usually considered adequate. With low values, check reverse-scored items and data errors first, do not delete items just to raise alpha, and do not present alpha as evidence of validity. Paste your data into our [free Cronbach's alpha tool](/en/araclar/cronbach-alfa) to see alpha, item-total correlations and alpha-if-item-deleted in seconds.`,
  },
  "olcek-gecerlik-guvenirlik-calismasi": {
    slug: "scale-adaptation-validity-reliability",
    title: "How to Run a Scale Validity and Reliability Study: An Adaptation Guide",
    description: "Learn the steps of scale development and adaptation in plain language: content validity, exploratory and confirmatory factor analysis, fit indices and reliability.",
    keywords: ["scale adaptation", "validity and reliability study", "exploratory factor analysis", "confirmatory factor analysis", "fit indices"],
    cta: { text: "Build your scale with Academiana's survey builder, collect data via a link and send the responses to analysis in one click.", label: "Start for free" },
    body: `Adapting a scale developed abroad into another language, or developing a new scale from scratch, is one of the most common kinds of master's and doctoral work. The process is much more than translating items. You must show with evidence that the scale measures the same construct, consistently, in the new language and culture. This guide walks through the steps of a validity and reliability study in order.

## The difference between validity and reliability

- **Reliability:** Does the scale give consistent results? Would the same person get a similar score under similar conditions? Do the items agree with one another?
- **Validity:** Does the scale really measure what it intends to measure?

A bathroom scale that always shows 2 kg too much is reliable (it always gives the same result) but not valid. That is why both properties must be demonstrated separately.

## Steps of an adaptation study

### 1. Get permission

Obtain written permission from the scale's developer or copyright holder and keep the correspondence. Many ethics committees and journals ask for it.

### 2. Linguistic equivalence: translation and back-translation

A common approach:

1. At least two independent translators translate the items into the target language.
2. The translations are compared and merged into a single form.
3. Another translator who has not seen the original translates this form back into the source language (back-translation).
4. The back-translation is compared with the original; items whose meaning has shifted are revised.

**Linguistic equivalence** can then be tested with a bilingual group: the same people complete both language versions at an interval, and the correlation between the two scores is examined.

### 3. Content validity: expert review

Subject experts are asked whether each item represents the construct. Their judgements can be quantified. A common method is the **Lawshe technique**: a content validity ratio is computed for each item from the number of experts rating it "essential" and compared with a critical value that depends on the number of experts.

Culturally unsuitable wording (for example, a school practice that does not exist in the new context) is adapted at this stage.

### 4. Pilot study

The scale is given to a small group similar to the target population, and participants are asked whether the items are clear. Items that are misunderstood are revised.

### 5. Main administration and sample

Factor analysis needs an adequate sample. Rough rules such as 5–10 participants per item or at least 200–300 people are often cited, but looking at the properties of your data is better than relying on these rules alone. In adaptation studies, a single adequately sized sample is usually used for confirmatory factor analysis.

## Construct validity: factor analysis

### Exploratory factor analysis (EFA)

EFA is used to **discover** how many dimensions the items group into. It is the core method in scale development.

First, check whether the data are suitable for factor analysis:

- **KMO (Kaiser-Meyer-Olkin):** Indicates sampling adequacy. Values above 0.60 are generally acceptable; above 0.80 is good.
- **Bartlett's test of sphericity:** A significant result (p < .05) shows the items are related enough for factor analysis.

Then report:

- **Number of factors:** Eigenvalues greater than 1, the scree plot and parallel analysis considered together.
- **Factor loadings:** An item's loading should generally be at least 0.30–0.40. Items loading highly on two factors (cross-loadings) are examined.
- **Explained variance:** How much of the total variance the factors explain.

### Confirmatory factor analysis (CFA)

CFA tests whether the structure established in the original study is **confirmed** in your data. It is the core method in scale adaptation.

Model fit is assessed with **fit indices**. Commonly used indices and typical criteria:

- **χ²/df (chi-square / degrees of freedom):** Below 3 is good; below 5 is acceptable. Because chi-square is easily significant in large samples, it is not judged alone.
- **RMSEA:** Below 0.05–0.06 is good; below 0.08 is acceptable.
- **CFI and TLI:** Above 0.95 is good; above 0.90 is acceptable.
- **SRMR:** Below 0.08 is acceptable.

These are widely used guidelines, not strict thresholds. In your methods section, state which criteria you used and cite their source.

If fit is poor, modification indices may suggest adding covariances between error terms. Do this only when it can be justified theoretically, for example between items with similar wording in the same subscale, and report every change.

## Evidence of reliability

- **Internal consistency:** Cronbach's alpha, and if possible McDonald's omega, for each subscale and the total score. See our [Cronbach's alpha guide](/en/blog/cronbach-alpha-explained).
- **Test-retest reliability:** The scale is given twice to the same group at an interval (usually 2–4 weeks), and the correlation between the two scores is computed.
- **Item analysis:** Corrected item-total correlations and a comparison of item means between the bottom 27% and top 27% groups show how well items discriminate.

## Criterion validity (optional but strong)

If scores on your scale relate in the expected direction to scores on another validated scale measuring a similar construct (convergent validity), this provides additional evidence of construct validity.

## Common mistakes

- **Running only EFA in an adaptation:** When adapting a scale with a known structure, the structure is expected to be confirmed with CFA.
- **Running EFA and CFA on the same data:** If both run on the same data, CFA naturally "confirms" what EFA found. Split the data or use two separate samples where possible.
- **Reporting fit indices selectively:** Report all the standard indices, not only the ones that look good.
- **Using a scale without permission:** This creates ethical and legal problems.
- **Reporting only the total-score alpha:** For multidimensional scales, the reliability of each subscale must also be reported.

## In short

Scale adaptation is a process: permission, translation and back-translation, expert review, a pilot, confirmatory factor analysis and reliability analyses. Reporting each step together with the criteria you used is what committees and reviewers look for most. During data collection, you can use Academiana's survey builder to distribute your scale via a link, reverse-score items automatically and send responses straight to analysis.`,
  },
  "nitel-arastirma-gorusme-ve-tematik-analiz": {
    slug: "qualitative-interviews-thematic-analysis",
    title: "How to Conduct Qualitative Interviews and Thematic Analysis",
    description: "Run a qualitative study step by step: designing a semi-structured interview guide, coding, building themes and applying trustworthiness strategies.",
    keywords: ["qualitative research", "semi-structured interview", "thematic analysis", "content analysis", "how to code qualitative data"],
    cta: { text: "Save your interview questions and code list to project memory; the assistant helps you organise the findings using only the themes and quotes you provide.", label: "Start for free" },
    body: `Qualitative research asks "how?" and "why?" more than "how much?". It offers in-depth insight into topics such as teachers' experiences of remote teaching, how nurses experience burnout or how students view AI tools. But when a qualitative study is treated as "talking to a few people and writing down what they said", it can easily be sent back by the committee. This guide explains how to run an interview-based qualitative study from start to finish.

## Choosing the right design

The most common qualitative designs are:

- **Phenomenology:** Examines the experiences of people who live through a phenomenon and the meaning they give it. Example: "The experiences of high-school students with test anxiety."
- **Case study:** Examines a specific school, programme or practice in depth and in context.
- **Grounded theory:** Aims to develop a theory that explains a process, starting from the data.
- **Basic qualitative research:** Describes views and experiences on a topic without committing to a specific design. Very common in theses.

Choose your design according to your research question and explain why in the methods section.

## Selecting participants

The aim in qualitative research is depth, not generalisation, so participants are usually chosen by **purposive sampling**:

- **Criterion sampling:** People who meet specific criteria (for example, preschool teachers with at least five years of experience).
- **Maximum variation:** People with different characteristics are deliberately selected (different school types, genders, experience levels).
- **Snowball sampling:** In hard-to-reach groups, interviewees refer you to others.

The number of participants is justified not by a formula but by **data saturation**: data collection stops when new interviews no longer bring new codes or themes.

## Designing a semi-structured interview guide

A semi-structured interview has prepared questions, but the interviewer can ask follow-ups depending on the answers. A good guide has:

- **Open-ended questions:** Instead of "Was remote teaching effective?", ask "Could you describe your experiences during remote teaching?"
- **Non-leading questions:** "How did your manager's pressure affect you?" assumes there was pressure. "How would you describe your relationship with your manager?" is more neutral.
- **Probes:** Each main question has follow-ups such as "Could you give an example?" or "How did that make you feel?"
- **A reasonable length:** 6–10 main questions are enough for most studies. Interviews usually last 30–60 minutes.

Have two or three subject experts review the guide and run one or two **pilot interviews**. Revise questions that are unclear or produce the same answer.

## Conducting and recording interviews

- **Informed consent:** Explain the purpose, that participation is voluntary, that participants can withdraw at any time and that their identity will be kept confidential. Ask separately for permission to record. Obtain ethics approval before collecting data.
- **Pseudonyms:** Give participants codes such as P1, P2 or T1, T2. Remove identifying details (school name, rare specialisms) from the report.
- **Transcription:** Transcribe recordings verbatim. This takes time; transcribing a one-hour interview can take several hours, but it is also how you get to know your data.

## Thematic analysis: six phases

Thematic analysis as described by Braun and Clarke (2006) is one of the most widely used approaches to qualitative data. It has six phases:

1. **Familiarisation:** Read the transcripts several times and note first impressions.
2. **Generating initial codes:** Give each meaningful data segment a short label (code). For example, "students switching their cameras off" could be coded "lack of interaction".
3. **Searching for themes:** Group related codes into candidate themes.
4. **Reviewing themes:** Check that each theme is supported by the data and that themes are distinct. Merge or split themes as needed.
5. **Defining and naming themes:** Define what each theme is about in a sentence or two and give it a descriptive name.
6. **Writing the report:** Present the themes with direct quotes that support them.

The process is not linear; going back from phase four to phase two is perfectly normal.

### Inductive or deductive?

- **Inductive (data-driven) coding:** Codes and themes emerge from the data. Suitable when a topic is under-researched.
- **Deductive (theory-driven) coding:** Categories from an existing theory or framework are used.

State clearly which approach you used. Hybrid approaches combining both are also possible.

## Trustworthiness: validity and reliability in qualitative research

Instead of quantitative validity and reliability, qualitative research usually uses the criteria of Lincoln and Guba (1985):

- **Credibility (internal validity):** Prolonged engagement, member checking (asking participants to review findings), peer debriefing.
- **Transferability (external validity):** Thick description of participants and context, including direct quotes.
- **Dependability (reliability):** Coding with a second coder and calculating inter-coder agreement.
- **Confirmability:** Keeping raw data, codes and analysis notes; the researcher explaining their own role and possible biases.

Describe concretely which of these strategies you used and how. A general statement such as "validity and reliability were ensured" is not enough.

## Writing the findings

- Present each theme under its own subheading, with sub-themes if needed.
- Explain the theme briefly, then give **direct quotes** that support it: "When I asked them to turn their cameras on, most said their internet was slow." (P4)
- Do not rely on a single participant; draw examples from different people.
- A table showing codes and themes can help the reader, but remember that counting is not the aim of qualitative research.
- Do not mix findings and discussion. Report what participants said in the findings; leave comparison with the literature to the discussion.

## Common mistakes

- **Using the research questions as interview questions:** A research question is what you want to answer; interview questions are experience-based questions participants can understand.
- **Mistaking codes for themes:** "Negative views" is a category, not a theme. A theme carries meaning and interpretation.
- **Not describing the analysis:** Report how you coded, how many codes and themes you obtained and inter-coder agreement.
- **Piling up quotes:** Before and after each quote, write a short comment linking it to the theme.

## In short

The strength of a qualitative study comes from well-designed open-ended questions, careful coding and transparent reporting. Justify your design, explain your number of participants through saturation, follow the six phases of thematic analysis and describe your trustworthiness strategies concretely. If you are curious about how sampling differs, see our [sample size guide](/en/blog/how-to-calculate-sample-size).`,
  },
  "yapay-zeka-uydurma-kaynak-tespiti": {
    slug: "detecting-ai-fabricated-references",
    title: "How to Detect References Fabricated by AI",
    description: "Learn step by step how to catch fake references produced by ChatGPT and similar tools using DOIs, registration agencies and consistency checks.",
    keywords: ["fabricated references", "ai fake citations", "does chatgpt make up sources", "doi check", "reference verification"],
    cta: { text: "Paste your reference list; each entry is checked against DOI and registration agencies, and likely fabrications are flagged. No sign-up needed.", label: "Check my references" },
    body: `If you ask a general-purpose AI chatbot "can you suggest 10 sources on this topic?", you may receive references that do not exist but look entirely convincing. The author names resemble real researchers, the journal is real, the year and pages are in place, but the article itself was never published. This is known as "hallucination", and in a thesis it can lead to serious academic integrity problems. This guide explains why fabricated references appear and how to detect them.

## Why does AI fabricate references?

Large language models do not search a database. They generate "what a reference should look like" based on text seen during training. As a result, they may:

- Combine a real author's name with a journal that fits their field.
- Alter the title of an existing article to create a new one.
- Attach a real DOI to a different article.
- Invent volume, issue and page numbers that look consistent.

The model does not do this maliciously; it simply has no access to verified information. But the result is that you cite a study that does not exist, which is a serious credibility problem once an examiner or reviewer notices.

## Typical signs of a fabricated reference

None of these signs alone proves a reference is fake, but each calls for further checking:

- **No DOI, or the DOI leads to a different publication.** Most journal articles published in recent years have a DOI.
- **A title that is too "perfect".** A title that matches your research question word for word and contains all your keywords should raise suspicion.
- **Author-field mismatch.** The author exists but works in a completely different field.
- **Journal-topic mismatch.** An education policy article in an engineering journal, for example.
- **Volume and year inconsistency.** The volume number the journal published that year does not match the reference.
- **Nowhere to be found.** A title search on Google Scholar, the journal archive and databases returns nothing.

## Step-by-step verification

### 1. Check the DOI

If the reference has a DOI, open it in your browser by adding it after "doi.org/". Check two things:

- Does the DOI resolve to a publication?
- Do the title, authors and year of that publication match your reference?

**A working DOI is not enough.** A frequent pattern in fabricated references is a real DOI that belongs to an entirely different article.

### 2. Search by title

If there is no DOI, search the title in quotation marks on Google Scholar, Crossref and the databases of your field. For Turkish sources use DergiPark and TR Dizin; for theses, the YÖK National Thesis Center. We explain how to search them in our [DergiPark, TR Dizin and YÖK thesis guide](/en/blog/how-to-search-dergipark-tr-dizin-yok-thesis-center).

### 3. Check the journal archive

Go to the journal's website, open the relevant issue of the relevant year and check whether the article is there. This is the most conclusive check.

### 4. Look at the author's publication list

Check the author's institutional page, ORCID profile or Google Scholar profile. If the article is not in their list, it is probably fabricated.

### 5. Check the content

Even when a source is real, AI may attribute to it **a finding it does not contain**. Verify the sentence you cite against the source's abstract or full text. This is critical for claims containing numbers (for example, "68% of participants…").

## When the source is real but the details are wrong

Sometimes the source exists but the AI gets the year, author order or page numbers wrong. In that case you do not need to drop the source; correct the details from the journal's official record or Crossref. Once you have the correct details, you can format them in your citation style with our [free bibliography generator](/en/araclar/kaynakca-olusturucu).

## Using AI correctly when working with sources

AI is far more reliable when used **to work with sources you have found**, not to find sources. A safer workflow:

1. Search real academic databases (Google Scholar, DergiPark, OpenAlex, PubMed, ERIC…).
2. Read the abstracts or full texts of what you find.
3. Ask AI to summarise or compare these sources, or to build a literature matrix.
4. When writing, cite only sources you have actually read and verified.

We discuss the ethics of this approach in detail in [is it ethical to use AI for thesis writing?](/en/blog/is-it-ethical-to-use-ai-for-thesis-writing)

## A note for supervisors and examiners

A few fabricated references in a student's bibliography are a strong sign that the text was produced with AI without oversight. Checking the DOI and title of five to ten randomly chosen references gives a picture within minutes. Bulk verification tools can be used to check the whole list.

## In short

Never add a reference suggested by AI to your thesis without verifying it. Check that the DOI leads to the right publication, that the title appears in databases, that the article is in the journal's archive and that the information you cite is really in the source. Instead of checking a long list one by one, paste it into our [fabricated reference checker](/en/araclar/uydurma-kaynak-kontrolu): each reference is looked up in registration agencies and suspicious ones are flagged. Academiana's writing assistant cites only verified sources added to your project; it does not invent references.`,
  },
};
