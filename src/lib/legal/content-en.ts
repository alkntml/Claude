import type { LegalContent } from "./types";

/** Hukuki metinler (EN). GDPR metni asıl metindir; diğerleri Türkçe asıldan çeviridir. Kaynak PDF metni: docs/legal/yasal-metinler-2026-11-13.txt (tests/legal.test.ts Türkçe metnin kelimesi kelimesine aynı olduğunu denetler). */
export const CONTENT: LegalContent = {
 "kvkk": [
  {
   "h": "Introduction and data controller",
   "b": [
    {
     "p": "This information notice has been prepared to provide information on the processing of personal data during the use of the Academiana platform offered at www.academiana.com.tr. Academiana is an AI-assisted online platform that supports academic research and writing processes."
    }
   ]
  },
  {
   "h": "Categories of personal data processed",
   "b": [
    {
     "p": "Based on the current operation of the platform, the following data categories may be processed:"
    },
    {
     "ul": [
      "Identity and contact: name and surname, email address and the institution information optionally entered by the user.",
      "Account and authentication: email account, password verification data and, when signing in with Google/Apple, the name and email information received from the relevant provider. The password is stored in the Supabase infrastructure in a non-reversible form; the platform does not display the password in plain form.",
      "Academic content: works, sections, version history, comments, sources and notes.",
      "Files and file content: PDF, Word, Excel/CSV files and text extracted from them.",
      "AI interactions: the user’s messages, assistant responses and the work context used to provide the service.",
      "Usage and transaction records: the full text of AI outputs, date, work/section name, word count; token, cost, search and page counters; deletion records.",
      "Device and security data: a random device identifier created in the browser, its non-reversible digest kept on the server, and the first/last seen dates.",
      "Single Project plan usage records: download word count, a non-recoverable digest of the text and cover details (author, university, department and advisor name).",
      "Payment/plan assignment records: payer’s name, phone number, amount and note. Card details are not entered into the Academiana system.",
      "Invitation and sharing data: email for co-author invitations; access and comment information via the advisor link.",
      "Institutional licence data: institutional membership, usage statistics and institutional activity records.",
      "Support and technical records: the user’s feedback/error message and related technical error information.",
      "Visit statistics: page visited, referring site, campaign tag, device type, interface language and a daily-changing anonymous code.",
      "In-app notification and application records."
     ]
    }
   ]
  },
  {
   "h": "Purposes of processing",
   "b": [
    {
     "p": "Personal data is processed for the purposes of creating membership and managing the account, authentication, providing the academic workspace and file services, running AI features, providing source search and citation functions, performing statistical analysis, carrying out co-author and advisor sharing, managing plans and usage rights, assigning the plan after payment, providing customer support, ensuring security and preventing abuse, detecting technical problems, measuring service performance and fulfilling legal obligations. Data is not sold and is not used for advertising targeting. No third-party cookies for analytics or advertising purposes are used on the platform."
    }
   ]
  },
  {
   "h": "Method of collecting data",
   "b": [
    {
     "p": "Data is collected electronically through the registration and sign-in screens, the content the user writes or uploads to the platform, the sharing and payment communication initiated by the user, the usage/security records automatically created by the platform, and the random device identifier created in the device storage."
    }
   ]
  },
  {
   "h": "Retention periods",
   "b": [
    {
     "p": "Account, academic content, files, conversations, counters, the device identifier digest and notifications are, as a rule, kept until the account is deleted. A co-author invitation becomes invalid within 14 days; the invitation record may be kept together with the work. The advisor sharing link remains accessible until the user revokes the link. Usage evidence records are kept until the account is deleted. Feedback and error records may be kept indefinitely; when the account is deleted, their link to the user is removed, but the text content may remain. Visit statistics are kept indefinitely. The retention of payment records is subject to applicable tax and accounting obligations."
    }
   ]
  },
  {
   "h": "Recipient groups and transfers abroad",
   "b": [
    {
     "p": "Within the scope of providing the service, data may be transferred to Supabase for database, authentication and file storage services; to Vercel for hosting and delivery services; and to Anthropic (Claude) when AI features are used. Google and Apple are involved in the authentication process only when the relevant social sign-in method is chosen. In academic source searches, search terms and DOIs may be sent to source services such as OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP and Unpaywall; the user’s identity is not sent to these search services. If a key is configured, the Springer Nature, IEEE and NASA ADS services may also be used. At the user’s request, a LaTeX file may be transferred to Overleaf; in the Zotero integration the key entered by the user is not stored. Payment communication may be carried out via WhatsApp."
    }
   ]
  },
  {
   "h": "Data locations abroad",
   "b": [
    {
     "p": "Supabase data is kept in the Frankfurt/European Union region and Vercel hosting servers in Frankfurt; Vercel’s global CDN network is also used. Supabase and Vercel are US-based companies. When an AI feature is used, the user’s text, work context and selected source/file excerpts are transferred to Anthropic in the USA. Some of the academic databases are located abroad."
    }
   ]
  },
  {
   "h": "Notice on third-party and special-category data",
   "b": [
    {
     "p": "Theses, interview transcripts, surveys or other documents uploaded by users may contain personal data belonging to third parties or special categories of personal data. The user should assess whether they have the necessary legal authority to upload and process this data on the platform, whether they have informed the data subjects and whether they meet the required legal conditions. In research surveys, the data controller towards participants may be the researcher conducting the research; Academiana may be in the position of data processor for the relevant service. Unnecessary identity information, health data and other sensitive information should not be uploaded to the platform."
    }
   ]
  },
  {
   "h": "Automated monitoring and human review",
   "b": [
    {
     "p": "In order to identify the possibility of abuse, usage patterns may be monitored automatically and an alert may be generated for the administrator. The system does not on its own make an automatic suspension decision; the alert is reviewed and decided upon by a human. The data subject may submit a request for information and an objection regarding the processing affecting them to the data controller."
    }
   ]
  },
  {
   "h": "Rights of the data subject and application",
   "b": [
    {
     "p": "Data subjects may exercise their rights under Article 11 of the KVKK. On the platform, users can download their data in JSON format from the account page, delete their account and the data associated with the account, and create a data request. Data requests are answered free of charge within 30 days."
    }
   ]
  },
  {
   "h": "Updates",
   "b": [
    {
     "p": "This text may be updated in line with the platform’s actual data processing activities and changes in the legislation. Significant changes are announced to the user in an appropriate manner. If a new purpose or legal condition is required, the necessary information and permission processes are carried out separately."
    }
   ]
  }
 ],
 "terms": [
  {
   "h": "Scope and nature of the service",
   "b": [
    {
     "p": "These terms govern the use of the Academiana platform offered via www.academiana.com.tr. Academiana offers tools that support academic work, such as AI-assisted text suggestions and editing, academic source search, citation/bibliography creation, statistical analysis, survey design and collection, Word/PDF/LaTeX output, co-authoring, read-only sharing with an advisor, defence rehearsal, PRISMA systematic review, claim checking and translation. The platform does not replace an academic advisor, university, reviewer, publisher or plagiarism detection organisation."
    }
   ]
  },
  {
   "h": "Account creation and security",
   "b": [
    {
     "p": "Registration can be done by email or via Google/Apple. Email verification is applied. The user is obliged to provide accurate and up-to-date information, to protect the security of the account and not to share the account with others. The account cannot be transferred to another person or made available for shared use. No referral reward is given for temporary email addresses. The user is responsible for transactions carried out on their account to the extent of their own fault."
    }
   ]
  },
  {
   "h": "Plans, fees and usage rights",
   "b": [
    {
     "p": "The platform may offer a Free plan, paid plans billed monthly or annually (Basic, Pro, Premium and Unlimited Project) and an institutional licence. The scope, price, duration, usage limits and download rights of the plans are determined according to the current plan description communicated to the user before purchase or plan assignment. Monthly usage rights may be calculated on the basis of AI usage, source searches and the number of pages created with AI. For page calculation, 1 page is taken as 344 words. When an allowance is used up, only the relevant feature stops; the work is not deleted or locked. The user can view and edit their work and download it in the formats permitted by the plan. Even if the text produced by AI is later deleted, the relevant usage right is not restored."
    }
   ]
  },
  {
   "h": "User content and intellectual property",
   "b": [
    {
     "p": "The user declares that they own the rights to the content they upload to or create on the platform, or that they have the necessary permissions to use the content. The user may not upload materials that infringe the copyright, personality, privacy and data protection rights of third parties. Academiana may technically process user content only to provide the service, ensure security and perform the functions requested by the user. This provision does not mean that the platform acquires ownership of user content. The legal status of AI outputs and third-party rights are assessed according to the applicable legislation and the specific content; the user is obliged to check the output before using it."
    }
   ]
  },
  {
   "h": "Sharing and collaboration",
   "b": [
    {
     "p": "The owner of a work may invite co-authors with the roles “can edit” or “can comment”. Co-authors can see the work, sources and comments; they cannot access the work owner’s private files and assistant conversations. The advisor sharing link allows people who have the link to read the work and write comments without signing in. The user should therefore share the link only with people they want to have access and revoke it when it is no longer needed. In an institutional licence, the institution administrator can see the member list and usage statistics; they cannot see users’ academic work content."
    }
   ]
  },
  {
   "h": "AI and academic accuracy",
   "b": [
    {
     "p": "AI outputs are probabilistic in nature; they may contain errors, omissions, misinterpretations or outdated information. Tools such as source verification, DOI/PMID/arXiv identifier checks and claim checking help reduce the risk of error; they do not guarantee absolute accuracy. The access level at which sources were examined may be shown on the platform. The user must verify the bibliographic record, page number, direct quotation, statistical result and academic claims from the original source. As the platform does not offer a licensed plagiarism service, it does not provide a plagiarism percentage or a guarantee of being plagiarism-free."
    }
   ]
  },
  {
   "h": "Prohibited and objectionable uses",
   "b": [
    {
     "p": "The user may not use the platform to produce academic work on behalf of someone else or to facilitate academic misconduct, to plagiarise, to fabricate sources/data/statistics, to use another person’s account, to circumvent security measures, to harm the service, to process unlawful content or to infringe the rights of third parties. The user must comply with the AI usage rules of their institution and publisher and, where required, declare the use of AI."
    }
   ]
  },
  {
   "h": "Administration, oversight and suspension",
   "b": [
    {
     "p": "Service administrators may suspend accounts, assign plans, send in-app notifications, review usage records and AI output texts, and carry out data export operations requested by the user. Automatic alerts may be generated within the scope of security and abuse checks; the account is not suspended automatically. The alert is reviewed by a human. As a result of the review, it may be decided that there is no problem, the user may be warned or the account may be suspended. The user may request the reasons for the decision and submit an objection to the support channel."
    }
   ]
  },
  {
   "h": "Changes to the service and interruptions",
   "b": [
    {
     "p": "The platform’s features, technical infrastructure and plan scope may be developed or changed. Temporary interruptions to the service may occur due to planned maintenance, third-party service providers, internet infrastructure, security incidents or force majeure. Academiana takes the necessary measures to reasonably reduce interruptions and to ensure the security of user data. Rights arising from mandatory consumer and data protection legislation are reserved."
    }
   ]
  },
  {
   "h": "Liability",
   "b": [
    {
     "p": "Academiana provides tools that support academic work; it does not guarantee academic success, acceptance, publication, graduation, ethics committee approval, a particular grade or a particular result. The user uses the outputs after passing them through their own assessment and checks their compliance with the rules of their institution. Liabilities that cannot be limited by law, liabilities arising from intent or gross negligence and mandatory rights arising from consumer legislation are reserved. These terms cannot be interpreted in a way that removes the user’s rights to the extent not permitted by mandatory legislation."
    }
   ]
  },
  {
   "h": "Changes to fees and terms",
   "b": [
    {
     "p": "Plan prices and terms may be changed. Changes apply to new purchases and renewals from the effective date notified to the user in advance. The scope of a previously purchased period or of the indefinite Single Project right is not retroactively narrowed, subject to mandatory legislation and the terms communicated at the time of purchase."
    }
   ]
  },
  {
   "h": "Governing law and language",
   "b": [
    {
     "p": "Turkish law applies to the terms of use. Mandatory rules of jurisdiction and competence at the consumer’s place of residence are reserved. In disputes, the relevant legislation applies with regard to the consumer arbitration committees and courts competent by law, as well as the courts of general competence/jurisdiction. The platform may have Turkish, English and German interfaces."
    }
   ]
  },
  {
   "h": "Age and acceptance",
   "b": [
    {
     "p": "There is no age limit or age verification mechanism on the platform. The user is obliged to review the current terms presented to them during registration or use."
    }
   ]
  }
 ],
 "fair_use": [
  {
   "h": "Purpose and general principle",
   "b": [
    {
     "p": "This policy has been prepared to protect the reasonable and personal use of plans, to ensure the sustainability of the platform and to safeguard other users’ access to the service. The term “unlimited” refers to a person’s ordinary use for their own academic work; it does not mean unlimited use for account sharing, bulk production on behalf of third parties or different works beyond the scope of the plan."
    }
   ]
  },
  {
   "h": "Unlimited Project plan",
   "b": [
    {
     "p": "The Unlimited Project plan is valid for 1 month from the date it is assigned; with annual payment the period is 1 year. During this period everything except the number of projects is completely unlimited: AI use, page writing, source searches, storage, the free tools and all features can be used without any quota. The number of projects is at most 5 active projects with monthly payment and at most 60 with annual payment. When the period ends, the plan does not renew automatically and the account moves to the Free plan; works are not deleted. Single Project plans previously purchased under the earlier terms (open-ended and for a single work) continue under the terms on which they were purchased."
    }
   ]
  },
  {
   "h": "Behaviours that may constitute a breach",
   "b": [
    {
     "p": "The following behaviours are incompatible with the purpose of a Single Project plan purchased under the earlier terms: completing the work and deleting it to start a new work, or producing another topic/work by writing over the same work; substantially changing the topic of the work; preparing works for others within the plan; sharing the account with other people; using the Single Project right for more than one independent academic work."
    }
   ]
  },
  {
   "h": "Abuse signals",
   "b": [
    {
     "p": "The system may generate alerts to the administrator for review. Alert signals may include: deletion of a large amount of content after download; substantial change of content between downloads; changing the author, university or advisor details on the cover; use from many devices; creation of an unusual number of sections; generation of long AI texts unrelated to the topic of the work. The cost indicator exceeding 40% of the plan fee is for information only; on its own it is not a reason for restriction."
    }
   ]
  },
  {
   "h": "Human review and decision",
   "b": [
    {
     "p": "An alert does not mean that the account will be suspended automatically. Every alert is reviewed by an administrator. As a result of the review, it may be decided that there is no breach, the user may be asked for an explanation or the user may be warned. Depending on the nature and severity of the breach, the account may be suspended. The user may use the platform’s support channel to learn the reasons for the decision and to object to it."
    }
   ]
  },
  {
   "h": "Refunds",
   "b": [
    {
     "p": "If a plan is used in breach of this policy, a refund may not be made in cases where there is no legal obligation to refund. The consumer’s rights of withdrawal, refund of the price and other rights arising from mandatory legislation are reserved. This policy does not remove legally mandatory refunds or consumer rights."
    }
   ]
  },
  {
   "h": "Referral programme",
   "b": [
    {
     "p": "The referral reward is granted on the condition that the invited person verifies their email address. No reward is given to accounts created from the inviting person’s device or to temporary email addresses. These checks are applied to prevent abuse of the referral programme."
    }
   ]
  },
  {
   "h": "Updates",
   "b": [
    {
     "p": "The fair use criteria may be updated in line with technical and operational needs. Changes that significantly affect users’ rights are announced appropriately."
    }
   ]
  }
 ],
 "cookies": [
  {
   "h": "Scope",
   "b": [
    {
     "p": "This policy explains for what purposes cookies, browser storage and similar technologies are used on the Academiana website. Cookies and similar technologies may be used for purposes such as maintaining the session, remembering preferences and preventing abuse."
    }
   ]
  },
  {
   "h": "Technologies used",
   "b": [
    {
     "ul": [
      "Supabase session cookies: Used to keep the user’s session open and to maintain authentication. They are first-party and strictly necessary for the service to work; their duration depends on the session and refresh mechanism.",
      "acd_did cookie and browser storage: Keeps a random device identifier for the purpose of preventing abuse (detecting referral reward abuse and account sharing). A non-reversible digest of this identifier and the first/last seen dates are stored on the server. Its duration is 400 days. It is not used for advertising.",
      "lang cookie: Used to remember the interface language; it is a first-party functional cookie and is kept for 1 year.",
      "localStorage: May keep preferences such as dark mode, guided tour status and offline text backup on the user’s device. This data is stored only in the browser storage on the user’s device.",
      "PWA service worker: Helps the site open offline."
     ]
    }
   ]
  },
  {
   "h": "Analytics and advertising technologies",
   "b": [
    {
     "p": "There are no analytics, advertising or third-party advertising cookies on the platform. Visit counting is carried out without cookies. The IP address and browser information are used only momentarily to generate the daily-changing, non-reversible code; they are not stored and are not kept in a way that would allow the same person to be tracked across days. If the browser sends a Do Not Track (DNT) or Global Privacy Control (GPC) signal, no visit counting is performed."
    }
   ]
  },
  {
   "h": "Device identifier and preference management",
   "b": [
    {
     "p": "The device identifier is used not for advertising or creating user profiles, but for security and abuse prevention. The user can delete or block cookies from the browser settings; however, blocking strictly necessary session cookies may affect sign-in and the functioning of some platform features."
    }
   ]
  },
  {
   "h": "Third-party links",
   "b": [
    {
     "p": "In operations initiated by the user, such as signing in with Google or Apple, the Overleaf/Zotero connection or payment communication via WhatsApp, the third parties’ own cookie and privacy policies may apply. Academiana does not manage the data processing activities of third parties in their own environments."
    }
   ]
  },
  {
   "h": "Policy changes",
   "b": [
    {
     "p": "If a new cookie or similar technology is put into use, this policy is updated. If a technology for which prior consent is legally required is introduced, the necessary consent mechanism is presented before the technology is activated."
    }
   ]
  }
 ],
 "integrity": [
  {
   "h": "Purpose and core principle",
   "b": [
    {
     "p": "Academiana is a tool that supports academic research and writing processes. The platform does not assume academic responsibility in place of the user. The user is responsible for the research question, method, data, analysis, interpretation, choice of sources and the accuracy of the final text. The user must comply with the rules of their university, institute, journal, funding body and ethics committee."
    }
   ]
  },
  {
   "h": "Finding and verifying sources",
   "b": [
    {
     "p": "The platform is designed to retrieve sources from academic databases. The AI can cite on the basis of the sources added to the project. Not fabricating sources, authors, DOIs, statistics or findings is a design principle; “[KAYNAK GEREKLİ]” (source required) warnings may be used in sections that cannot be supported, and “[VERİ GİRİLECEK]” (data to be entered) warnings where data is required. Nevertheless, the probability of the AI making mistakes is not zero. The user should check the bibliographic details and relevant content of every source against the original source."
    }
   ]
  },
  {
   "h": "Display of access level",
   "b": [
    {
     "p": "For sources, it may be shown whether only the bibliographic record, the abstract or the full text was examined. Page numbers and direct quotations are designed to be used only for sources whose full text has been read. The user should verify direct quotations and page numbers against the source itself."
    }
   ]
  },
  {
   "h": "Identifier verification and claim checking",
   "b": [
    {
     "p": "DOI records can be verified through Crossref and DataCite; PMID records through Europe PMC; arXiv identifiers through arXiv. A record that cannot be verified is shown with a warning. The bibliography check helps check whether records really exist. Claim checking can classify whether a cited sentence is supported by the source as “supports”, “partially”, “does not support” or “contradicts”. These checks are auxiliary in nature; they do not replace the final academic assessment."
    }
   ]
  },
  {
   "h": "Statistical analysis and data integrity",
   "b": [
    {
     "p": "Statistical calculations on the platform are performed on the data provided by the user; the AI helps interpret the results. The user should check the accuracy of the data set, the variable definitions, the analysis assumptions, the sample characteristics and the reported results. Fabricating data, distorting results, hiding unwanted findings or presenting analyses in a way that is contrary to the truth is prohibited."
    }
   ]
  },
  {
   "h": "Plagiarism and originality",
   "b": [
    {
     "p": "The platform does not offer a licensed plagiarism detection service and does not produce a plagiarism percentage. The bibliography check or claim checking should not be regarded as a plagiarism scan. The user must comply with the rules on quotation, paraphrasing, citing sources and original contribution. There is no guarantee of originality or freedom from plagiarism for text created with AI."
    }
   ]
  },
  {
   "h": "Declaration of AI use",
   "b": [
    {
     "p": "The user must appropriately declare the use of AI where their institution or publisher requires it. Text created or edited by AI should not be presented as the user’s own original academic contribution without the user’s control and responsibility. If the institution’s policy on AI use is unclear, the user should obtain a written clarification from the relevant institution."
    }
   ]
  },
  {
   "h": "Unacceptable academic conduct",
   "b": [
    {
     "p": "Presenting someone else’s work as one’s own, producing a thesis or article on behalf of someone else, fabricating sources or data, creating fake participant responses, altering analysis results, misrepresenting citations, bypassing ethics committee/consent requirements and misleading academic assessment are incompatible with the platform’s purposes."
    }
   ]
  },
  {
   "h": "Quality score",
   "b": [
    {
     "p": "The platform’s quality score method is explained on the /yontem page. AI findings do not affect the quality score. The quality score should not be interpreted as a guarantee of academic acceptance or scientific validity."
    }
   ]
  },
  {
   "h": "Personal and sensitive research data",
   "b": [
    {
     "p": "Before adding third parties’ identity information, health data or other special categories of data to survey or research data, the user must ensure the necessary ethics committee, information notice, explicit consent and data security conditions are met. Research participants’ data should be anonymised or de-identified as far as possible. The fact that Academiana suggests a sample consent text to the researcher does not remove the researcher’s legal and ethical responsibility."
    }
   ]
  }
 ],
 "distance": [
  {
   "h": "Important note on scope",
   "b": [
    {
     "p": "The current sales flow at Academiana is as follows: from the price page or the “Upgrade” button in the application, a pre-filled WhatsApp message containing the plan name and, if any, the discount code is opened; payment is taken outside the platform and the plan is assigned manually by an administrator. There is no online payment page on the platform and card details are not taken into the system. This document sets out the general pre-contractual information and contract principles according to the current flow."
    }
   ]
  },
  {
   "h": "Subject of the service",
   "b": [
    {
     "p": "Academiana provides access to a digital platform supporting academic research and writing processes and the related software features. The service may include AI-assisted text suggestions and editing, academic source search, citations/bibliography, statistical analysis, survey tools, file outputs and collaboration features. The scope of the service is determined by the current description of the purchased plan."
    }
   ]
  },
  {
   "h": "Sale and formation of the contract",
   "b": [
    {
     "p": "The user selects the plan on the prices page or within the application and initiates communication via WhatsApp. The plan, payment and assignment details are confirmed with the user separately. After payment, the administrator assigns the plan in the system and the service begins."
    }
   ]
  },
  {
   "h": "Plan types",
   "b": [
    {
     "p": "The platform may offer a Free plan, paid plans billed monthly or annually (Basic, Pro, Premium and Unlimited Project) and an institutional licence. With annual payment a 20% discount on the monthly price applies; 12 times the monthly allowances are granted at the start of the plan and can be used within 1 year. Institutional licences may be subject to a separate agreement with the institution. Discount codes, referral programme rewards and, for the Basic, Pro and Premium plans, the Academic Team Discount (20%) for at least three people may apply. The scope of the discount and the price on which it is calculated are clearly communicated to the user before purchase."
    }
   ]
  },
  {
   "h": "Price, tax and payment",
   "b": [
    {
     "p": "The total amount payable, any taxes and discounts, the payment method and the payment time are clearly communicated to the user before the transaction. For each sale, the contract is not considered completed until this information has been confirmed in writing."
    }
   ]
  },
  {
   "h": "Renewal of plans",
   "b": [
    {
     "p": "There is no automatic renewal for monthly or annual plans. A user who wishes to continue at the end of the period initiates the renewal themselves. No fee for a new period is charged without separate approval from the user."
    }
   ]
  },
  {
   "h": "Start of the service and digital service",
   "b": [
    {
     "p": "The service starts when the plan is assigned by the administrator after payment. Where necessary, a separate and explicit request/approval is obtained from the user for the service to start before the withdrawal period expires, and its legal consequences are explained. Acceptance of the general terms of use does not by itself constitute a waiver of the right of withdrawal or an exception."
    }
   ]
  },
  {
   "h": "Right of withdrawal and refunds",
   "b": [
    {
     "p": "The consumer’s right of withdrawal and the exceptions that may apply to digital services are determined according to the nature of the service, whether performance has begun, the explicit request/approval given in advance by the user and the legislation in force. The seller clearly communicates to the consumer before the transaction the withdrawal/refund conditions to be applied; mandatory consumer rights are reserved."
    }
   ]
  },
  {
   "h": "Unlimited Project plan",
   "b": [
    {
     "p": "The Unlimited Project plan is valid for 1 month from the date of assignment with monthly payment and for 1 year with annual payment. During this period everything except the number of projects is unlimited; the number of projects is at most 5 with monthly payment and at most 60 with annual payment. Details are explained in the Fair Use Policy. Single Project plans previously purchased under the earlier terms continue under the terms on which they were purchased. The user should review these restrictions before purchasing."
    }
   ]
  },
  {
   "h": "Institutional licence",
   "b": [
    {
     "p": "The institutional licence may be offered under the terms of a separate agreement to be made with the institution. The institution administrator can see the member list and usage statistics, but cannot see users’ academic work content. The price, duration, number of users, support level and data processing provisions specific to the institutional licence are determined separately in writing."
    }
   ]
  },
  {
   "h": "Complaints and applications",
   "b": [
    {
     "p": "The user may report problems related to the purchase or the service via the platform’s support channel."
    }
   ]
  },
  {
   "h": "Order-specific confirmation",
   "b": [
    {
     "p": "For each purchase, at least the seller information, user information, plan name, scope of service, duration, limits, total price, taxes, payment method, the start time of the service, whether there is automatic renewal and the withdrawal/refund conditions to be applied are presented to the user before the transaction; the order summary and contract are sent to the user on a durable medium."
    }
   ]
  }
 ],
 "gdpr": [
  {
   "h": "Scope and controller",
   "b": [
    {
     "p": "This notice describes the personal data processing associated with Academiana, an AI-assisted academic research and writing platform available at www.academiana.com.tr. The platform is accessible to users in Türkiye and may also be accessed from other countries."
    }
   ]
  },
  {
   "h": "Categories of personal data",
   "b": [
    {
     "p": "Depending on how the service is used, Academiana may process: account and contact data (name, email address and optional institution); authentication data (password verification data or name/email received through Google or Apple sign-in); academic workspace content (projects, sections, version history, comments, references and notes); uploaded files and extracted text; AI prompts and responses; usage evidence records including the full text of AI outputs, timestamps, project/section names and word counts; usage counters (tokens, cost, searches and pages); a randomly generated device identifier and its non-reversible server-side hash; limited download evidence for the One Project plan, including word count, a non-reversible content hash and cover details; payment and plan-assignment information (payer name, phone number, amount and note); collaborator invitation email addresses; advisor-link access and comments; institutional membership and usage statistics; support messages and technical error data; daily changing, non-identifying visit statistics; and in-app notifications and data-subject request records."
    }
   ]
  },
  {
   "h": "Purposes and legal bases",
   "b": [
    {
     "p": "Personal data is processed to create and administer accounts, authenticate users, provide the academic workspace and file functions, deliver AI features, search academic sources, manage references, provide statistical and survey tools, enable collaboration and advisor sharing, administer plans and usage limits, assign paid plans, provide support, prevent abuse, maintain platform security, troubleshoot errors, measure service performance and comply with legal obligations. The likely GDPR legal bases may include performance of a contract (Article 6(1)(b)) for account and requested services; legitimate interests (Article 6(1)(f)) for proportionate security, abuse prevention and service statistics; and compliance with a legal obligation (Article 6(1)(c)) for records required by law. These bases require a documented, purpose-specific assessment by the controller. Consent will be relied upon only where it is genuinely required and validly obtained."
    }
   ]
  },
  {
   "h": "Retention",
   "b": [
    {
     "p": "Account data, academic content, files, AI conversations, usage counters, device identifier hashes and in-app notifications are generally retained until the account is deleted. Collaborator invitations expire after 14 days, although the invitation record may remain with the project. Advisor sharing remains available until the user revokes the link. Full-text AI usage evidence is retained until account deletion. Feedback and error records may be retained indefinitely, with the user link removed after account deletion while the text may remain. Visit statistics are retained indefinitely. Payment records may be subject to statutory accounting and tax retention requirements."
    }
   ]
  },
  {
   "h": "Recipients and international transfers",
   "b": [
    {
     "p": "Service providers and recipients may include Supabase for database, authentication and file storage; Vercel for hosting and content delivery; Anthropic for AI processing when an AI feature is used; and Google or Apple when the user chooses the relevant sign-in method. Academic search services may receive search terms and DOI identifiers, without the user's account identity, including OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, DataCite, ERIC, DBLP, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP and Unpaywall; Springer Nature, IEEE and NASA ADS may also be used where API credentials are configured. At the user's request, LaTeX files may be sent to Overleaf and user-initiated payment communications may take place through WhatsApp."
    }
   ]
  },
  {
   "h": "Data locations and transfer safeguards",
   "b": [
    {
     "p": "Supabase data is hosted in Frankfurt, within the EU, and Vercel hosting is also located in Frankfurt, while Vercel uses a global CDN. Supabase and Vercel are US-based companies. When an AI feature is used, the user's prompt, relevant workspace context and selected source/file excerpts are transferred to Anthropic in the United States. Some academic search services are also located outside the user's country. An appropriate transfer mechanism is used for each restricted transfer, such as applicable adequacy arrangements or Standard Contractual Clauses with supplementary measures where required."
    }
   ]
  },
  {
   "h": "Special-category and third-party data",
   "b": [
    {
     "p": "Users may upload research materials containing personal data about third parties, including interview transcripts, survey responses or health-related information. The user or research institution may act as controller for the research activity, while Academiana may act as processor for the platform service, depending on the facts and contractual arrangements. Users must ensure a valid legal basis, appropriate notices, any required explicit consent, ethics approval and suitable safeguards before uploading such information. Data should be minimised and anonymised or pseudonymised where possible."
    }
   ]
  },
  {
   "h": "Automated monitoring",
   "b": [
    {
     "p": "The platform may automatically detect usage patterns that could indicate abuse and generate an alert for human review. The system does not automatically suspend an account; a human administrator reviews the alert and decides whether no action, a warning or suspension is appropriate. Data subjects may exercise applicable rights in relation to this processing, including the right to object where the legal conditions are met."
    }
   ]
  },
  {
   "h": "Security",
   "b": [
    {
     "p": "Security measures on the platform include HTTPS, HSTS, Content Security Policy, user-data isolation with automated tests, CSRF and SSRF protections, server-side secret management, time-limited file links, dependency security scanning and more than 500 automated tests. Security measures are reviewed regularly. In the event of a personal data breach, the breach is assessed and, where required, notified to the supervisory authority within 72 hours after becoming aware of it and communicated to affected individuals where the legal threshold is met."
    }
   ]
  },
  {
   "h": "Data subject rights",
   "b": [
    {
     "p": "Subject to the conditions and limitations in the GDPR, individuals may request access, rectification, erasure, restriction, portability and may object to processing based on legitimate interests. Users can download their data in JSON format, delete their account and associated account data, and submit a data request through the platform. Data requests are answered free of charge within 30 days. Individuals may also lodge a complaint with a competent data protection supervisory authority, in particular in the EU Member State of their habitual residence, place of work or alleged infringement."
    }
   ]
  },
  {
   "h": "Institutional customers",
   "b": [
    {
     "p": "For institutional licences, Academiana may act as a processor on behalf of the institution, depending on the actual purposes and means of processing. A written Data Processing Agreement defines the subject matter, duration, nature and purpose of processing, data categories, data-subject categories, security measures, sub-processors, assistance obligations, deletion/return of data and audit arrangements."
    }
   ]
  },
  {
   "h": "Children",
   "b": [
    {
     "p": "The platform has no age limit and does not perform age verification. Where required by applicable law, appropriate age-related safeguards and parental authorisation processes are applied."
    }
   ]
  },
  {
   "h": "Changes",
   "b": [
    {
     "p": "This notice may be updated to reflect changes in processing activities, service providers or applicable law. Material changes will be communicated through an appropriate channel."
    }
   ]
  }
 ]
};
