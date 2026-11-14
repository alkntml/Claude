import type { BlogPostEn } from "./types";

/** İngilizce sürümler (anahtar: Türkçe adres) */
export const EN_1: Record<string, BlogPostEn> = {
  "tez-nasil-yazilir": {
    slug: "how-to-write-a-thesis",
    title: "How to Write a Thesis: A Step-by-Step Guide from Topic to Defence",
    description: "The steps to follow when writing a master’s thesis or PhD dissertation: topic, literature, methods, results, discussion, formatting and the defence.",
    keywords: ["how to write a thesis", "how to write a dissertation", "master's thesis structure", "thesis writing steps"],
    cta: { text: "Start with a ready-made roadmap for your thesis type, section-by-section guidance and an assistant that works with real sources.", label: "Start my thesis" },
    body: `Writing a thesis feels like climbing a mountain at first. In reality, a thesis is a series of connected steps, each of which is manageable on its own. This guide explains the order in which to write a thesis and what to watch for at each stage.

## 1. Narrow your topic

A good thesis topic can be stated in **one sentence**: what you study, in whom and in what context. "Technology in education" is a field; "The relationship between middle-school teachers’ use of digital assessment tools and their years of experience" is a thesis topic. When choosing, also consider whether you can collect the data, how long it will take and whether you need ethics approval.

## 2. Do a preliminary literature search

Do not write research questions before you know how much the topic has been studied. Find the key studies of the last five to ten years, note the methods they used and where the gaps are. The gap is your answer to "why is this study needed?"

## 3. Define your research questions and method

Research questions are the backbone of a thesis; every chapter serves them. If your questions look for relationships, a quantitative design may fit; if they explore experiences and meaning, a qualitative one; if you need both, a mixed-methods design. Always discuss the method with your supervisor.

## 4. Write the chapters in the right order

Theses usually consist of:

- **Introduction:** problem, purpose, significance, research questions, limitations and definitions
- **Theoretical framework and literature review:** concepts and related studies
- **Methods:** design, sample, instruments, analysis
- **Results:** findings, without interpretation
- **Discussion, conclusion and recommendations:** comparing findings with the literature
- **Abstract:** written last

Trying to write the abstract first is a common mistake. The abstract summarises the whole study, so it should be written after the other chapters are finished.

## 5. Support every claim with a source

A scientific claim must rest either on your own data or on a reliable source. While reading, note which information came from which page; page numbers are mandatory for direct quotations.

## 6. Apply formatting rules from the start

Every graduate school has thesis guidelines: margins, typeface, line spacing, heading numbering, title and approval pages. Leaving them to the end can cost you days before submission.

## 7. Check everything and prepare for the defence

Before submitting, check that citations match the reference list, that table and figure numbers are consistent, and fix spelling and punctuation. Then prepare answers to the questions your committee is likely to ask.

## How Academiana helps

When you choose your work type in Academiana, the steps above arrive as a ready-made roadmap. You start by choosing a title, then the chapters follow in order, with the abstract saved for last. The assistant finds sources in real academic databases, checks each chapter against its purpose when you mark it complete, and lets you export your thesis as a formatted Word file. You remain the author; the system guides you.`,
  },
  "tez-konusu-nasil-secilir": {
    slug: "how-to-choose-a-thesis-topic",
    title: "How to Choose a Thesis Topic: 6 Qualities of a Good Topic",
    description: "What to look for when choosing a master’s or PhD thesis topic: originality, feasibility, access to data and fit with your supervisor. Practical tips.",
    keywords: ["how to choose a thesis topic", "thesis topic ideas", "dissertation topic", "finding a research topic"],
    cta: { text: "See publication trends, rising subtopics and how much your field is studied — based on real publication data.", label: "Try the topic finder" },
    body: `Your topic is the most important decision of the thesis process. A poorly chosen topic can force you to start over months later because data cannot be found or the scope has grown out of control. A good topic, on the other hand, makes the writing process easier by itself.

## 6 qualities of a good thesis topic

1. **It interests you.** You will live with it for a year or more. A topic that does not make you curious drains your motivation quickly.
2. **It is narrow enough.** "Social media and young people" is a field; "The relationship between social comparison on social media and self-esteem among university students" is a topic.
3. **It addresses a gap in the literature.** It does not have to be entirely new; revisiting a known question with a different sample, context or method is also an original contribution.
4. **It is feasible.** Can you reach participants, data, equipment or archives? Will you need ethics approval, and how long will it take?
5. **It fits the timeframe.** A master’s thesis is usually planned for one or two semesters. Long longitudinal designs are often better suited to a PhD.
6. **It matches your supervisor’s expertise.** A topic close to your supervisor’s field means better feedback.

## Practical ways to find a topic

- **Read the "future research" sections of recent theses and articles.** Researchers often state explicitly which studies should be done next.
- **Look at publication trends.** A rapidly growing number of publications on a subtopic signals an active debate. If something has never been studied, there may be a reason — check data access.
- **Think about local context.** Topics widely studied internationally but rarely in your country can be a valuable local contribution.
- **Do the one-sentence test.** If you can write "This study examines the relationship between … and … among …", you are on the right track.

## Common mistakes

- Keeping the topic too broad and trying to cover everything
- Choosing the method before the topic ("I will definitely run a survey")
- Claiming "this has never been studied" without checking the literature
- Ignoring the time needed for data collection and ethics approval

## Finding a topic with Academiana

Academiana’s **Topic finder** analyses real publication records in OpenAlex for the field you enter: publications per year, subtopics that grew in the last three years, the share of publications from Türkiye and the most cited recent works. The AI suggests thesis topics based only on these data, and you can start a thesis project from any suggestion with one click.`,
  },
  "literatur-taramasi-nasil-yapilir": {
    slug: "how-to-write-a-literature-review",
    title: "How to Do a Literature Review: A Step-by-Step Guide from Search String to Synthesis",
    seoTitle: "How to Do a Literature Review: Step-by-Step Guide",
    description: "Literature review step by step: research question, search string, databases, inclusion criteria, evaluating sources and writing a thematic synthesis.",
    keywords: ["how to do a literature review", "literature review example", "search string", "literature review steps", "literature search", "literature synthesis"],
    cta: { text: "Search 16 databases at once — including OpenAlex, Crossref, PubMed and DergiPark — with automatic source verification.", label: "Start searching sources" },
    body: `A literature review means **finding, evaluating and synthesizing** what is already known about your topic. The goal is not to summarize sources one by one, but to show where knowledge in the field stands today, where researchers agree and disagree, and where your study fits in. A good literature review builds the rationale of your thesis, supports your methodological choices and prepares the ground on which you will compare your findings in the discussion.

This guide walks through a literature review from start to finish in practical steps: from sharpening the question and building a search string to screening sources and writing by theme.

## Types of literature review

All of them are called “literature reviews”, but their aims and rules differ:

- **Narrative (traditional) review:** The most common type in thesis and article introductions and theoretical chapters. It frames the topic; the search process is not reported in detail.
- **Integrative review:** Brings together studies using different methods to propose a new framework.
- **Scoping review:** Maps what has been studied in a field and how much; appraising study quality is not the main aim.
- **Systematic review:** Follows a pre-registered protocol with a reproducible search and screening process, usually reported with a PRISMA flow diagram. See our [systematic review and PRISMA guide](/en/blog/systematic-review-meta-analysis-prisma-2020).
- **Meta-analysis:** Statistically combines the quantitative results of a systematic review.

A thesis literature chapter is usually a narrative review, but applying the steps below with systematic discipline largely prevents the criticism “you missed an important study”.

## 1. Sharpen your research question

The research question sets the boundaries of the search. A vague question leads to a scattered search. Break the question into components:

- **Who?** Sample or context (e.g. university students, secondary school teachers)
- **What?** The variable, intervention or phenomenon (e.g. social media use)
- **Which outcome?** The result you care about (e.g. academic procrastination)

In the health sciences this structure is known as PICO (population, intervention, comparison, outcome), in the social sciences often as PEO (population, exposure, outcome). Each component becomes a block in your search string.

## 2. Keywords and the search string

For each component, list synonyms, related concepts and spelling variants. Searching only in one language can make you miss important studies; if your topic has a substantial literature in another language (such as Turkish), search in that language too.

- Combine synonyms of one component with **OR**.
- Connect different components with **AND**.
- Put phrases in quotation marks: "social media".
- Use an asterisk for truncation: procrastinat* (procrastination, procrastinating…).

Example search string:

- ("social media" OR "social networking sites") AND (procrastinat*) AND ("university students" OR undergraduate*)

Save your search strings; you may need to report them in your methods section or in a systematic review.

## 3. Choose the right databases

- **General and multidisciplinary:** OpenAlex, Crossref, Semantic Scholar, Google Scholar
- **Health and life sciences:** PubMed, Europe PMC
- **Education:** ERIC
- **Open access:** DOAJ, CORE
- **Turkish sources:** DergiPark, TR Dizin, the YÖK National Thesis Centre

Staying in a single database means missing important studies. Google Scholar is broad, but its results are not reproducible and include non-peer-reviewed material; do not use it as your only source.

## 4. Write inclusion and exclusion criteria in advance

Decide which studies you will include before you start reading. Setting criteria afterwards, after seeing the results, produces a selective literature.

| Criterion | Include | Exclude |
| --- | --- | --- |
| Publication year | Last 10 years (except foundational theoretical works) | Older empirical studies |
| Language | English and Turkish | Other languages |
| Publication type | Peer-reviewed articles, theses | Conference abstracts, blog posts |
| Sample | University students | Child and adolescent samples |
| Method | Quantitative and qualitative empirical studies | Opinion pieces |

This table is an example; build and justify the criteria for your own question.

## 5. Search, screen and keep a record

Screening happens in two stages: first **titles and abstracts**, then the **full texts** of those that look relevant. At each stage, note how many records were excluded and why. A simple search log answers “why didn’t I include this study?” months later:

- Search date, database, search string, number of records found
- Records excluded at title/abstract stage and the main reasons
- Number of full texts read and studies included

If you could not access a study’s full text, record that too. **Do not interpret a study in detail as if you had read the full text when you only read the abstract.**

## 6. Take notes while reading: the literature matrix

Record the same information for every source: aim, sample, method, instrument, main findings, limitations and relevance to your study. Always note the page number of sentences you will quote directly. Collecting these notes in one table (a literature matrix) speeds up writing considerably; see how to build one, with an example, in our [literature matrix guide](/en/blog/how-to-create-a-literature-matrix). Save references in a reference manager from the start: [Zotero and Mendeley guide](/en/blog/zotero-mendeley-reference-management-guide).

## 7. Evaluate your sources

Not every publication carries the same weight. Before using a source, check:

- **Peer review:** Was it published in a peer-reviewed journal? We explain how to avoid predatory journals in [this guide](/en/blog/how-to-spot-predatory-journals).
- **Appropriate methods:** Are the sample size, the validity and reliability of instruments and the analysis adequate?
- **Currency:** How fast does knowledge change in your field? Foundational theoretical works may be old; for empirical findings, prefer recent studies.
- **Primary sources:** Where possible, read a finding in the original study rather than in another author’s summary.

## 8. Write by theme, not source by source

A weak literature chapter reads “A found this. B found that. C also found this.” A strong one is organized around themes: which findings support each other, which conflict, which questions remain open?

A useful pattern for a theme paragraph: **general claim → supporting studies → diverging study → evaluation.**

- **Weak:** “Smith (2019) found a relationship between social media use and procrastination. Jones (2021) reached a similar conclusion. Brown (2022) found no relationship.”
- **Strong:** “Most studies report a positive relationship between social media use and academic procrastination (Smith, 2019; Jones, 2021). That the study finding no relationship (Brown, 2022) measured only time spent online suggests the relationship may depend on how, rather than how long, social media is used.”

The author names here are examples to show the format. The second paragraph uses the same studies but gives the reader a **conclusion** and discusses a possible reason for the difference.

## 9. State the gap explicitly

By the end of your literature chapter, the reader should be able to answer: “Why is this study needed?” The gap might be:

- An under-studied **sample or context** (e.g. graduate students in a particular country)
- **Conflicting findings** and a missing variable that could explain them
- A **methodological gap** (e.g. only cross-sectional studies, no longitudinal ones)
- **Outdated findings** (e.g. instruments or technology have changed)

Avoid absolute claims such as “no study has examined this”; use wording limited to what you searched, such as “few studies in the accessible literature have examined…”.

## 10. Structure of the literature chapter

1. **Short introduction:** Scope of the chapter and order of themes
2. **Theme headings:** One subheading per theme, from general to specific
3. **Evaluation and gap:** The overall state of the literature and your study’s contribution

For the difference between a literature review and a theoretical framework, see our [theoretical vs. conceptual framework guide](/en/blog/theoretical-vs-conceptual-framework).

## When should you stop searching?

When new sources no longer bring new themes or findings and keep citing the same studies, you are approaching saturation. Still, keep your search up to date until submission: missing an important study published while you were writing is a common criticism at the defence.

## Common mistakes

- Interpreting a study whose abstract you read as if you had read the full text
- Searching a single database with keywords in only one language
- Setting inclusion criteria afterwards, based on the results
- Relying on old, outdated sources
- Presenting a secondary source as if it were primary
- Summarizing sources one after another
- Leaving reference details until the end and then not finding them

## Literature reviews with Academiana

Academiana plans a search strategy for your topic and searches 16 databases at once, including OpenAlex, Crossref, Semantic Scholar, PubMed and DergiPark. Sources found are verified by DOI, and each source states clearly whether it was read at metadata, abstract or full-text level. With the literature matrix you can compare sources in a table, with the literature map you can see citation links and missing foundational works, and you can quote open-access full texts with page numbers. When writing the literature chapter, the assistant does not summarize sources one by one; it synthesizes them by theme and cites only sources in your library.`,
  },
  "apa-7-atif-kurallari": {
    slug: "apa-7-citation-guide",
    title: "APA 7 Citation Guide: In-Text Citations and Reference Examples",
    description: "APA 7th edition rules for in-text citations, direct quotes, multiple authors, and reference list examples for journal articles, books, websites and theses.",
    keywords: ["APA 7 citation", "APA 7th edition", "APA reference examples", "in-text citation APA", "APA format"],
    cta: { text: "Format citations automatically in 10 styles including APA 7 — change the style and every citation and the reference list update instantly.", label: "Automate my citations" },
    body: `APA (American Psychological Association) style is the most widely used citation system in the social sciences and education. The current version is the 7th edition. Below are the rules you will need most often, with examples. If your institution’s guidelines differ, follow them.

## In-text citations

APA uses an **author–date** system.

- **Parenthetical:** Social media use may affect self-perception (Smith, 2021).
- **Narrative:** Smith (2021) noted that social media use may affect self-perception.

### By number of authors

- **Two authors:** (Smith & Lee, 2021); in narrative form, Smith and Lee (2021)
- **Three or more authors:** first author plus "et al." from the first citation: (Smith et al., 2021)
- **Group author:** (World Health Organization [WHO], 2023), then (WHO, 2023)
- **Several sources:** alphabetical, separated by semicolons: (Lee, 2019; Smith, 2021)

## Direct quotations

**Page numbers are required** for direct quotations.

- **Short quotes (fewer than 40 words):** in quotation marks: "…" (Smith, 2021, p. 45).
- **Block quotes (40 words or more):** no quotation marks, as a separate indented paragraph; the citation follows the final punctuation.

Use direct quotes sparingly. Academic writing relies mainly on paraphrasing in your own words — with a citation.

## Reference list examples

The reference list is alphabetised by first author’s surname and uses a hanging indent.

**Journal article:**
Smith, A., & Lee, B. (2021). Social media use and self-esteem among university students. *Journal of Youth Studies, 24*(5), 123–140. https://doi.org/10.xxxx/xxxxx

**Book:**
Smith, A. (2020). *Research methods* (3rd ed.). Publisher Name.

In APA 7, the publisher location is no longer included for books.

**Book chapter:**
Lee, B. (2019). Scale adaptation. In A. Smith (Ed.), *Measurement in education* (pp. 45–67). Publisher Name.

**Web page:**
Organization Name. (2023, March 5). *Title of the page*. Site Name. https://…

**Thesis:**
Smith, A. (2022). *Title of the thesis* [Master’s thesis, University Name]. Database Name.

## Key changes in APA 7

- DOIs are formatted as links: https://doi.org/…
- "Retrieved from" is used only for content that is likely to change.
- Up to 20 authors are listed in the reference list.
- Publisher location has been removed for books.

## Most common mistakes

- A source cited in the text missing from the reference list (or vice versa)
- Mismatched years: 2020 in the text, 2021 in the references
- Forgetting page numbers for direct quotes
- Not distinguishing two works by the same author in the same year (2021a, 2021b)

## Automatic APA 7 with Academiana

In Academiana, citations are not typed as plain text; they are linked to the source. The reference list is generated from these links automatically, so deleting a citation removes it from the list too. You can switch between 10 styles — APA 7, ISNAD, MLA, Chicago, IEEE, Vancouver, Harvard and more — with one click, and the quality check finds missing reference details and mismatches for you.`,
  },
  "kaynakca-nasil-hazirlanir": {
    slug: "how-to-write-a-bibliography-citation-styles",
    title: "How to Write a Reference List: APA, MLA, Chicago, IEEE and ISNAD Examples",
    seoTitle: "How to Write a Reference List: Examples in 7 Styles",
    description: "How to write a reference list: one source in APA 7, MLA, Chicago, IEEE, Vancouver and ISNAD, plus DOIs, ordering rules and a checklist.",
    keywords: ["how to write a reference list", "reference list example", "bibliography examples", "ISNAD reference", "MLA works cited", "IEEE reference"],
    cta: { text: "Import your library from Zotero, Mendeley or EndNote and generate the reference list in any style automatically.", label: "Build my reference list" },
    body: `A reference list contains every source you cite in your work. It lets readers trace each piece of information back to its source and is a cornerstone of academic integrity. Examiners and reviewers form a strong first impression of how carefully a work was prepared from its reference list: incomplete references, citations in the text that are missing from the list and inconsistent formatting are among the most common requests for revision.

This guide explains how to prepare a reference list, how the most common citation styles differ and how the same source looks in each style, with examples.

## Reference list versus bibliography

- **Reference list:** Only the sources you cite in the text.
- **Bibliography:** May also include sources you read but did not cite.

Theses and articles usually require a **reference list**. Every citation in the text must appear in the list, and every source in the list must be cited in the text.

## Who decides the style?

The style is usually decided not by you but by your institute’s thesis guidelines or the journal. Guidelines may name a style and then depart from it at certain points (e.g. “APA 7, but give authors’ full first names in the reference list”). In such cases, **the guideline’s own rule takes precedence**. Read the guidelines before you start writing; changing style later costs a lot of time.

## The same source in seven styles

The best way to see the differences is to look at one source in different styles side by side. The examples below show a citation to page 50 of a **fictional** journal article (Demir and Kaya, 2022, *Örnek Eğitim Dergisi*, volume 12, issue 3, pages 45–62) and its reference list entry. All examples were generated with Academiana’s citation engine.

### APA 7

- **In-text:** (Demir & Kaya, 2022, p. 50)
- **Reference list:** Demir, M., & Kaya, E. (2022). Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme. Örnek Eğitim Dergisi, 12(3), 45–62.

### MLA 9

- **In-text:** (Demir and Kaya 50)
- **Reference list:** Demir, Mehmet, and Elif Kaya. “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme.” Örnek Eğitim Dergisi, vol. 12, no. 3, 2022, pp. 45–62.

### Chicago (author-date)

- **In-text:** (Demir and Kaya 2022, 50)
- **Reference list:** Demir, Mehmet, and Elif Kaya. 2022. “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme.” Örnek Eğitim Dergisi 12 (3): 45–62.

### IEEE

- **In-text:** [1, p. 50]
- **Reference list:** M. Demir and E. Kaya, “Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme,” Örnek Eğitim Dergisi, vol. 12, no. 3, pp. 45–62, 2022.

### Vancouver

- **In-text:** [1, p. 50]
- **Reference list:** Demir M, Kaya E. Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme. Örnek Eğitim Dergisi. 2022;12(3):45-62.

### ISNAD 2 (in-text)

- **In-text:** (Demir - Kaya, 2022, 50)
- **Reference list:** Demir, Mehmet - Kaya, Elif. “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”. Örnek Eğitim Dergisi 12/3 (2022), 45-62.

### ISNAD 2 (footnotes)

- **First footnote:** Mehmet Demir - Elif Kaya, “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”, Örnek Eğitim Dergisi 12/3 (2022), 45-62/50.
- **Subsequent footnotes:** Demir - Kaya, “Üniversite Öğrencilerinde Sosyal”, 52.
- **Reference list:** Demir, Mehmet - Kaya, Elif. “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”. Örnek Eğitim Dergisi 12/3 (2022), 45-62.


## The styles at a glance

| Style | Common fields | In-text citation | List order | List title |
| --- | --- | --- | --- | --- |
| APA 7 | Psychology, education, social sciences | Author, year | Alphabetical | References |
| MLA 9 | Languages, literature, humanities | Author, page | Alphabetical | Works Cited |
| Chicago (author-date) | History, arts, social sciences | Author year, page | Alphabetical | References |
| IEEE | Engineering, computing | Number in square brackets | Order of first citation | References |
| Vancouver | Medicine, health sciences | Number | Order of first citation | References |
| ISNAD 2 (in-text) | Theology and some social sciences | Author, year, page | Alphabetical | Bibliography |
| ISNAD 2 (footnotes) | Theology, history | Footnote | Alphabetical | Bibliography |

You can find details on ISNAD in our [ISNAD citation style guide](/en/blog/isnad-citation-style-guide) and APA’s in-text rules in our [APA 7 citation guide](/en/blog/apa-7-citation-guide).

## Information needed by source type

Whatever the style, record this information from the start:

- **Journal article:** Authors, year, article title, journal name, volume, issue, page range, DOI
- **Book:** Authors or editors, year, title, edition (second and later), publisher; place of publication in some styles
- **Book chapter:** Chapter authors, chapter title, editors, book title, page range, publisher
- **Thesis:** Author, year, title, type (master’s/doctoral), university; database and thesis number if accessed online
- **Web page:** Author or organization, date, page title, site name, URL; access date if the content may change

If any of these is missing, the reference is incomplete too. The most often forgotten items are the issue number, page range and DOI.

## What is a DOI and why does it matter?

A DOI (Digital Object Identifier) is a persistent identifier assigned to a publication. Even if the publication’s web address changes, the DOI stays the same and always leads to the right page. APA 7 asks for the DOI as a link starting with https://doi.org/. Adding the DOI lets readers reach the source with one click and makes it easy to verify that the source exists. You can find a source’s DOI or missing details with our free [reference generator](/en/araclar/kaynakca-olusturucu).

## Ordering and formatting rules

- **Alphabetical styles** (APA, MLA, Chicago, ISNAD) sort by the first author’s surname.
- **Two works by the same author in the same year** are distinguished in APA by adding a letter to the year: 2021a, 2021b.
- **Numbered styles** (IEEE, Vancouver) number sources in order of first citation; a source cited again keeps its number.
- **Hanging indent:** In APA, MLA and Chicago the first line of each entry is flush left and the following lines are indented.
- **Capitalization:** APA capitalizes only the first word and proper nouns in article titles; ISNAD and Chicago capitalize the main words. You can see this difference in the examples above.

## Reference list checklist

- Does **every** citation in the text have an entry in the list?
- Is **every** source in the list cited in the text?
- Do author names and years match the text exactly?
- Are journal name, volume, issue and page numbers complete?
- Is the DOI included where available?
- Is the order correct (surname in alphabetical styles, order of first citation in numbered styles)?
- Is the formatting consistent (italics, punctuation, hanging indent, capitalization)?
- Does every source really exist, and does it really contain the information you cite?

## Watch out for fabricated references

AI chat tools can produce references that do not exist but look real: real author names, real journal titles and convincing DOIs. Such a reference in your list is a serious academic integrity problem. Find and read every source in your list yourself; you can check your list with our free [fabricated reference checker](/en/araclar/uydurma-kaynak-kontrolu). For details, see our guide to [detecting AI-fabricated references](/en/blog/detecting-ai-fabricated-references).

## Reference managers

Programs such as Zotero, Mendeley and EndNote collect your sources in one place and generate the reference list automatically. You can export saved sources as BibTeX, RIS or CSL-JSON and move them to other tools. See our [Zotero and Mendeley guide](/en/blog/zotero-mendeley-reference-management-guide) for setup and use. However good the program, always check automatically generated entries: missing page ranges and wrong capitalization are common.

## Common mistakes

- A source cited in the text is missing from the list (or vice versa)
- The same source appears with a different year or spelling in the text and the list
- Taking a source you have not read from another author’s summary and presenting it as primary: our [plagiarism guide](/en/blog/how-to-avoid-plagiarism) explains the rules for secondary citations
- Mixing styles in one reference list
- Trying to build the whole reference list at the end of the thesis

## References with Academiana

In Academiana the reference list is not typed by hand; it is generated from the citations in your text and always matches it. Delete a citation from the text and the source leaves the list too. You can switch among 11 styles with one click, including APA 7, ISNAD 2 (in-text and footnotes), MLA, Chicago, IEEE, Vancouver and Harvard; with ISNAD footnotes, citations become real footnotes in Word, PDF and LaTeX output. You can import sources from Zotero, Mendeley and EndNote and export your list in formats these programs read. The quality check finds incomplete references, unverifiable sources and mismatches between text and list for you.`,
  },
  "intihal-nasil-onlenir": {
    slug: "how-to-avoid-plagiarism",
    title: "How to Avoid Plagiarism: Quoting, Paraphrasing and Citing Correctly",
    description: "How to avoid plagiarism in theses and papers: correct quoting, real paraphrasing, citation, reading a similarity report and self-plagiarism.",
    keywords: ["how to avoid plagiarism", "reduce similarity score", "paraphrasing", "similarity report", "self-plagiarism"],
    cta: { text: "Work with an assistant that links every claim to a source, quotes with page numbers and never writes unsupported claims.", label: "Write with proper citations" },
    body: `"How do I lower my plagiarism score?" is one of the most searched questions by students. But the real goal is not to lower a software score; it is **not to plagiarise**. Once you build the habit of correct citation and paraphrasing, the similarity report stops being a problem by itself.

## What is plagiarism?

Presenting someone else’s ideas, data, text or structure as your own without credit is plagiarism. It does not have to be intentional; careless plagiarism is still plagiarism. Main types:

- **Direct copying:** reproducing text without quotation marks and citation
- **Patchwriting (mosaic plagiarism):** changing a few words of a source while keeping its structure
- **Idea plagiarism:** describing someone’s original idea in your own words without credit
- **Self-plagiarism:** reusing your previously published text without acknowledgement

## A similarity report is not a plagiarism verdict

Tools such as Turnitin and iThenticate show how **similar** your text is to other texts; they do not decide whether plagiarism occurred. Correctly quoted passages, the reference list, common phrases and scale items can all appear as matches. That is why supervisors and committees interpret the report. Acceptable thresholds vary by institution; check your own guidelines.

## 7 ways to avoid plagiarism

1. **Take notes, do not copy.** Mixing copied sentences with your own notes is the most common cause of accidental plagiarism. Keep copied text in quotation marks with page numbers.
2. **Paraphrase for real.** Read the source, close it, write what you understood in your own sentence structure, then compare. Swapping synonyms is not paraphrasing.
3. **Cite paraphrases too.** Writing in your own words does not make the idea yours.
4. **Use direct quotes sparingly and correctly.** Quotation marks, citation and page number go together.
5. **Recognise common knowledge.** "Paris is the capital of France" needs no citation; a research finding does.
6. **Cite your own earlier work.** If you include a published article in your thesis, say so.
7. **Check before submitting.** Run your draft through your university’s similarity tool and review every match.

## What if your similarity score is high?

- Open each match: is it a correctly cited quote, the reference list, or uncited text?
- Genuinely rewrite uncited passages and add their sources.
- Shorten long direct quotes or turn them into paraphrases.
- Ask your supervisor for a report that excludes quotes and references.

"Spinning" tools that make text unreadable, or character tricks, are unethical and easily spotted by committees. They can lead to disciplinary action.

## The Academiana approach

Academiana does not display a plagiarism percentage, because a reliable score can only come from licensed services with large archives. Instead, it helps you avoid plagiarism in the first place: the assistant cites only real sources added to your project, never writes unsupported claims, gives page numbers when drawing on full texts it has read, and flags repetitive phrasing in your text.`,
  },
  "yapay-zeka-ile-tez-yazmak-etik-mi": {
    slug: "is-it-ethical-to-use-ai-for-thesis-writing",
    title: "Is It Ethical to Use AI to Write a Thesis? Right and Wrong Uses",
    description: "Is using AI for a thesis ethical? When it is legitimate, when it is misconduct, disclosure requirements and principles for responsible use.",
    keywords: ["is using AI for thesis ethical", "can I use ChatGPT for my thesis", "AI academic integrity", "AI disclosure statement"],
    cta: { text: "Work with an assistant that never fabricates sources, links every claim to a real reference and keeps you as the author.", label: "Our academic integrity principles" },
    body: `AI tools are spreading quickly in academic work, and students are asking: "Will I get into trouble if I use them?" The short answer: **it depends on how you use them.** AI can be legitimate as an assistant; replacing the author is a serious ethical problem.

## How institutions approach it

Universities and journals are publishing AI guidelines that change quickly. Common points:

- AI cannot be listed as an **author**; responsibility always lies with humans.
- If AI was used, you are often expected to **disclose** it (which tool, for what purpose).
- The author is responsible for the accuracy of any generated content.

Always read the current guidelines of your institution and target journal.

## Generally accepted uses

- Brainstorming topics and research questions
- Generating search terms for a literature review
- Improving the language and flow of text you wrote
- Understanding a concept or statistical method
- Getting critical feedback on your draft

## Uses that create ethical problems

- Having AI write chapters and submitting them without reading
- Using AI-generated **sources without verifying them**
- Fabricating data, results or statistics
- Hiding AI use where disclosure is required

## The biggest risk: fabricated references

General-purpose chatbots can produce articles, authors and DOIs that do not exist. These references look convincing — until a committee member or reviewer tries to find them. A fabricated reference is a serious integrity problem.

## 5 principles for responsible use

1. **You are the author.** You must stand behind every sentence and explain it in your defence.
2. **Verify every source.** Use a source only if you actually found and read it.
3. **Never generate data.** Results come only from data you collected.
4. **Transform drafts.** Rewrite and develop AI suggestions with your own thinking.
5. **Disclose.** If your institution requires it, state which tool you used and why.

## Academiana is built on these principles

In Academiana the assistant cannot fabricate sources at system level: it can only cite sources found in real databases and added to your project. It never writes unsupported claims and leaves "[DATA TO BE ENTERED]" where data is needed. No draft enters your document until you click "Add to document", and every change is kept in version history. See our [academic integrity principles](/akademik-durustluk) for details.`,
  },
  "yapay-zeka-tespit-araclari": {
    slug: "are-ai-detectors-reliable",
    title: "Are AI Detectors Reliable? The Facts Students Need to Know",
    description: "How do AI detection tools like Turnitin work and how reliable are they? What to do if your own writing is flagged as AI-generated. An honest guide.",
    keywords: ["are AI detectors reliable", "Turnitin AI detection", "AI detector false positive", "flagged as AI"],
    cta: { text: "Keep a version history of your writing process so you can always show your own work.", label: "Start for free" },
    body: `Many universities now run submissions through AI detection tools. That raises two questions for students: "How do these tools work?" and "What happens if my own writing is wrongly flagged?"

## How detection tools work

These tools cannot know for certain who wrote a text. They estimate a **probability** based on statistical features — how predictable the word choices are, how uniform sentence lengths are, and similar signals.

## How reliable are they?

- **False positives happen.** Human-written text can be flagged as AI. Formulaic academic prose, short texts and English written by non-native speakers are particularly at risk.
- **Results vary between tools.** The same text can get very different scores in different detectors.
- **A score is not proof on its own.** Many institutions recommend not using a detection score as the sole basis for a decision; it is treated as a signal to start a review.

## What you can do about false positives

1. **Document your process.** Drafts, notes, version history and reading records are the strongest evidence that you wrote the text.
2. **Keep your own voice.** Use your own examples, observations and study-specific details.
3. **Know your institution’s rules.** If you used AI and disclosure is required, disclose it. Limited, legitimate and declared use is usually not a problem.
4. **Use your right to appeal.** If you believe you were wrongly flagged, talk to your supervisor and present your process records.

## Beware of "undetectable" promises

Tools that claim to "humanise" AI text or help it "bypass" detectors have two problems. First, they aim to hide an integrity violation. Second, they often turn text into broken, unnatural language that committees easily notice.

## The right approach

Use AI as a research and editing assistant, not as a replacement for the author. When you read drafts and rewrite them with your own thinking, the text becomes both better and genuinely yours.

## Academiana’s position

Academiana offers no feature to evade detection tools and makes no such promise. Instead, it keeps your process transparent: the state before each assistant insertion and your manually saved versions are kept in history, so you can always show how your text developed. Assistant suggestions enter your text only when you add them.`,
  },
};
