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
    title: "How to Do a Literature Review: A Step-by-Step Guide",
    description: "How to search, screen and synthesise sources for a literature review: keywords, databases, inclusion criteria and thematic writing for theses and papers.",
    keywords: ["how to write a literature review", "literature review steps", "how to find academic sources", "systematic review"],
    cta: { text: "Search more than 10 databases at once — including OpenAlex, Crossref, PubMed and DergiPark — with automatic source verification.", label: "Start searching sources" },
    body: `A literature review means finding, evaluating and synthesising existing knowledge on your topic. The goal is not to summarise sources one by one, but to show where knowledge in the field stands today and where your study fits.

## 1. Define your keywords

Write down the core concepts of your topic and add synonyms for each — for example "self-esteem" and "self-worth". Combine concepts with **AND** and widen synonyms with **OR**:

- (self-esteem OR self-worth) AND (social media) AND (university students)

## 2. Choose the right databases

- **General and interdisciplinary:** OpenAlex, Crossref, Semantic Scholar, Google Scholar
- **Health and life sciences:** PubMed, Europe PMC
- **Open access:** DOAJ, CORE
- **Turkish sources:** DergiPark, TR Dizin, the national thesis centre of the Council of Higher Education (YÖK)

Staying in a single database can make you miss important studies.

## 3. Screen your sources

Look at titles and abstracts first, then read the full text of relevant studies. Write your inclusion criteria in advance: publication years, language, study type, sample. If you are doing a systematic review, you are expected to document this process (for example with a PRISMA flow diagram).

## 4. Take notes as you read

For each source, note the aim, sample, method, key findings, limitations and its relationship to your study. Always record the page number of sentences you may quote. Collecting these notes in a table (a literature matrix) speeds up writing enormously.

## 5. Write by themes, not source by source

A weak literature review reads "A found this. B found that." A strong one is organised around themes: which findings support each other, which contradict, and which questions remain open?

## 6. State the gap clearly

At the end of your review the reader should be able to answer: "Why is this study needed?" The gap may be an understudied population, conflicting findings or a missing method.

## Common mistakes

- Interpreting a study as if you read the full text when you only read the abstract
- Relying on outdated sources
- Presenting a secondary source as a primary one
- Leaving reference details to the end and not finding them again

## Literature reviews with Academiana

Academiana plans a search strategy for your topic and searches more than 10 databases at once. Sources are verified via DOI, and every source shows clearly whether it was read at citation, abstract or full-text level. The literature matrix lets you compare sources in a table, and you can quote open-access full texts with page numbers.`,
  },
  "apa-7-atif-kurallari": {
    slug: "apa-7-citation-guide",
    title: "APA 7 Citation Guide: In-Text Citations and Reference Examples",
    description: "APA 7th edition rules for in-text citations, direct quotes, multiple authors, and reference list examples for journal articles, books, websites and theses.",
    keywords: ["APA 7 citation", "APA 7th edition", "APA reference examples", "in-text citation APA", "APA format"],
    cta: { text: "Format citations automatically in 9 styles including APA 7 — change the style and every citation and the reference list update instantly.", label: "Automate my citations" },
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

In Academiana, citations are not typed as plain text; they are linked to the source. The reference list is generated from these links automatically, so deleting a citation removes it from the list too. You can switch between 9 styles — APA 7, MLA, Chicago, IEEE, Vancouver, Harvard, ISNAD and more — with one click, and the quality check finds missing reference details and mismatches for you.`,
  },
  "kaynakca-nasil-hazirlanir": {
    slug: "how-to-write-a-bibliography-citation-styles",
    title: "How to Write a Reference List: APA vs MLA vs Chicago vs IEEE",
    description: "Which citation style should you use? Differences between APA, MLA, Chicago, IEEE, Vancouver and ISNAD, with examples and a checklist for an error-free reference list.",
    keywords: ["how to write a bibliography", "citation styles comparison", "MLA vs APA", "Chicago style citation", "reference list"],
    cta: { text: "Import your library from Zotero, Mendeley or EndNote and generate the reference list in any style automatically.", label: "Build my reference list" },
    body: `A reference list includes every source you cite in your work. It lets readers trace any piece of information back to its source and is a cornerstone of academic integrity. Which style you use is usually decided by your university or the journal, not by you.

## Reference list vs bibliography

- **Reference list:** only the sources you cite in the text.
- **Bibliography:** may also include sources you read but did not cite.

Theses and articles usually require a **reference list**.

## Styles and where they are used

### APA

Common in psychology, education and the social sciences. In-text: (Author, Year). The year follows the author name in the reference list.

### MLA

Used in languages, literature and the humanities. In-text: author and page (Smith 45). The list is titled "Works Cited".

### Chicago

Common in history and the arts. It has two systems: **notes-bibliography** (citations in footnotes) and **author-date**.

### IEEE and Vancouver

Used in engineering (IEEE) and medicine (Vancouver). Citations are numbered in square brackets or superscript: [1]. The list is numbered in order of first appearance.

### ISNAD

A citation system developed in Türkiye and used especially in theology and parts of the social sciences, with footnote and in-text variants. Many Turkish journals require it.

## Checklist for a good reference list

- Does **every** in-text citation have a matching entry?
- Is **every** entry cited somewhere in the text?
- Do author names and years match exactly?
- Are journal title, volume, issue and pages complete?
- Is the DOI included where available?
- Is the order correct (alphabetical for APA/MLA, numerical for IEEE)?
- Is the formatting consistent (italics, punctuation, hanging indent)?

## Reference managers

Tools such as Zotero, Mendeley and EndNote gather your sources in one place and generate the reference list automatically. You can export sources as BibTeX, RIS or CSL-JSON to move them to other tools.

## Reference lists with Academiana

In Academiana you never type the reference list by hand: it is built from the citations in your text and always matches it. You can import from Zotero, Mendeley and EndNote and export in formats those tools read. Clicking an entry shows every section of your text where that source is used, and changing the style takes one click.`,
  },
  "intihal-nasil-onlenir": {
    slug: "how-to-avoid-plagiarism",
    title: "How to Avoid Plagiarism: Quoting, Paraphrasing and Citing Correctly",
    description: "Practical techniques to avoid plagiarism in theses and papers: correct quoting, real paraphrasing and citation. How to read a similarity report and what self-plagiarism is.",
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
    description: "When is using AI in a thesis or paper legitimate, and when is it misconduct? How universities approach it, disclosure requirements and principles for responsible use.",
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
