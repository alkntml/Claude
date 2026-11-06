import type { BlogPostEn } from "./types";

/** İngilizce sürümler (anahtar: Türkçe adres) */
export const EN_5: Record<string, BlogPostEn> = {
  "tez-tablo-ve-sekil-apa-7": {
    slug: "apa-7-tables-and-figures",
    title: "How to Format Tables and Figures in a Thesis: APA 7 Rules and Examples",
    description: "Learn APA 7 rules for table and figure numbers, titles, notes, borders and in-text references, with examples and the mistakes most often seen in theses.",
    keywords: ["apa 7 tables", "apa figure format", "how to make a table in a thesis", "table note", "apa table title"],
    cta: { text: "Create the analysis table and an APA-style chart from your data file and add them to your chapter in one click, with numbering and title format ready.", label: "Start for free" },
    body: `An examiner reading your results chapter usually glances at the tables and figures before reading the text. A well-made table conveys your results in seconds; a poorly made one makes even a correct analysis look doubtful. This guide explains how to prepare tables and figures according to the 7th edition of APA, with examples and the mistakes most often seen in theses.

## Table, figure or text?

Not every finding needs a table. Ask: in which form will the reader understand this most easily?

- **Text:** Enough for three or four numbers. "62% of participants were women and 38% men" does not need a table.
- **Table:** Used when exact values must be compared. Descriptive statistics, correlation matrices, regression results and group comparisons are typical table content.
- **Figure:** Used to show trends, patterns and relationships. Change over time, group comparisons, relationships between variables or a research model are often clearer as figures.

Do not present the same data in both a table and a figure. For the reader it is repetition; for the committee it is unnecessary length.

## The parts of an APA 7 table

Every APA 7 table follows the same layout:

1. **Table number:** Above the table, in bold: **Table 1**. Tables are numbered in the order they are first mentioned in the text.
2. **Table title:** One line below the number, in *italic* title case. Short but descriptive: *Demographic Characteristics of Participants*.
3. **Headings:** What each column shows. If you use abbreviations (M, SD, n), explain them in a note or use standard statistical abbreviations.
4. **Body:** The data. Keep the same number of decimal places throughout a column.
5. **Note:** Below the table, starting with the word "Note." in italics.

### Borders

APA tables use **no vertical lines.** Horizontal lines are kept to a minimum: usually only at the top of the table, below the column headings and at the bottom. Use spacing instead of lines to separate rows. In Word, the easiest way is to remove all borders and then add only these three horizontal lines.

### Three kinds of table notes

- **General note:** Information about the table as a whole, the meaning of abbreviations and copyright attribution if the table is reproduced.
- **Specific note:** Information about a particular column, row or cell, marked with superscript letters (ᵃ, ᵇ).
- **Probability note:** The meaning of asterisks: *p < .05. **p < .01. ***p < .001.

Notes appear in this order, each type starting on a new line.

## Example: a descriptive statistics table

The following layout is a good example of one of the most common table types in theses:

**Table 2**

*Descriptive Statistics for Scale Scores (N = 291)*

Columns: Variable · M · SD · Skewness · Kurtosis

- Self-efficacy · 3.84 · 0.61 · −0.42 · 0.18
- Burnout · 2.37 · 0.74 · 0.51 · −0.23
- Job satisfaction · 3.52 · 0.69 · −0.30 · −0.11

*Note.* Scores range from 1 to 5. M = mean; SD = standard deviation.

Note that the sample size is given in the title or note, decimals are consistent in each column and abbreviations are explained. If your institution's guidelines require a particular decimal separator, follow them consistently throughout the thesis.

## Preparing figures in APA 7

Figures follow the same logic as tables:

1. **Figure number:** Above the figure, in bold: **Figure 1**.
2. **Figure title:** One line below, in *italic* title case.
3. **Image:** The chart, diagram, photograph or model.
4. **Legend:** If needed, placed within the borders of the image.
5. **Figure note:** Below the figure, starting with "Note."

Some principles for a good figure:

- **Keep it simple.** 3D effects, shadows and unnecessary colours make figures harder to read. Prefer clean two-dimensional charts.
- **Label the axes.** State what each axis shows and its unit.
- **Make it readable in greyscale.** Theses may be printed, and some readers cannot distinguish colours. Use line styles (solid, dashed) or patterns.
- **Keep the scale honest.** A y-axis that does not start at zero can exaggerate small differences. If you make that choice, show it clearly on the axis.
- **Use legible text.** Labels should remain readable when the figure is scaled down.

## Referring to tables and figures in the text

Refer to every table and figure at least once by its number. Write "as shown in Table 2" rather than "as shown in the table below", because page layout may change and the table may no longer be below.

The text should not repeat the table. Instead of turning every number into a sentence, highlight the most important result: "As shown in Table 2, participants' self-efficacy scores were above the scale midpoint (M = 3.84), while burnout scores were relatively low."

## Tables and figures from other sources

For tables and figures reproduced or adapted from another work, credit the source in the note:

- Reproduced: "*Note.* From Author (Year, p. 45)."
- Adapted: "*Note.* Adapted from Author (Year)."

Using copyrighted images in a thesis may require permission. Since theses are often published open access, take this seriously. For citation rules, see our [APA 7 citation guide](/en/blog/apa-7-citation-guide).

## Lists of tables and figures

Most institutions require a **list of tables** and a **list of figures** after the table of contents. Instead of typing them by hand, use Word's "Insert Caption" and "Insert Table of Figures" features so that numbers and page numbers update automatically when you add or delete tables.

## Common mistakes

- **Using vertical lines and full grids:** An APA table should not look like a spreadsheet.
- **Placing the title below the table:** In APA 7, table and figure titles go above.
- **Pasting software output as it is:** Output tables from statistics software are for analysis, not reporting. Remove unnecessary rows and keep only the values the reader needs.
- **Inconsistent decimals:** Do not write 3.8 in one row and 3.8412 in another.
- **Tables never mentioned in the text:** Every table should serve a purpose.
- **Splitting a table across pages:** Keep tables on one page if possible. If you must split one, repeat the heading row on the new page.
- **Ignoring institutional guidelines:** Some institutions apply rules that differ from APA (for example, title font or alignment). Institutional guidelines always take priority.

## In short

In APA 7, tables and figures follow the same layout: bold number, italic title, a clean body and a note starting with "Note.". Avoid vertical lines, keep decimals consistent, refer to every table and figure by number and do not present the same data twice. To see which analysis is reported with which table, read our guides on [choosing a statistical test](/en/blog/which-statistical-test-to-use) and [writing results and discussion](/en/blog/how-to-write-results-and-discussion).`,
  },
  "tez-giris-bolumu-nasil-yazilir": {
    slug: "how-to-write-a-thesis-introduction",
    title: "How to Write a Thesis Introduction: Problem Statement, Purpose and Significance",
    description: "Learn how to write each part of a thesis introduction with examples: problem statement, purpose, significance, research questions, assumptions, limitations and definitions.",
    keywords: ["thesis introduction", "how to write a problem statement", "significance of the study", "limitations", "how to write a thesis purpose"],
    cta: { text: "Build your problem, purpose and method plan with the blueprint module, then write your introduction from that plan and the real sources you added to your project.", label: "Start for free" },
    body: `The introduction is the committee's first serious contact with your thesis. Here you tell the reader what you studied, why and how. A strong introduction makes the rest of the thesis worth reading; a scattered one can overshadow even the best findings. This guide covers the introduction structure common in theses in Turkey, the purpose of each subsection and frequent mistakes.

## When should you write the introduction?

It may sound surprising, but the introduction is best **finalised last**. You write a draft at the proposal stage, but as your findings take shape, your problem statement, purpose and significance mature as well. When the thesis is finished, reread the introduction and align it with the findings. Everything you promise in the introduction must be delivered in the thesis.

## The funnel structure: from general to specific

A good introduction works like a funnel:

1. **Broad context:** Why the topic matters and the general state of the field.
2. **Narrowing focus:** A specific problem or debate in that field.
3. **The gap:** What existing studies do not explain.
4. **Your study:** How you will fill that gap.

The **CARS model** proposed by Swales (1990) in the academic writing literature follows a similar logic: establish the territory, show the niche, then occupy the niche with your own study.

## Subsections and what each is for

In most graduate schools in Turkey the introduction contains the following subsections. Order and names vary, so check your own guidelines.

### Problem statement

This is the heart of the introduction and usually its longest part. It covers:

- The general frame of the topic and why it matters
- A short summary of what has been studied so far
- What existing studies leave out (the research gap)
- Why that gap is a problem

The problem statement is not a literature review. The aim is not to summarise every study but to lead the reader step by step to your research problem. Each paragraph should be more specific than the last.

The section usually ends with a **problem sentence** that states the main question in one sentence: "Is there a significant relationship between middle-school teachers' use of digital assessment tools and their years of experience?"

### Purpose of the study

The purpose is the problem sentence turned into an action: "The purpose of this study is to examine the relationship between middle-school teachers' use of digital assessment tools and their years of experience."

**Sub-objectives** or **research questions** follow. Each should be measurable and answerable:

1. What is teachers' level of use of digital assessment tools?
2. Does the level of use differ significantly by gender?
3. Is there a significant relationship between level of use and years of experience?

These questions form the skeleton of your methods and results chapters: each subheading in the results should correspond to a research question. For writing research questions and hypotheses, see our [detailed guide](/en/blog/how-to-write-research-questions-and-hypotheses).

### Significance of the study

This part answers "why should this study be done?". A good significance section shows contribution at two levels:

- **Theoretical contribution:** What does the study add to the literature? Which gap does it fill, and which debate does it inform?
- **Practical contribution:** Who will benefit from the results? Teachers, administrators, policymakers, clinicians…

A generic sentence such as "this study is expected to contribute to the field" is not a significance section. State concretely who benefits and how: "The findings may help provincial education directorates plan in-service training by experience group."

### Assumptions

These are premises the study relies on but does not test. For example:

- Participants are assumed to have answered the scale items sincerely.
- The scale used is assumed to measure the intended characteristic validly.

Keep assumptions few and list only those that genuinely affect your research. Assumptions are not a list of "things I cannot prove".

### Limitations

These are conditions that limit the scope and generalisability of the study:

- **Scope limitations:** A specific province, school type, time period or participant group.
- **Method limitations:** Self-report data, a convenience sample, a cross-sectional design.

Writing limitations honestly is not a weakness but a sign of scientific maturity. Committees trust researchers who know the limits of their work. Present limitations as the natural boundaries of the study rather than defensively.

### Definitions

These define concepts you use in a specific sense. Do not define terms everyone knows; define those you use in a particular way. Definitions should be sourced or operational: "Digital assessment tool: in this study, online quiz, survey and feedback applications used to assess student performance."

## How long should the introduction be?

There is no fixed rule, but in master's theses the introduction is often around 10% of the total length, with the problem statement taking most of that. If the theoretical framework and literature review form a separate chapter, use the literature in the introduction only as much as needed to build the problem.

## Common mistakes

- **Starting too broadly:** Openings such as "technology has entered every area of our lives" tell the reader nothing. Start with a concrete observation close to your topic.
- **Not showing the gap:** Summarising the literature and then saying "therefore this study was conducted" is not enough. State explicitly what is missing.
- **Purpose and questions that do not match:** Writing "to examine the relationship" in the purpose but asking only descriptive questions.
- **Unsupported claims:** A claim such as "most teachers do not use digital tools" must be backed by a source or data.
- **Turning limitations into self-criticism:** Limitations show how results should be read, not that your design is poor.
- **Never revisiting the introduction:** When the thesis is complete, no promised but missing analysis should remain in the introduction.

## In short

The introduction draws a path from broad context to the research gap and then to your study. Close the problem statement with a problem sentence, turn the purpose into measurable research questions, state concrete contributions in the significance section and acknowledge your limitations honestly. For the overall roadmap, see [how to write a thesis](/en/blog/how-to-write-a-thesis), and when building your framework, read our guide to [theoretical and conceptual frameworks](/en/blog/theoretical-vs-conceptual-framework).`,
  },
  "kuramsal-cerceve-kavramsal-cerceve-farki": {
    slug: "theoretical-vs-conceptual-framework",
    title: "Theoretical vs Conceptual Framework: Differences and How to Write Them",
    description: "Learn the difference between a theoretical and a conceptual framework, how to choose a theory, draw a research model and keep this chapter from becoming a literature summary.",
    keywords: ["theoretical framework", "conceptual framework", "how to write a theoretical framework", "research model", "choosing a theory"],
    cta: { text: "Add your sources to the project and compare concepts and findings in the literature matrix; the assistant helps you build your framework using only those sources.", label: "Start for free" },
    body: `"What is your theoretical framework?" is one of the questions that troubles students most at thesis defences. In many theses the chapter titled "Theoretical Framework" is really a collection of definitions and study summaries; it contains no theory or model that guides the research. This guide explains what theoretical and conceptual frameworks are, how they differ and how to write this chapter.

## What is a theory?

A theory is a systematic body of thought that explains a phenomenon, defines relationships between concepts and generates testable predictions. For example:

- **Theory of Planned Behaviour (Ajzen):** Proposes that intention towards a behaviour is shaped by attitude, subjective norms and perceived behavioural control.
- **Technology Acceptance Model (Davis):** Proposes that intention to use a technology is influenced by perceived usefulness and perceived ease of use.
- **Social Cognitive Theory (Bandura):** Explains learning and behaviour through the reciprocal interaction of personal, behavioural and environmental factors; the concept of self-efficacy comes from this theory.
- **Self-Determination Theory (Deci and Ryan):** Explains motivation through the satisfaction of needs for autonomy, competence and relatedness.

What these theories share is that they answer the question: "Which variables matter, and how do they affect each other?"

## What is a theoretical framework?

A theoretical framework **grounds your research in one or more existing theories.** The theory you choose:

- Determines which variables you study,
- Justifies the relationships you expect between them (your hypotheses),
- Provides a reference point for interpreting your findings.

For example, if you study university students' intention to use AI tools, the Technology Acceptance Model is a natural theoretical framework. Its "perceived usefulness" and "perceived ease of use" become your variables, and the relationships it predicts become your hypotheses.

## What is a conceptual framework?

A conceptual framework is a structure **built by the researcher** that shows the key concepts of the study and the assumed relationships between them. It need not rest on a single theory; it can draw on several theories, previous findings and even the researcher's observations.

It is usually shown as a **research model** diagram: boxes represent variables and arrows represent expected relationships, for example a mediation model such as "Self-efficacy → Learning anxiety → Academic achievement".

## The difference at a glance

- **Source:** A theoretical framework rests on an existing, tested theory. A conceptual framework is the researcher's synthesis of several sources.
- **Scope:** A theoretical framework is broad and usable across many studies. A conceptual framework is specific to your study.
- **When to use:** Where a strong theory exists, use a theoretical framework; where theories do not fully explain the topic or the area is new, a conceptual framework is more suitable.

In practice the two are often combined: you build on a theory and then construct a conceptual model that adapts it to your context. Some sources use the terms interchangeably; what matters is stating clearly how you use them.

## How to choose the right theory

1. **Start from your research question.** Is it trying to explain a behaviour, an attitude or a process?
2. **Look at studies in your field.** Which theories do recent articles on your topic use? Note the theory behind each study during your literature review. Our [literature review guide](/en/blog/how-to-write-a-literature-review) explains how to keep these notes as a matrix.
3. **Check whether the theory's variables can be measured.** Are there valid and reliable scales for its concepts?
4. **Read critiques of the theory.** Every theory has limitations, and addressing them in the discussion leaves a strong impression at the defence.
5. **Discuss it with your supervisor.** Theory choice shapes the whole thesis and should be settled early.

In qualitative research, theory is not always the starting point. In grounded theory, for example, the aim is to develop a new theory from the data. In that case, explaining sensitising concepts and the researcher's perspective in the framework chapter is enough.

## How to write this chapter

A good theoretical or conceptual framework chapter can follow this order:

1. **Introducing the theory:** Who developed it, for what purpose, and its core propositions. Cite the primary source that first presented the theory.
2. **Defining key concepts:** What each concept means and how it will be measured in your study.
3. **Studies using the theory:** How it has been applied in similar contexts and with what results.
4. **Adapting it to your study:** Which parts you use, which variables you add or remove, and why.
5. **Research model and hypotheses:** The diagram and the theoretical or empirical justification for each arrow.

The last step is crucial: for every relationship in your model you must be able to answer "why do I expect this?" with a source. Unjustified arrows are the first thing a committee will question.

## Is a theoretical framework the same as a literature review?

No. A literature review summarises and synthesises **what studies on the topic have found**. A theoretical framework shows **the line of thought your research rests on**. The review answers "what is known?", the framework answers "through which lens am I reading this knowledge?".

In many theses both appear in the same chapter, which is fine. The problem arises when the chapter consists only of definitions and study summaries and no theory guides the research.

## Connecting the framework to the rest of the thesis

Theory should not stay in chapter two:

- **In the methods:** The scales you choose should match the theory's concepts.
- **In the results:** Hypothesis tests should follow the relationships in your model.
- **In the discussion:** Discuss whether your findings agree with the theory's predictions. Findings that do not support the theory are as valuable as those that do.

## Common mistakes

- **Naming a theory and never using it:** A theory introduced in chapter two and never mentioned again.
- **Too many theories:** Summarising five theories briefly means none of them guides the research. One main theory, plus one or two complementary ones if needed, is enough.
- **Describing a theory from secondary sources:** Read the original source instead of copying the description from another thesis.
- **An unjustified research model:** Putting variables in boxes and drawing arrows between them is not building a model.
- **Inconsistent terms:** Calling something "self-efficacy" in one chapter and "self-confidence" in another. Define a concept once and use the same term throughout.

## In short

A theoretical framework grounds your research in an existing theory; a conceptual framework shows your concepts and expected relationships in your own model. Choose a theory that fits your research question, read it in its original source, justify every relationship in your model and use the theory in every chapter from methods to discussion. Before writing this chapter, see our guides on [writing the thesis introduction](/en/blog/how-to-write-a-thesis-introduction) and [research questions and hypotheses](/en/blog/how-to-write-research-questions-and-hypotheses).`,
  },
  "sistematik-derleme-meta-analiz-prisma": {
    slug: "systematic-review-meta-analysis-prisma-2020",
    title: "How to Conduct a Systematic Review and Meta-Analysis: A PRISMA 2020 Guide",
    description: "Learn the steps of a systematic review and meta-analysis: framing the question with PICO, protocol registration, search strategy, the PRISMA flow diagram, risk of bias and heterogeneity.",
    keywords: ["systematic review", "how to do a meta-analysis", "prisma 2020", "pico", "prisma flow diagram"],
    cta: { text: "Search several academic databases at once, remove duplicates, add the results to your project and compare them in the literature matrix.", label: "Start for free" },
    body: `Systematic reviews gather and appraise all the evidence on a question using a predefined, transparent method. Because they sit near the top of the evidence hierarchy, journals value them, and when done properly they are a strong option for master's and doctoral theses. But a systematic review is not simply "a thorough literature review". This guide explains the steps of a systematic review and meta-analysis following the PRISMA 2020 statement.

## Narrative review, systematic review and meta-analysis

- **Narrative review:** The author selects and interprets studies. Selection criteria are usually not explicit, so it is prone to bias.
- **Systematic review:** Has a clearly defined question, predefined criteria, a reproducible search and quality appraisal. Another researcher following the same steps should reach similar studies.
- **Meta-analysis:** Statistically combines the numerical results of the included studies to estimate a pooled effect size. Not every systematic review includes a meta-analysis, but every good meta-analysis rests on a systematic review.

## Step 1: Frame the question with PICO

A systematic review succeeds or fails on the clarity of its question. In health and education, the **PICO** framework is widely used:

- **P (Population):** Who? For example, primary school pupils.
- **I (Intervention):** What is applied? For example, gamified mathematics teaching.
- **C (Comparison):** Compared with what? For example, conventional teaching.
- **O (Outcome):** Which outcome is measured? For example, mathematics achievement.

Example question: "In primary school pupils, to what extent does gamified mathematics teaching affect mathematics achievement compared with conventional teaching?"

For questions without an intervention, frameworks such as PECO (exposure), or SPIDER for qualitative studies, can be used.

## Step 2: Write and register a protocol

A protocol defines the review's method **before you begin**: the question, inclusion and exclusion criteria, databases, search strategy, appraisal tool and analysis plan. Writing it in advance reduces the risk of changing the method after seeing the results.

For health-related systematic reviews, **PROSPERO** is the best-known registry. In other fields, protocols can be registered on platforms such as the Open Science Framework (OSF). Report the registration number in your paper or thesis.

## Step 3: Inclusion and exclusion criteria

Criteria must be clear and applicable:

- **Study design:** Only experimental studies, or observational ones too?
- **Publication type:** Peer-reviewed articles, theses, conference papers…
- **Language:** Only English and Turkish? Language restrictions are a limitation; justify them.
- **Date range:** Why this range? For example, from the year the intervention was first described.
- **Outcome measures:** Which outcomes must a study report to be included?

## Step 4: A comprehensive, reproducible search

The search strategy is the foundation of the review:

- **Use several databases.** Depending on your field: Web of Science, Scopus, PubMed, ERIC, PsycINFO and, for Turkish studies, TR Dizin, DergiPark and the YÖK National Thesis Center. See our [DergiPark, TR Dizin and YÖK thesis guide](/en/blog/how-to-search-dergipark-tr-dizin-yok-thesis-center).
- **Combine keywords systematically.** Link synonyms for each PICO element with OR and the elements with AND: (gamification OR "game-based learning") AND (mathematics) AND ("primary school" OR "elementary education").
- **Do not forget grey literature.** Unpublished theses and reports reduce publication bias.
- **Screen reference lists.** Check the references of included studies.
- **Record everything.** Note which database you searched, on what date, with which search string and how many results you found. PRISMA asks for the full search string for at least one database.

## Step 5: Screening and selection

1. Import all results into a reference manager and **remove duplicates**.
2. **Title and abstract screening:** Exclude studies that clearly do not meet the criteria.
3. **Full-text assessment:** Read the remaining full texts and make a final decision. Record the **reason** for every exclusion at this stage.

Ideally, two independent reviewers screen, and disagreements are resolved by discussion or a third reviewer. In thesis work, a supervisor or colleague can act as second reviewer.

## The PRISMA 2020 flow diagram

PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) 2020 is the international guideline for reporting systematic reviews. It includes a 27-item checklist and a **flow diagram** that shows numbers at each stage:

- **Identification:** Records found in each database and other sources; records removed before screening (duplicates and so on).
- **Screening:** Records screened and excluded; reports sought and not retrieved; reports assessed for eligibility and those excluded **with reasons**.
- **Included:** The number of studies and reports included in the review.

The numbers in the flow diagram must add up. It is one of the first things reviewers check.

## Step 6: Data extraction

Decide in advance what you will extract from each study and build a data extraction form: authors, year, country, sample, design, duration and content of the intervention, measures and results (means, standard deviations, sample sizes or effect sizes). Pilot the form on a few studies and refine it.

## Step 7: Assess risk of bias

The methodological quality of each study is assessed with established tools:

- **Randomised controlled trials:** Cochrane's RoB 2 tool.
- **Non-randomised intervention studies:** ROBINS-I.
- **Other designs:** Tools such as the Joanna Briggs Institute (JBI) checklists or the Newcastle-Ottawa Scale.

The GRADE approach can be used to rate the overall certainty of the evidence.

## Step 8: Synthesis and meta-analysis

If studies are sufficiently similar, a meta-analysis is carried out:

- **Effect size:** Standardised mean difference (Cohen's d or Hedges' g) for continuous outcomes; risk ratio or odds ratio for binary outcomes.
- **Model choice:** If studies were done in different populations and settings, a **random-effects model** is usually more appropriate.
- **Heterogeneity:** Shows how much study results differ. Report the Q test and the **I²** statistic. A common interpretation treats I² values of 25%, 50% and 75% as low, moderate and high heterogeneity. With high heterogeneity, explore its sources with subgroup analyses or meta-regression.
- **Forest plot:** Shows each study's effect size and confidence interval, with the pooled effect at the bottom.
- **Publication bias:** Examined with methods such as a funnel plot and Egger's test.

If studies are too different for meta-analysis, you can present results through a structured narrative synthesis. That is still a valid systematic review.

## Common mistakes

- **Starting without a protocol:** A method shaped after the fact invites suspicion of bias.
- **Searching a single database:** Seriously limits coverage.
- **Not reporting the search string:** The review becomes impossible to reproduce.
- **Not recording reasons for exclusion:** Completing the flow diagram becomes impossible.
- **Skipping quality appraisal:** Weighting weak and strong studies equally produces misleading conclusions.
- **Ignoring heterogeneity:** Averaging very different studies may not give a meaningful result.

## In short

A systematic review consists of a clear PICO question, a pre-registered protocol, a reproducible multi-database search, two-stage screening, quality appraisal and reporting in line with PRISMA 2020. Meta-analysis is the quantitative synthesis step of this process when studies are similar enough. For general literature search techniques see [how to write a literature review](/en/blog/how-to-write-a-literature-review), and to keep your sources organised see our [Zotero and Mendeley guide](/en/blog/zotero-mendeley-reference-management-guide).`,
  },
  "yagmaci-dergiler-nasil-anlasilir": {
    slug: "how-to-spot-predatory-journals",
    title: "How to Spot Predatory Journals: A Checklist Before You Submit",
    description: "Learn how to recognise predatory and fake journals: peer review, indexing claims, fees, hijacked journals and a checklist to use before submitting your paper.",
    keywords: ["predatory journals", "how to identify a fake journal", "hijacked journals", "think check submit", "choosing a trustworthy journal"],
    cta: { text: "Get journal suggestions based on your paper's topic and references, then verify the indexing and publication details of each suggested journal yourself.", label: "Start for free" },
    body: `Have you ever received an email saying "Dear Professor, we greatly enjoyed your recent article and would like to publish your work; peer review takes 7 days"? Many such invitations come from **predatory journals** whose only purpose is to collect publication fees. An article published in one can cause problems in promotion applications, reduce the visibility of your research and waste your work. This guide explains how to recognise predatory journals and what to check before you submit.

## What is a predatory journal?

Predatory journals look like academic journals but do not apply the basic standards of scholarly publishing, above all **genuine peer review**. Their main aim is to collect fees from authors. They accept almost every submission, often very quickly and without meaningful evaluation.

Open access and article processing charges (APCs) are not a problem in themselves. Many respected journals are open access and charge APCs. The problem is charging a fee without providing editorial and scholarly service in return.

## Warning signs

None of the following alone proves a journal is predatory, but if several appear together, be careful.

### Invitations and communication

- **Mass, impersonal emails:** Invitations from a journal unrelated to your field, full of exaggerated praise.
- **Very broad scope:** Medicine, engineering, social sciences and agriculture in the same journal. Respected journals usually focus on a defined field.
- **Pressure tactics:** Urgent wording such as "only 3 days left to make this month's issue".

### Peer review

- **Unrealistic timelines:** "Peer review in 72 hours" or "guaranteed fast publication". Genuine peer review usually takes weeks or months.
- **Meaningless or missing review reports:** Reports asking only for formatting changes or containing no substantive critique.
- **Payment demanded immediately after acceptance:** Be cautious if fees were not stated clearly before submission.

### Journal information

- **Dubious indexing claims:** "Indexed in Google Scholar, Index Copernicus, ResearchGate…" Google Scholar is a search engine, not an index. If a journal claims to be in Web of Science or Scopus, check directly in those services' own lists.
- **Fake impact factors:** The official Journal Impact Factor is published in Clarivate's Journal Citation Reports. Similarly named metrics such as "Global Impact Factor" or "Universal Impact Factor" are not the real thing.
- **An unverifiable editorial board:** Members without affiliations, people unaware they are listed or the same names appearing on many unrelated journals.
- **Missing contact and publisher information:** No physical address, or only a generic email address.
- **Poor-quality published articles:** Spelling errors, off-topic papers and many unrelated articles in the same issue.
- **ISSN problems:** No ISSN, an ISSN belonging to another journal, or one that cannot be verified. You can check an ISSN on the ISSN Portal.

## Hijacked journals

A more insidious variant is the **hijacked journal**. Fraudsters set up a fake website that copies the name, ISSN and even the design of a real, respected journal. Authors believe they are submitting to the real journal, pay the fee to the fake site, and the article never appears in the real journal.

To protect yourself, reach the journal's website **through the link in its Web of Science, Scopus or DOAJ record**, not through a web search. The address in the record and the one you reach should be the same.

## A checklist before you submit

**Think. Check. Submit.**, an international initiative, offers questions authors should ask when choosing a journal. Our checklist builds on them:

1. **Do you know this journal and its publisher?** Do you or your colleagues read and cite articles from it?
2. **Is the journal really in the indexes it claims?** Check the Web of Science journal list, the Scopus source list, **DOAJ** (Directory of Open Access Journals) for open-access journals and, for Turkish journals, the **TR Dizin** journal list.
3. **Is the peer review process clearly described?** How many reviewers, what type of review (single- or double-blind), average duration?
4. **Are fees transparent?** Does the website clearly state the publication fee, when it is paid and what it covers?
5. **Is the editorial board made up of real, recognised people in the field?** Check the institutional pages of a few members.
6. **Is the publisher a member of publication ethics organisations?** Membership of COPE (Committee on Publication Ethics) is a good sign; verify it on COPE's own website.
7. **Archiving and permanence:** Do articles receive DOIs? Are past issues consistently accessible?
8. **Are copyright and licensing terms clear?** Is the licence under which the article will be published stated?

## Additional notes for academics in Turkey

Which journals count for academic promotion and incentive applications is determined by the current rules of the relevant institutions, and these rules can change over time. Before submitting, check the **current** criteria of the application you are targeting in the official source. TR Dizin indexing for national journals, and Web of Science and Scopus records for international ones, are the most commonly checked criteria.

Being published on DergiPark is not in itself a sign of quality; DergiPark is a publishing platform. Check whether the journal is also indexed in TR Dizin or international indexes.

## If you have submitted to a predatory journal

- **If it has not been published:** Notify the journal in writing that you are withdrawing the paper and keep their reply. If you have not paid, do not pay.
- **If it has been published:** You can request a retraction, but these journals rarely cooperate. Submitting the same paper elsewhere may raise duplicate publication concerns, so consult a supervisor or your institution's ethics office.
- **Share your experience:** Informing colleagues and your institution helps others avoid the same trap.

## In short

Predatory journals are recognised by promises of fast acceptance, unverifiable indexing and impact factor claims, vague peer review and mass invitation emails. Before submitting, verify indexing directly on the indexes' own websites, reach the journal through the link in those records and ask yourself the Think. Check. Submit. questions. While preparing your paper, our guides on [writing a research paper](/en/blog/how-to-write-and-publish-a-research-paper) and [responding to reviewer comments](/en/blog/how-to-respond-to-reviewer-comments) may also help.`,
  },
};
