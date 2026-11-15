import type { BlogPostEn } from "./types";

const CALL = "\n\n## Always follow the current call document\n\nApplication dates, funding amounts, eligibility conditions and form templates can change from call to call. This guide covers general writing principles; for dates, amounts and conditions, always read the current call and guide for applicants on the program’s official website.\n";

/** English versions, file 10 (D200). No amounts or dates (tests/blog-d200.test.ts). */
export const EN_10: Record<string, BlogPostEn> = {
  "tubitak-1001-arastirma-projesi-nasil-yazilir": {
    slug: "tubitak-1001-research-project-proposal",
    title: "How to Write a TÜBİTAK 1001 Research Project Proposal: Originality, Method and Management",
    seoTitle: "How to Write a TÜBİTAK 1001 Research Proposal",
    description: "TÜBİTAK 1001 research project proposal: how to write the originality, method, project management, wider impact and budget sections the way panels assess them.",
    keywords: ["TÜBİTAK 1001", "1001 project proposal", "ARDEB research grant", "Turkey research funding", "writing originality section", "work package and risk table"],
    cta: { text: "Choose 1001 in the “TÜBİTAK / BAP project proposal” work type and get the sections from originality to budget ready.", label: "Prepare my 1001 proposal" },
    body: `The TÜBİTAK 1001 Scientific and Technological Research Projects Funding Program is one of the research funding programs academics in Turkey apply to most. Applications are reviewed by expert panelists of TÜBİTAK’s Research Support Programs Directorate (ARDEB). Assessment usually follows the main sections of the proposal: **originality, method, project management and wider impact**. This guide explains how to write each section from a panelist’s point of view.

## How panelists read a proposal

Panelists read many proposals in a short time. A good proposal lets them answer these questions in the first pages:

- Which question does the project answer, and why does it matter?
- Why has the literature not answered it yet?
- Can the proposed method really answer it?
- Can the team finish the project within its time and budget?
- What concrete outputs will exist at the end?

Build each section to answer one of these questions.

## Originality

The originality section is the heart of the proposal. It has three parts:

1. **Importance of the topic:** Describe the problem and why it matters, with current, reliable sources.
2. **Gap in the literature:** Show clearly what is known and what is not. Instead of claims such as “there are no studies on this”, use verifiable statements such as “existing studies are limited to … samples”.
3. **Research questions and hypotheses:** Write concrete questions that fill the gap.

Originality does not mean “a new topic”; a new method, sample, context or theoretical lens can also be original. What matters is showing the difference clearly. See our [research question and hypothesis guide](/en/blog/how-to-write-research-questions-and-hypotheses) and, for showing the gap, our [literature matrix guide](/en/blog/how-to-create-a-literature-matrix).

## Method

The method shows how each research question will be answered. Panelists look for the link between question and method:

- Design and its rationale
- Sample and sample size calculation ([sample size guide](/en/blog/how-to-calculate-sample-size))
- Instruments with validity and reliability information
- Analysis and which question each analysis answers
- Ethics approval and permissions

Show feasibility: are the laboratory, software or access to participants in place? If you ran a pilot study, summarize its results; it is strong evidence of feasibility.

## Project management: work packages and risks

Divide the project into work packages and give each a duration, a responsible person and a success criterion:

| Work package | Duration | Responsible | Success criterion |
| --- | --- | --- | --- |
| Literature and design | Months 1–3 | Principal investigator | Data collection protocol ready |
| Data collection | Months 4–12 | Researcher, scholarship student | Planned sample reached |
| Analysis | Months 13–16 | PI, researcher | Analysis report completed |
| Publication and reporting | Months 17–18 | Whole team | Article submitted, final report delivered |

This table is an example; durations depend on your project and what the call allows. Write a plan B for each major risk: what happens if data collection is delayed, a device breaks or a team member leaves?

## Wider impact

Wider impact is who the results will reach and how. Write expected outputs concretely:

- Scientific: articles, conference papers, graduate theses
- Economic or social: guides for practitioners, policy recommendations, products or software
- Capacity: graduate students trained in the project, infrastructure built
- New projects: national or international applications the project will lead to

Write measurable targets instead of general phrases such as “will make an important contribution”.

## Budget justification

Link every budget item to the method. Panelists ask “Where is this device used in the method?” or “Why is this much travel needed?”. Items with no counterpart in the method are cut and undermine the proposal’s credibility.

## Common mistakes

- Not showing the gap with sources in the originality section
- Not linking research questions to the method
- An unrealistic timeline and no risk plan
- Not relating the team’s expertise to the project
- Resubmitting the same proposal after rejection without reading the panel comments

A rejected proposal can be improved and resubmitted; read panel comments like a peer review report and address each criticism in the proposal. For a short, focused pilot, see our [1002-A Rapid Support guide](/en/blog/tubitak-1002-a-rapid-support-application-guide).${CALL}
## Your 1001 proposal with Academiana

In Academiana, choose the “TÜBİTAK / BAP project proposal” work type and set the program to “TÜBİTAK 1001 Research Projects”: the originality, method, project management, wider impact and budget sections come ready. The assistant helps you show the gap with the real sources you add to your project and drafts the work package and risk tables. It does not invent budget amounts, durations or program rules; you check and enter these from the call.`,
  },
  "bap-projesi-nasil-hazirlanir": {
    slug: "bap-university-research-project-guide",
    title: "How to Prepare a BAP Project: A Guide to University Research Project Funding in Turkey",
    seoTitle: "How to Prepare a BAP University Research Project",
    description: "University BAP (Scientific Research Projects) funding in Turkey: project types, thesis projects, regulations, form sections and budget justification.",
    keywords: ["BAP project", "BAP application", "BAP thesis project", "university research funding Turkey", "scientific research projects", "research budget justification"],
    cta: { text: "Choose BAP in the “TÜBİTAK / BAP project proposal” work type and get the summary, aims, method, timeline and budget sections ready.", label: "Prepare my BAP proposal" },
    body: `BAP (Scientific Research Projects) is the system through which universities in Turkey fund research by academic staff and graduate students from their own budgets. The materials, equipment, software, fieldwork and analysis costs of graduate theses are often covered by BAP. Because it is more accessible than TÜBİTAK funding, it is a good start for a first project.

## Every university has its own rules

The key feature of BAP is that rules vary between universities. Project types, application dates, funding limits, form templates and the review process are set out in each university’s **BAP regulations** and the announcements of its BAP coordination office. Before applying:

- Read your university’s BAP regulations in full.
- Download the current form template from the application system.
- Note the conditions for your project type (who can be principal investigator, the supervisor’s role in thesis projects, duration).
- Ask the BAP office if anything is unclear; an application returned for an unclear condition costs time.

## Common BAP project types

Names differ, but most universities have project types similar to these:

| Project type | For whom | Typical aim |
| --- | --- | --- |
| Graduate thesis project | Master’s and doctoral students (supervisor as PI) | Data collection and analysis costs of the thesis |
| Research project | Academic staff | Investigating an independent research question |
| Starter / early-career project | Recent PhDs | Supporting a first independent project |
| Infrastructure project | Research groups | Equipment and laboratory infrastructure |
| Support for externally funded projects | Projects funded by TÜBİTAK etc. | Co-funding or additional costs |

In thesis projects the supervisor is usually the principal investigator and the student a researcher; this can vary by regulation.

## Sections of the proposal

BAP forms are usually similar to TÜBİTAK proposals but shorter:

1. **Summary and keywords:** Aim, method and expected output in one paragraph.
2. **Aim and scope:** Research question and limits of the project.
3. **Literature and originality:** Importance of the topic and what is new, with sources.
4. **Method:** Design, sample, data collection, analysis. In a thesis project, the method from your thesis proposal can be adapted; see the [thesis proposal guide](/en/blog/how-to-write-a-research-proposal).
5. **Timeline:** Stages and durations.
6. **Budget and justification:** Each item and why it is needed.
7. **Expected outputs:** Thesis, articles, conference papers.

## Justifying the budget

The budget is the most common problem in BAP reviews. Rules:

- Link each item to a task in the method: “This kit is needed for … samples for the … analysis described in the method.”
- Attach a current quote or catalog price; many universities ask for a pro forma invoice.
- Don’t include items the regulations do not fund (at some universities, computers, furniture or personal expenses).
- Don’t request items available in existing infrastructure; mention that infrastructure in the proposal instead.

## Ethics approval and permissions

Projects involving human participants or animal experiments usually need ethics approval before application or before the project starts. Check at which stage your regulations require it and plan for it: [ethics committee guide](/en/blog/how-to-apply-for-ethics-committee-approval).

## During and after the project

Purchasing in an approved project follows university procurement rules and can take time; schedule purchasing early. Interim and final reports may be required. Most regulations require acknowledging BAP funding (with the project number) in publications. BAP experience is evidence of your ability to run a project in later [TÜBİTAK 1001](/en/blog/tubitak-1001-research-project-proposal) or [2209-A](/en/blog/tubitak-2209-a-research-project-application-guide) applications.

## Common mistakes

- Using another university’s template without reading your own regulations
- Copying the thesis proposal into the BAP form without adapting it
- An unjustified or inflated budget
- Not allowing for procurement time in the timeline
- Forgetting to acknowledge BAP funding in outputs${CALL.replace("on the program’s official website", "from your university’s BAP office")}
## Your BAP proposal with Academiana

In Academiana, choose the “TÜBİTAK / BAP project proposal” work type and set the program to “University research fund (BAP) project”: the summary, aims, method, timeline and budget justification sections come ready. If your thesis project is in Academiana, it helps you adapt your method chapter to the proposal. It does not invent budget amounts or regulation rules; you check and enter these from your university’s regulations.`,
  },
  "tubitak-2214-a-2219-yurt-disi-arastirma-bursu": {
    slug: "tubitak-2214-a-2219-research-abroad-fellowship",
    title: "TÜBİTAK 2214-A and 2219 Research Abroad Fellowships: How to Write the Research Plan",
    seoTitle: "TÜBİTAK 2214-A and 2219 Applications: Research Plan",
    description: "TÜBİTAK 2214-A (doctoral) and 2219 (postdoctoral) research abroad fellowships: invitation letter, research plan and choosing a host institution.",
    keywords: ["TÜBİTAK 2214-A", "TÜBİTAK 2219", "doctoral research abroad fellowship", "postdoctoral research fellowship", "invitation letter", "how to write a research plan"],
    cta: { text: "Choose “Research proposal for a scholarship application” in the “TÜBİTAK / BAP project proposal” work type and get the aim, method, timeline and expected contribution sections ready.", label: "Prepare my research plan" },
    body: `TÜBİTAK’s research abroad fellowships support researchers in Turkey to spend time conducting research at an institution abroad. This guide covers the two most popular programs: the **2214-A International Doctoral Research Fellowship Program** (for doctoral students) and the **2219 International Postdoctoral Research Fellowship Program** (for researchers with a PhD). In both, the application centers on a **research plan** describing what you will do abroad and an **invitation letter** from the host institution.

## The difference between the two programs

| | 2214-A | 2219 |
| --- | --- | --- |
| For whom | Doctoral students | Researchers who have completed a PhD |
| Aim | Conduct part of the thesis research abroad | Conduct independent research abroad |
| Focus of the research plan | Link to the thesis and which part will be done abroad | The researcher’s own project and career development |
| Key documents | Supervisor approval and host invitation | Host invitation |

Duration, monthly amounts and conditions such as language certificates are set in the call and can change.

## Choosing a host institution and supervisor

The strength of the application depends largely on the right host:

1. **Fit:** Choose a researcher or group with publications directly related to your research question. Reviewers look for an answer to “Why this institution?”.
2. **Added value:** Show that the host offers a method, data, equipment or expertise you cannot access in Turkey.
3. **Contact:** Your first email should include a short introduction, a one-paragraph summary of your research idea, why you want to work with them and your CV. Mass, non-personalized emails usually go unanswered.
4. **Timing:** Getting an invitation letter can take weeks; start months before the call.

## What the invitation letter should include

A good invitation letter does not just say “we accept”. These points strengthen your application:

- The research topic and the host’s contribution to it
- Duration and dates of the stay
- Facilities provided (office, laboratory, data, library)
- The host researcher’s signature and institutional details

Sharing a draft with these points makes it easier for your host; the letter must reflect real information the host has approved.

## Structure of the research plan

1. **Aim and importance:** Research question and contribution to the field.
2. **Literature and gap:** Brief, referenced and current. See our [literature matrix guide](/en/blog/how-to-create-a-literature-matrix).
3. **Method:** Which data, method or equipment will be used abroad. For 2214-A, state clearly why this part of the thesis must be done abroad.
4. **Timeline:** What will be done month by month.
5. **Expected outputs:** Articles, joint publications, a thesis chapter, new collaborations.
6. **Contribution after return:** How the knowledge and connections gained will feed into your work and institution in Turkey.

## The consistency reviewers look for

The research plan, invitation letter, CV and (for 2214-A) thesis proposal must be consistent. Equipment named in the plan should appear in the letter; the timeline should match the dates in the letter; the methods promised should be supported by your experience.

## Common mistakes

- Choosing a host only for the institution’s reputation
- Not making the work abroad concrete (“a literature review will be done” is not enough)
- An overly broad plan: propose a focused work package that can be finished in the time available
- Not describing the contribution after return
- Leaving the invitation letter to the last week

For other options abroad, see our [Fulbright](/en/blog/fulbright-application-personal-statement) and [Marie Skłodowska-Curie postdoctoral fellowship](/en/blog/msca-postdoctoral-fellowship-application) guides.${CALL}
## Your research plan with Academiana

In Academiana, choose “Research proposal for a scholarship application” in the “TÜBİTAK / BAP project proposal” work type: the aim, literature, method, timeline and expected contribution sections come ready. For 2214-A, if your thesis project is in Academiana, it helps you adapt your method and literature to the plan. It does not invent host institutions, dates or fellowship conditions; you enter these yourself.`,
  },
  "nsf-grfp-basvurusu-nasil-yazilir": {
    slug: "nsf-grfp-personal-statement-research-plan",
    title: "NSF GRFP Application: How to Write the Personal Statement and Research Plan",
    seoTitle: "NSF GRFP: Personal Statement and Research Plan Guide",
    description: "Applying for the NSF Graduate Research Fellowship Program (GRFP): eligibility, Intellectual Merit and Broader Impacts, the two statements and reference letters.",
    keywords: ["NSF GRFP", "NSF GRFP personal statement", "NSF graduate research plan", "intellectual merit broader impacts", "graduate research fellowship", "GRFP tips"],
    cta: { text: "Choose “Other institution / fund” in the “TÜBİTAK / BAP project proposal” work type and write your research plan with aim, method and impact sections.", label: "Write my research plan" },
    body: `The NSF GRFP (National Science Foundation Graduate Research Fellowship Program) is a long-standing U.S. fellowship supporting graduate students in science, technology, engineering and mathematics (STEM), STEM education and some social science fields. As one of the best-known graduate research fellowships in the U.S., its statements are a model for statement writing in many programs. This guide explains the structure of the application and how to write the two core statements.

## Check eligibility first

Only applicants meeting specific conditions can apply. According to the program solicitation, applicants must be **U.S. citizens, U.S. nationals or permanent residents**; the stages of graduate study at which one can apply and the supported fields are also limited. International students without U.S. permanent residence cannot apply; international programs such as [Fulbright](/en/blog/fulbright-application-personal-statement) are more suitable for them. Always read the current conditions in the official program solicitation.

The GRFP’s review logic is still a good model for the statements you write when applying to U.S. graduate programs and labs.

## Two review criteria

NSF reviews all applications on two criteria:

- **Intellectual Merit:** The potential of the proposed research to advance knowledge, and the applicant’s research potential and preparation.
- **Broader Impacts:** The potential of the research and the applicant to benefit society: education, public engagement with science, broadening participation, societal benefit.

The two criteria carry **equal weight**. The most common mistake is reducing broader impacts to a paragraph tacked onto the end. Reviewers want both criteria supported with concrete evidence throughout.

## Personal statement

The personal statement is not a life story; it shows your preparation as a researcher and your broader impact potential with evidence:

1. **Research experience:** What did you do on which projects, what problems did you face and how did you solve them? What was the outcome (poster, paper, talk)?
2. **Broader impact record:** Mentoring, teaching, science communication, community work. Write what you did and its result with numbers (“I ran a weekly study group for … students”).
3. **Future goals:** Your graduate and career goals and how the fellowship will help reach them.

Link each paragraph to one or both criteria. Using the words reviewers look for (Intellectual Merit, Broader Impacts) as subheadings makes the text easy to scan.

## Graduate research plan

The research plan describes the research you want to do in graduate school. It is not binding but must be feasible and original:

- **Introduction and significance:** The problem and why it matters, with references.
- **Research question and hypothesis:** Concrete and testable.
- **Method:** Which experiments, data or models will test it; potential pitfalls and alternative approaches.
- **Intellectual Merit:** What does this research add to knowledge?
- **Broader Impacts:** How will the results reach society, and what will you do in that process?

See our [research question and hypothesis guide](/en/blog/how-to-write-research-questions-and-hypotheses). References must be real and verified; reviewers are experts in the field.

## Reference letters

The application is completed with letters from people who know the applicant. Contact your letter writers early and send them your CV, statement drafts and a short note on the research and broader impact experiences you would like them to highlight.

## Common mistakes

- Preparing without checking eligibility
- Glossing over Broader Impacts with general phrases (“I will communicate science to the public”)
- Turning the personal statement into an emotional story without research evidence
- Leaving the method vague in the research plan
- Not following page limits and formatting rules${CALL}
## Your research plan with Academiana

In Academiana, choose “Other institution / fund” as the program in the “TÜBİTAK / BAP project proposal” work type and write your research plan; you can use the interface in English too. The assistant cites only the real sources you add to your project and marks where a source is needed; it does not invent program rules, page limits or dates.`,
  },
  "marie-curie-msca-doktora-sonrasi-burs-basvurusu": {
    slug: "msca-postdoctoral-fellowship-application",
    title: "How to Write a Marie Skłodowska-Curie (MSCA) Postdoctoral Fellowship Application",
    seoTitle: "How to Write an MSCA Postdoctoral Fellowship Proposal",
    description: "Horizon Europe MSCA Postdoctoral Fellowships: the mobility rule, choosing a host and supervisor, and writing the Excellence, Impact and Implementation sections.",
    keywords: ["MSCA postdoctoral fellowship", "Marie Curie fellowship", "MSCA PF proposal", "Horizon Europe fellowship", "postdoc fellowship Europe", "MSCA excellence impact implementation"],
    cta: { text: "Choose “Other institution / fund” in the “TÜBİTAK / BAP project proposal” work type and build your proposal with Excellence, Impact and Implementation headings.", label: "Prepare my proposal" },
    body: `The Marie Skłodowska-Curie Actions (MSCA) support researchers’ mobility and career development under **Horizon Europe**, the EU’s research and innovation framework program. **MSCA Postdoctoral Fellowships (PF)** fund researchers with a PhD to carry out their own project at a host institution in another country and are among the most competitive postdoctoral fellowships in Europe. Turkey participates in Horizon Europe as an associated country, so researchers and institutions in Turkey can take part; check the current status on the official program website.

## Before applying: eligibility and mobility

Watch two key conditions:

- **Experience:** You must hold a PhD at the deadline and not exceed a set period since the PhD. The period and exceptions (e.g. parental leave) are defined in each call.
- **Mobility rule:** The researcher must not have resided or worked in the host country for more than a set time during a set period before the deadline. Because of this rule you cannot apply to an institution in the country where you currently are.

Fellowship types (European, Global), durations and detailed conditions are in the call and the guide for applicants.

## Choosing a host and supervisor

The proposal is prepared jointly by the researcher and the supervisor at the host. A good match has:

- A supervisor strongly connected to your topic but without the same expertise as you: reviewers look for **two-way transfer of knowledge**. What will you bring to the host, and what will you learn?
- A supervisor with publications, projects and mentoring experience that support the project
- Infrastructure and training opportunities at the institution

Contact supervisors months before the deadline with a short, personalized email: a one-paragraph summary of your project, why you want to work with them and your CV.

## Structure: three evaluation criteria

The technical part of the proposal follows the three evaluation criteria:

| Section | What reviewers look for |
| --- | --- |
| **Excellence** | Originality and going beyond the state of the art, soundness of the methodology, two-way knowledge transfer, quality of supervision and training |
| **Impact** | Contribution to the researcher’s career, dissemination and communication of results, magnitude of scientific and societal impact |
| **Implementation** | Work plan and work packages, risks and mitigation, suitability and resources of the host |

Because scoring follows these headings, use the subheadings in the template without skipping any, in the same order.

### Excellence

Write the research objectives, the gap in the field and why your approach is innovative. In the methodology, address the topics the template asks about, such as interdisciplinarity, open science practices (data management, open access) and the gender dimension in research. Show the gap with sources: [literature matrix guide](/en/blog/how-to-create-a-literature-matrix).

### Impact

Describe concretely how the fellowship advances your career: which new skills will you gain, what is your goal after the fellowship? Plan dissemination (scientific publications, conferences) and communication (activities for the general public) separately with measurable targets.

### Implementation

Show work packages, milestones and deliverables in a Gantt chart. List risks with their likelihood and impact and give a mitigation measure for each. Describe the host’s infrastructure and the support it will provide.

## Common mistakes

- Choosing a host without checking the mobility rule
- Turning Excellence into a literature summary
- Describing knowledge transfer as one-way (“I will learn”)
- General phrases in the Impact section
- Changing the template’s heading structure or page limit

Unsuccessful applications come back with an evaluation report; addressing its criticisms and reapplying with a stronger proposal in the next call is common. For TÜBİTAK options for research abroad, see our [2214-A and 2219 guide](/en/blog/tubitak-2214-a-2219-research-abroad-fellowship).${CALL}
## Your MSCA proposal with Academiana

In Academiana, choose “Other institution / fund” as the program in the “TÜBİTAK / BAP project proposal” work type and build your proposal with Excellence, Impact and Implementation headings; you can use the interface in English too. The assistant drafts work package and risk tables and cites only the real sources you add to your project; it does not invent eligibility rules, amounts or dates.`,
  },
  "fulbright-bursu-basvurusu-nasil-yapilir": {
    slug: "fulbright-application-personal-statement",
    title: "Fulbright Application: How to Write the Personal Statement and Study/Research Objective",
    seoTitle: "Fulbright Application: Personal Statement Guide",
    description: "Fulbright graduate and research awards: program types, the personal statement and study/research objective essays, references and interview preparation.",
    keywords: ["Fulbright application", "Fulbright personal statement", "Fulbright study objective", "Fulbright research objective", "Fulbright interview", "graduate scholarship USA"],
    cta: { text: "Choose “Research proposal for a scholarship application” in the “TÜBİTAK / BAP project proposal” work type and write your study/research objective section by section.", label: "Write my application essay" },
    body: `Fulbright is an international scholarship program supporting educational exchange between the United States and other countries. It is run by binational commissions or U.S. embassies in each country; in Turkey by the **Turkish-American Educational Commission (Fulbright Turkey)**, in Germany by the German-American Fulbright Commission. Programs include master’s and doctoral study, doctoral research, postdoctoral research and teaching. The most decisive parts of the application are the **personal statement**, in which you present yourself and your goals, and the **study or research objective**, which describes what you will do in the U.S.

## Program types

Award types vary by country and year; generally there are these groups:

| Type | For whom | Focus of the essays |
| --- | --- | --- |
| Master’s / doctoral study | Those wishing to do a graduate program in the U.S. | Why this field, why the U.S., contribution after return |
| Doctoral research | Doctoral students in their home country | The part of the thesis to be done in the U.S. |
| Postdoctoral and senior research | PhD holders and academics | Research project and host institution |

Which types are open, eligibility (citizenship, language test, graduation status) and the timeline are announced each year on your country’s official Fulbright website.

## Personal statement

The personal statement tells who you are and the path that brought you to this application, but it is not a repeat of your CV:

1. **Opening:** A concrete experience or question that drew you to the field. Avoid clichéd openings (“Ever since I was a child…”).
2. **Development:** Two or three examples from your academic and professional experience that link directly to your goal. In each, say what you did and what you learned.
3. **Values and community:** In line with Fulbright’s aim of intercultural exchange, your experience of working with different communities and your contribution.
4. **Future:** Where the award will take you and how you will contribute on your return.

## Study or research objective

This essay describes exactly what you will do in the U.S.:

- **Study applicants:** Which field and types of program you want; why these programs fit your goal; concrete examples of courses, labs or faculty.
- **Research applicants:** Research question, method, host institution and relationship with the host, timeline and expected outputs. The structure resembles a research proposal: [thesis proposal guide](/en/blog/how-to-write-a-research-proposal).

In both, give a concrete answer to “Why the U.S.?”: a program, method, data or expertise not available at home.

## Balancing the two essays

The two essays should complement, not repeat, each other. The personal statement answers “why you?”, the objective “what and how?”. Read together, they should show a consistent path from your past to your goal.

## Reference letters

Ask for references from people who know you well academically or professionally. Send them drafts of your essays and the qualities you would like them to highlight, so the letters support the same story as your application.

## Interview preparation

Shortlisted applicants may be invited to an interview. To prepare:

- Reread your essays; interview questions come from them.
- Prepare short, concrete answers to “Why this field, why the U.S., what will you do on your return?”
- Be ready to discuss a current development in your field.
- Answer questions about intercultural experience and contribution with examples.

## Common mistakes

- Using the same text as both personal statement and objective
- General answers to “Why the U.S.?” (“the best universities in the world”)
- Leaving the contribution after return vague
- Translating word for word from your native language; see the translation tips in our [abstract guide](/en/blog/how-to-write-an-abstract)
- Exceeding word or character limits

For the review logic of the U.S. NSF fellowship, see our [NSF GRFP guide](/en/blog/nsf-grfp-personal-statement-research-plan); for TÜBİTAK’s research abroad fellowships, our [2214-A and 2219 guide](/en/blog/tubitak-2214-a-2219-research-abroad-fellowship).${CALL}
## Your application essay with Academiana

In Academiana, choose “Research proposal for a scholarship application” in the “TÜBİTAK / BAP project proposal” work type to write your study/research objective section by section; you can use the interface in English too. The assistant helps you shorten and sharpen your text; it does not invent experiences, achievements, institutions or sources.`,
  },
  "tubitak-2204-b-ortaokul-proje-nasil-hazirlanir": {
    slug: "tubitak-2204-b-middle-school-research-project",
    title: "How to Prepare a TÜBİTAK 2204-B Middle School Research Project: A Guide for Students and Teachers",
    seoTitle: "TÜBİTAK 2204-B Middle School Project: How to Prepare",
    description: "TÜBİTAK 2204-B middle school research project competition: finding a question, a simple experiment, the project logbook, report sections and adults’ roles.",
    keywords: ["TÜBİTAK 2204-B", "middle school science project", "science fair project guide", "how to design a simple experiment", "project logbook", "advisor teacher"],
    cta: { text: "Choose 2204-B in the “TÜBİTAK / BAP project proposal” work type; the report sections come ready and you can turn results into tables and charts.", label: "Prepare my 2204-B report" },
    body: `The TÜBİTAK 2204-B Middle School Students Research Projects Competition is a science competition in Turkey in which middle school students prepare and exhibit their own research projects with an advisor teacher. At this age the jury is not looking for a major invention but for **a curious question answered step by step with the scientific method**. This guide is for students, advisor teachers and parents. For the high school competition, see our [2204-A guide](/en/blog/tubitak-2204-a-high-school-research-project-guide).

## Where does a good project question come from?

The best questions come from daily life. Ask the student to complete the sentence: “I have always wondered whether …”

- “… the same plant grows at the same rate in the shade and in the sun in the school garden?”
- “… students in our class who eat breakfast and those who don’t pay attention differently in the first lesson?”
- “… tea cools at the same rate in cups made of different materials?”

A good question has three features:

1. **Measurable:** The answer can be found with a number, an observation or a comparison.
2. **Doable:** It can be done at school or at home, safely, with simple materials, in a few weeks.
3. **The student’s own:** The student can explain it in their own words and really wants to know the answer.

## Setting up a simple experiment

At middle school level, you can build the scientific method with these steps:

| Step | What to do | Example (cups and tea) |
| --- | --- | --- |
| Question | Write what you want to find out | In which cup does tea cool fastest? |
| Prediction (hypothesis) | The student predicts the result | It cools fastest in the metal cup |
| What changes | Change only one thing | The cup material |
| What is measured | What will be measured, and with what? | Temperature after 10 minutes, with a thermometer |
| What stays the same | Kept the same in every trial | Amount of tea, starting temperature, room |
| Repetition | How many times will you repeat it? | 3 times for each cup |

The most common mistake is changing more than one thing at a time. If **only one thing** changes, you can tell why the result happened.

## Keeping a project logbook

The logbook is the document the jury trusts most; it shows the student did the work. For each working day, write:

- The date and what was done
- Measurements (in a table)
- Observations and anything unexpected
- Problems and how they were solved
- Photos

It can be handwritten; what matters is that it is real and regular, not neat.

## Sections of the project report

The report should be short and simple. These sections are usually expected; check the current template in the call:

1. **Project title:** A short title that states the question.
2. **Aim:** What you want to learn, in one or two sentences.
3. **Introduction:** What you read about the topic and why the question matters. List your sources (books, encyclopedias, reliable websites).
4. **Method:** What you did, which materials you used and what you measured and how, clearly enough for someone else to repeat it.
5. **Results:** Show your measurements in tables and simple charts.
6. **Conclusion and discussion:** Was your prediction right? Why might this have happened? What were the project’s weaknesses and how could it be improved?
7. **Sources**

Give charts a title, axis labels and units. Bar charts suit comparisons; line charts suit change over time.

## The roles of teachers and parents

- The **advisor teacher** helps narrow the question, set up the experiment safely and organize the report; they do not do the project for the student.
- **Parents** help with materials and time. A report written by a parent shows immediately when the jury asks questions.
- The jury talks to the student: “Why did you do it this way?”, “What would you think if the result had been different?” Being able to explain in their own words is the most important preparation.

## Safety and ethics

- Experiments needing electricity, fire, chemicals or sharp tools should be supervised by an adult or avoided.
- If you survey or measure people, get their permission and, where needed, their parents’ permission, and don’t write names in the report.
- Avoid experiments that could harm animals; plants and non-living materials are the best choice for middle school projects.

Always read the competition’s ethics rules in the call document.

## Exhibition and presentation

If your project reaches the exhibition, prepare a two-minute explanation: my question, what I did, what I found, what I learned. Use little text, large charts and photos on the poster. Keep your logbook with you.

## Common mistakes

- Choosing a question that is too big (“How do we stop climate change?”)
- Doing the experiment only once
- Changing more than one thing at a time
- Repeating a project found online exactly
- Changing the result because it didn’t match the prediction: unexpected results are valuable too${CALL}
## Your 2204-B report with Academiana

In Academiana, choose the “TÜBİTAK / BAP project proposal” work type and the 2204-B program: the report sections come ready, and the budget section is removed because this competition has none. The assistant writes in plain language and helps you narrow your question and turn your measurements into tables and charts. It does not produce the project for the student or invent results or data from an experiment that was not done; it leaves a blank where data are needed.`,
  },
};

