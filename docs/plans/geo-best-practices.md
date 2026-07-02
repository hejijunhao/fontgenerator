# GEO & SEO Best Practices 2026: Definitive Optimization Guide

> **Purpose:** Agent-ready reference for auditing and optimizing websites and subpages. Organized into actionable sections with explicit DO / DON'T directives. Covers Generative Engine Optimization (GEO) primarily, with SEO foundations as the bedrock layer.

***

## Executive Summary

Search discovery has fundamentally bifurcated. Traditional SEO (blue-link rankings) still governs navigational and transactional queries, but **Generative Engine Optimization (GEO)** now governs informational discovery: Google AI Overviews (2B+ monthly users), ChatGPT (800M weekly users), and Perplexity (hundreds of millions of monthly queries) all synthesize answers by citing specific sources. A 2026 Gartner forecast predicts traditional search volume will drop 25% as AI-powered answer engines capture that share. The decisive shift: top-10 organic rankings now account for only 38% of Google AI Overview citations, down from 76% in mid-2025, following Google's switch to Gemini 3 in January 2026. This guide distills what actually drives citations, rankings, and AI visibility in this new dual-track environment.[1][2][3]

GEO and SEO are **complementary, not competing**: SEO foundations enable AI crawler discovery; GEO structuring enables AI model citation. 74.2% of AI-cited content also performs well in traditional search.[4]

***

## 1. Technical Foundation

This layer is non-negotiable. Without it, all content optimization is wasted — AI crawlers cannot reach pages they cannot access or parse.

### 1.1 Crawler Access & robots.txt

**✅ DO:**
- Explicitly allow all major AI crawlers by name in `robots.txt`. The permissive default for Googlebot does NOT apply to AI bots — GPTBot and ClaudeBot in particular may interpret ambiguity as denial[5]
- Add the following named allow-rules above any wildcard `User-agent: *` block:[6]

```
# OpenAI
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Claude-User
Allow: /

# Google AI
User-agent: Google-Extended
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# Apple
User-agent: Applebot-Extended
Allow: /

# Common Crawl (feeds many LLMs)
User-agent: CCBot
Allow: /
```

- Point `Sitemap:` directive to your XML sitemap URL within `robots.txt`[6]
- Keep `robots.txt` in version control with comments explaining each rule[6]

**❌ DON'T:**
- Use a generic CMS-default `robots.txt` — many templates actively block AI crawlers without owners knowing it[6]
- Block aggressive scrapers and bandwidth-wasters that feed no major AI engine (maintain a deny-list of ~30–50 junk bots)[6]
- Block crawlers on content you want AI to cite. Sites that unblocked GPTBot, PerplexityBot, and ClaudeBot in Q4 2025 saw +186% AI-attributed traffic in 90 days[7]

***

### 1.2 llms.txt File

`llms.txt` is a plain Markdown file at `yourdomain.com/llms.txt` that gives AI systems a curated map to your most important content — analogous to a "greatest hits list" rather than a sitemap.[8][9]

**✅ DO:**
- Place `llms.txt` at the root of every domain (`/llms.txt`)[9]
- Lead with a blockquote `>` containing your site's core description — this is the single line AI systems extract as your site's "elevator pitch"[10]
- List your highest-priority URLs using Markdown section headings and URL lists: key service pages, cornerstone content, FAQ pages, methodology pages[11]
- Optionally create `llms-full.txt` with full page content in Markdown format for richer AI context[9]
- Treat the file as living: update when new cornerstone content is published[8]

**❌ DON'T:**
- Treat `llms.txt` as a ranking hack — it has zero direct effect on Google Search rankings or AI Overviews according to Google's June 2026 documentation. It is a discovery-aid and context signal, not a ranking signal[12]
- Expect `llms.txt` alone to drive citations. Content quality and domain authority remain the dominant factors[9]
- List every URL — only your best, most citable pages should appear[10]

***

### 1.3 Core Web Vitals & Page Performance

Google uses mobile-first indexing for 100% of sites. Core Web Vitals remain a concrete ranking factor and indirectly influence AI Overview citation by determining crawl quality and page trustworthiness.[13][14][15]

| Metric | Measures | Target |
|--------|----------|--------|
| **LCP** (Largest Contentful Paint) | Load speed of largest visible element | ≤ 2.5s |
| **INP** (Interaction to Next Paint) | Interactivity latency (replaced FID in 2024) | ≤ 200ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | ≤ 0.1 |

**✅ DO:**
- Serve images in AVIF or WebP format; use `loading="lazy"` on below-fold images and `priority` (or `fetchpriority="high"`) on the LCP element[16]
- Preload the primary font weight; use `font-display: swap` to prevent layout shift[16]
- Use a CDN with servers close to your users[17]
- Always specify explicit `width` and `height` on images and videos to prevent CLS[17]
- Split JavaScript into islands; defer non-essential scripts; minimize third-party tracking scripts for INP[16][17]
- Diagnose with **field data** (CrUX/Search Console), not just lab data (Lighthouse/PageSpeed Insights)[17]
- Enable HTTP caching headers for static assets[17]

**❌ DON'T:**
- Run 14+ WordPress plugins — each one adds render-blocking scripts[17]
- Load fonts from external CDNs without `preconnect` hints
- Serve full-resolution images from a smartphone camera directly on the web
- Ignore INP — it replaced FID in March 2024 and is the most commonly failed metric on content-heavy sites[16]

***

### 1.4 HTTPS & Security Signals

**✅ DO:**
- Enforce HTTPS across the entire site with a valid, unexpired SSL certificate[18]
- Implement HSTS (`Strict-Transport-Security` header) to prevent downgrade attacks[19]
- Add security headers: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`[19]
- Resolve all mixed content (HTTP resources on HTTPS pages) — AI citation systems treat security signals as threshold trust criteria, not just marginal ranking factors[18]

**❌ DON'T:**
- Run any page on HTTP in 2026 — AI engines categorically deprioritize non-HTTPS sources[18]
- Let SSL certificates expire (set calendar reminders or use auto-renew)
- Ignore security headers as "optional" — they proxy for domain trustworthiness to AI citation systems[18]

***

### 1.5 URL Structure & Site Architecture

**✅ DO:**
- Use concise, descriptive, keyword-bearing URLs under 100 characters[20]
- Use hyphens (`-`) to separate words (not underscores or spaces)[20]
- Enforce a logical hierarchy: `domain.com/category/subcategory/article`[20]
- Use all-lowercase, static URLs — avoid dynamic parameters (`?id=123`) in content URLs[20]
- Ensure every page is reachable within 3 clicks from the homepage[21]
- Use canonical tags to consolidate duplicate or near-duplicate URLs[20]
- Treat URLs as semantic signals LLMs read directly — clear paths help AI understand content relationships[22]

**❌ DON'T:**
- Include dates in URLs for evergreen content (e.g., `/2024/06/article-title`) — this signals potential staleness[20]
- Use stop words, special characters, or session IDs in URLs[20]
- Let orphan pages exist (pages with zero internal links pointing to them)[21]

***

### 1.6 Semantic HTML

**✅ DO:**
- Use semantic HTML5 elements: `<article>`, `<section>`, `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`[23]
- Give every page exactly one `<h1>` that mirrors the primary user query or topic[15]
- Maintain strict heading hierarchy: H1 → H2 → H3. Do not skip levels[15]
- Use `<table>` for tabular comparison data — AI engines prefer structured HTML tables for multi-entity queries[4]
- Mark up Q&A sections with clear question-answer proximity (reinforced by `FAQPage` schema)[24]

**❌ DON'T:**
- Use `<div>` or `<span>` where semantic elements exist
- Stack multiple `<h1>` tags on one page
- Use heading tags purely for visual styling (this misleads crawlers and AI parsers)
- Render core content exclusively in JavaScript without server-side rendering — AI crawlers may not execute JS[23]

***

## 2. Schema Markup & Structured Data

Schema does not directly drive AI citations in isolation (a 2026 Ahrefs causal study of 1,885 pages found no statistically significant citation uplift from schema alone), but it significantly improves how AI systems understand and classify your content, reducing hallucination risk and making content easier to trust and extract. Google recommends JSON-LD as the implementation format.[25][26]

### 2.1 Priority Schema Types

| Schema Type | Use Case | Key Fields |
|-------------|----------|------------|
| **Organization** | Every homepage | `name`, `url`, `logo`, `sameAs` (all social profiles) |
| **WebSite** | Homepage | `SearchAction` for sitelinks search box |
| **Article / BlogPosting** | All blog/guide pages | `headline`, `author`, `datePublished`, `dateModified`, `image` |
| **FAQPage** | Pages with Q&A sections | `mainEntity[]`, `name`, `acceptedAnswer` — must match visible content |
| **HowTo** | Step-by-step process pages | `step[]` array with clear `text` per step |
| **Service** | Service/product pages | `serviceType`, `provider`, `areaServed` |
| **ItemList** | Ranked/listicle content | `listItem[]` with `position`, `name`, `url` |
| **Person** | Author bio pages | `name`, `jobTitle`, `sameAs` linking to LinkedIn/portfolio |
| **BreadcrumbList** | All inner pages | Improves snippet with navigation path |
| **SoftwareApplication** | SaaS product pages | Better than generic `WebPage` for software |

**✅ DO:**
- Centralize schema in a single JSON-LD `@graph` block per page, using `@id` cross-references to link entities (e.g., `"author": {"@id": "/#person-name"}`) — avoids duplication and creates a coherent entity graph[16]
- Stack multiple schema types in a single `@graph` for content pages: e.g., `Article` + `FAQPage` + `Organization` simultaneously[4]
- Ensure `FAQPage` schema only marks up Q&A that is visibly rendered on the page — Google penalizes mismatches[24]
- Update `dateModified` in Article schema every time you revise content[24]
- Validate with Google Rich Results Test and `validator.schema.org` after every change[24]
- Include `sameAs` on Organization schema linking to all social profiles, Wikipedia, and Wikidata — this strengthens Knowledge Graph association[16]

**❌ DON'T:**
- Apply `FAQPage` schema to marketing copy styled as questions — only real Q&A with substantive answers[24]
- Use duplicate schema blocks on the same page (one `@graph` per page)[24]
- Leave `dateModified` stale — this signals content neglect to AI systems[24]
- Use generic `WebPage` type when a more specific type applies (`Service`, `BlogPosting`, `SoftwareApplication`)[26]
- Invest optimization effort into schema as a primary GEO lever — it is hygiene that prevents disadvantage, not a citation driver on its own[25]

***

## 3. Meta Tags, Open Graph & Head Elements

### 3.1 Title Tags

**✅ DO:**
- Write unique, descriptive titles for every page (50–60 characters to avoid truncation)
- Front-load the primary keyword/entity
- Mirror the user's natural query language in informational page titles: "How to X", "What is Y", "Best Z for W"[15]
- Include the current year in titles for time-sensitive content to signal freshness[15]

**❌ DON'T:**
- Duplicate title tags across pages
- Keyword-stuff titles with multiple variations
- Use vague titles like "Home" or "Services" — be specific

***

### 3.2 Meta Descriptions

Meta descriptions do not directly influence rankings, but they influence click-through rate and are read by AI content parsers to resolve page intent.[27]

**✅ DO:**
- Write unique meta descriptions for every page (150–160 characters)
- Answer the core query the page addresses — lead with the benefit or answer
- Include a natural call-to-action
- Treat the description as a "FACTS" signal to AI: **F**actual, **A**nswer-first, **C**oncise, **T**opically matched, **S**pecific[27]

**❌ DON'T:**
- Leave meta descriptions blank (platforms and AI parsers will auto-generate from body text, often poorly)
- Use the same description across multiple pages
- Use purely promotional language with no factual content

***

### 3.3 Open Graph & Twitter/X Card Tags

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) read `og:title` and `og:description` as explicit author-declared summaries of what a page is about, helping resolve ambiguity when the `<title>` is context-dependent. The `article:modified_time` property signals freshness directly to AI systems.[28][29]

**✅ DO:**
- Set unique `og:title`, `og:description`, `og:image`, `og:url`, and `og:type` on **every individual page** — not just the homepage[30]
- Set `og:type` correctly: `article` for editorial content, `product` for product pages, `website` for homepages/section pages[28]
- Use an `og:image` of at least 1200×630px with an absolute URL (not relative path)[29][31]
- Include `article:modified_time` on all Article pages and keep it current[29]
- Add Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) — LinkedIn, Slack, and Discord read OG tags as fallback[29]
- Set a correct `>` on every page — this tells crawlers which URL is the authoritative version and prevents duplicate content dilution[31]

**❌ DON'T:**
- Reuse the homepage `og:image` on every subpage — signals poor implementation to AI parsers[30]
- Use relative URLs for `og:image` — they fail when crawled or shared externally[31]
- Leave `og:type` unset — defaults to `website` which is the weakest classification for content pages[28]

***

## 4. Content Architecture (The Core GEO Layer)

This is where GEO diverges most sharply from traditional SEO. AI engines break pages into individual **passages** and evaluate each one for clarity, factual density, and extractability. The goal is no longer to rank a page — it is to have specific passages selected as citations.[32]

### 4.1 Answer-First Structure

Top-10 organic rankings account for only 38% of Google AI Overview citations; a page ranking #11 can be cited if it has the cleanest answer to the specific sub-question. Conversely, a #1-ranked page will be skipped if its answer is buried.[3][32]

**✅ DO:**
- Answer the primary query within the first 2 sentences of the page[33]
- Place a **Quick Answer block** (numbered list, ≤15 words per item, no marketing language) within the first 200 words — AI Overviews cite from the first 30% of content 55% of the time[4]
- Follow each section heading with a 40–60 word answer capsule (state the answer first, then add nuance below)[33]
- Use "Definition Lead" architecture: begin every major section with a self-contained definition sentence following the pattern: *"[Subject] is a [category] that [differentiator]."* — these sentences are the most extraction-friendly format for AI fragment selectors[4]

**❌ DON'T:**
- Open with background, history, or a lengthy setup before answering the query[33]
- Bury the key answer in the middle or end of a long section
- Write introductions that paraphrase the query without answering it

***

### 4.2 Heading Structure for AI Engines

**✅ DO:**
- Frame H2 and H3 headings as questions or conversational phrases that mirror exact user queries to AI platforms: "How does X work?", "What are the benefits of Y?"[34][35]
- Map headings to the language patterns users type into ChatGPT, Perplexity, and Google — not just traditional keyword planners[4]
- Cover the topic's sub-questions comprehensively — AI Overviews synthesize across multiple sub-questions, and pages that address related sub-questions are preferred[15]

**❌ DON'T:**
- Write headings as keyword-dense labels ("Best AI Tools 2026 Comparison") instead of natural language questions
- Use headings that only make sense with surrounding context — each heading + its section must be self-contained
- Skip heading levels or use multiple H1 tags

***

### 4.3 Evidence Density & Writing Style

AI models actively filter promotional content. LLMs rely on **semantic proximity and entity relationships**, not keyword density. Keyword stuffing that helped traditional search actively degrades content quality signals in AI systems.[36][37]

**✅ DO:**
- Replace marketing superlatives with verifiable, specific data: instead of "industry-leading solution", write "processes 10,000 requests per second at p99 latency under 50ms"[37][4]
- Cite primary sources inline at the point of each major claim (3–5 external authority citations per article) — the original Princeton GEO study found that adding citations and statistics can boost AI visibility by up to 40%[4]
- Include named sources: "according to Q1 2026 data from [Source]"[4]
- Write in natural, conversational language — AI engines interact conversationally and favor content with matching register[35]
- Include specific percentages, counts, and measurements rather than vague qualifiers[33]
- Use semantic depth: cover the concept, related entities, applications, and tradeoffs[37]

**❌ DON'T:**
- Use trigger words that AI models flag as advertising noise: "premier", "industry-leading", "revolutionary", "best-in-class", "game-changer", "cutting-edge"[4]
- Write unsupported assertions without evidence — AI engines treat them as opinion and deprioritize them[33]
- Publish pure AI-generated content without expert review or novel input — AI-generated commodity content cannot differentiate your site[38]
- Repeat the same phrase multiple times to hit keyword density targets[37]

***

### 4.4 Content Formats That Win AI Citations

**✅ DO:**
- Build **ranked listicle pages** for recommendation queries (Top N / Best X structure) — these dominate AI citations for comparison queries[4]
- Include a **FAQ section** on every content page with questions matching real user queries submitted to AI platforms; each answer should be 50–100 words minimum[15]
- Use **HTML comparison tables** with clear column headers and quantitative metrics for multi-entity queries[4]
- Include a **"How We Evaluated" or "Methodology" section** on ranking content — this converts a list into a hybrid informational-ranking article, triggers Gemini's web search for informational queries, and adds E-E-A-T signals[4]
- Create **HowTo guide** content for procedural queries — Gemini triggers web search for 100% of informational ("how to", "best practices") queries but not for recommendation queries[4]
- Add an **executive summary / TL;DR** at the start of long content — AI systems tend to extract the first synthesizable answer[16]
- Maintain a **3:1 ratio**: for every 3 listicle articles, produce at least 1 How-To or Best Practices article[4]

**❌ DON'T:**
- Publish only brand service/product pages without complementary informational content — service pages generate zero direct AI citations on their own[4]
- Publish standalone case studies as top-level pages — embed case study data within listicles instead[4]
- Write FAQ answers shorter than 50 words — too brief for AI extraction[15]
- Create duplicate content across pages (same answer on multiple pages creates canonical confusion for AI)[36]

***

### 4.5 Content Freshness

Content less than 3 months old is 3x more likely to be cited in AI search, and pages older than 3 months are 3x more likely to lose AI visibility. 70% of AI-cited pages were updated within the past year.[39]

**✅ DO:**
- Add a visible **version/update block** near the top of every article: "Version 2.1 — Updated June 2026"[4]
- Include a **"Verification Window"** statement with the data collection date range[4]
- Update `dateModified` in JSON-LD schema with every revision[24][4]
- Schedule quarterly reviews of all cornerstone content to refresh data, statistics, and examples[4]
- Add a visible "Last updated: [date]" timestamp on every article[1]
- Prioritize refreshes for SaaS, finance, and news-adjacent topics — the citation window is tighter than 90 days in these categories[39]

**❌ DON'T:**
- Leave articles without update signals for more than 90 days in competitive categories[40]
- Only update the `dateModified` without actually refreshing content — AI systems detect shallow freshness signals[4]
- Treat content as permanently published assets that never need revision

***

## 5. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

E-E-A-T is Google's quality evaluation framework and directly influences both traditional rankings and AI Overview citation decisions. Entity clarity is foundational — AI systems need to confidently identify who wrote the content and what organization is behind it before citing it.[41][42][43]

### 5.1 Author Signals

**✅ DO:**
- Attribute every piece of content to a real, named author with a structured bio[44]
- Ensure every author bio includes (minimum 50–100 words): full name, current title/role, years of experience, specific expertise areas, at least one credential or achievement, links to verified external profiles (LinkedIn, portfolio)[45]
- Write bios in third person professionally[45]
- Implement `Person` schema on author pages with `sameAs` linking to LinkedIn and other verified profiles[16]
- Publish a clear About page with organization history, team credentials, and mission[1]

**❌ DON'T:**
- Publish anonymous content in 2026 — no author attribution is one of the top reasons AI Overviews skip a page[15]
- Use vague author bios ("Written by the editorial team")[45]
- Claim expertise in areas your site has not consistently covered[15]

***

### 5.2 Brand Entity & Knowledge Graph

AI systems use entity extraction and Knowledge Graph integration before backlink analysis when deciding citation sources. A site with 15 backlinks that explicitly states "Dr. Jane Smith, Chief of Cardiology at Stanford Medical Center" will outperform a site with 1,500 backlinks that says "leading expert in the field".[43]

**✅ DO:**
- Keep brand name, logo, address, and contact details **consistent** across all web presences: your site, Google Business Profile, social media, Wikipedia, Wikidata, and schema[24]
- Build and manage your Google Knowledge Panel
- Pursue a **Wikipedia presence** when your organization meets notability criteria — Wikipedia is one of the most-cited domains by AI engines[1]
- Actively earn **third-party brand mentions** across trusted publications — 85% of AI brand mentions originate from third-party pages, not your own domain[46][4]
- Build branded mentions on community platforms AI engines trust: Reddit, LinkedIn, Quora — these are the most actionable external citation sources[4]

**❌ DON'T:**
- Allow contradictory data about your brand across platforms (conflicting names, old addresses, different logos)[24]
- Rely exclusively on your own domain for brand visibility — a Superlines 2026 study found brands are 6.5× more likely to be cited via third-party sources[46]
- Neglect digital PR as "just brand building" — it is now a direct GEO citation lever[47][46]

***

## 6. Internal Linking & Site Architecture

**✅ DO:**
- Use a **hub-and-spoke (pillar-cluster) model**: one comprehensive pillar page per major topic, linked to and from several supporting cluster pages that cover sub-topics[48][49]
- Use **descriptive anchor text** containing relevant keywords — not "click here" or "learn more"[21]
- Link every new piece of content to the relevant pillar page and back from the pillar to the new content[49]
- Ensure every page has at least one internal link pointing to it (no orphan pages)[21]
- Audit internal links quarterly: fix broken links, find orphan pages, optimize high-value page distribution[21]
- Sites that optimize internal linking see approximately 40% more indexed pages on average[49]

**❌ DON'T:**
- Use generic anchor text ("read more", "here", "learn more") — it strips semantic signal from internal links[21]
- Let important pages exist more than 3 clicks from the homepage[21]
- Build one-directional link flows — pillar-to-cluster and cluster-to-pillar links should both exist[48]
- Over-link to external sources without `rel="nofollow"` — use `rel="nofollow"` on all external links to prevent authority leakage[4]

***

## 7. Off-Site & Digital PR (GEO's Most Underrated Lever)

94% of AI citations came from non-paid, non-brand-owned sources in a December 2025 Muck Rack analysis. Branded web mentions correlate 3× more strongly with AI visibility than backlinks — a fundamental recalibration from traditional SEO.[46]

**✅ DO:**
- Prioritize **earned media placements** in authoritative publications your target AI engines crawl and cite[47]
- Contribute **guest articles and expert commentary** to industry publications[4]
- Produce **original research, benchmark studies, or proprietary datasets** — these give AI engines a unique reason to cite you over lookalike alternatives[1]
- Engage authentically on **Reddit, LinkedIn, and Quora** — these UGC platforms are among the most actionable external citation sources and are heavily weighted by AI systems[4]
- Distribute **press releases** through AI-indexable channels with verified pickup rates[4]
- Target publications where your **entity (brand/author) is already associated** in the Knowledge Graph[47]

**❌ DON'T:**
- Chase backlink quantity over brand mention quality — the AI visibility signal is in the brand mention itself, not the link[46]
- Focus digital PR solely on your own domain content — a co-citation in a trusted third-party article outperforms a link to your own landing page for GEO purposes[46]
- Ignore community platform presence (Reddit threads, LinkedIn articles) — AI engines extract these heavily[4]

***

## 8. Multi-Platform AI Monitoring

Different AI platforms have distinct citation behaviors. ChatGPT, Copilot, Gemini, AI Overviews, AI Mode, and Perplexity diverge significantly in which sources they cite. 68% of brand mentions in AI search appear in only one model — measuring ChatGPT alone shows ~⅓ of total visibility.[39][4]

**✅ DO:**
- Monitor brand visibility across **all 6 major AI platforms**: ChatGPT, Google Gemini/AI Overviews/AI Mode, Microsoft Copilot, and Perplexity[4]
- Track: **Mention Rate** (% of target prompts where brand appears), **Citation Position** (average rank when cited), **Prompt Coverage** (# of tracked prompts with brand mention), **Platform Distribution** (citation share by AI engine)[4]
- When measuring ChatGPT specifically, **filter out responses with no web sources** — 53.6% of ChatGPT responses return no web citations and distort mention rate calculations[4]
- Set up measurement before optimizing to establish a baseline[1]

**❌ DON'T:**
- Rely on traditional SEO tools (Search Console, Ahrefs, SEMrush) as proxies for AI search performance — they do not track AI citations[1]
- Assume Google AI Overviews represent total AI visibility — Copilot, ChatGPT, and Perplexity each have distinct citation behaviors and audiences[4]

***

## 9. Summary: GEO vs. SEO Signal Comparison

| Dimension | Traditional SEO | GEO |
|-----------|----------------|-----|
| Primary goal | Top-10 SERP ranking | AI citation / recommendation |
| Target systems | Google/Bing crawlers | ChatGPT, Gemini, Copilot, Perplexity, AI Overviews |
| Key metric | Ranking position, CTR | Mention rate, citation position |
| Content format | Keyword-optimized pages | Answer-first, Definition Lead, structured Q&A |
| Authority signal | Backlinks, domain authority | Third-party brand mentions, entity consistency, Knowledge Graph |
| Schema | Useful for rich snippets | Hygiene layer; pairs with visible content for citation potential |
| Update cadence | Periodic | 90-day maximum for competitive topics |
| Freshness signal | `dateModified` metadata | Visible version block + updated data + `dateModified` |

Both tracks are necessary. SEO delivers navigational and transactional traffic; GEO wins informational discovery where AI assistants are the primary interface. Build both in parallel.

***

## 10. Quick-Reference Agent Checklist

### Per-Page Audit Checks

**Technical**
- [ ] AI crawlers allowed in `robots.txt` (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.)
- [ ] `llms.txt` exists at domain root and includes this page/section
- [ ] HTTPS enforced, no mixed content, valid SSL
- [ ] LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (field data)
- [ ] Canonical tag set with absolute URL
- [ ] `robots` meta tag does not have `noindex` unintentionally

**Head / Meta**
- [ ] Unique title tag (50–60 chars), question/entity framing for informational pages
- [ ] Unique meta description (150–160 chars), answer-first
- [ ] `og:title`, `og:description`, `og:image` (absolute URL ≥ 1200×630), `og:type`, `og:url` set
- [ ] `article:modified_time` set and current (for Article-type pages)
- [ ] Twitter Card tags present
- [ ] `>` present and correct

**Schema (JSON-LD `@graph` block)**
- [ ] `Organization` or `LocalBusiness` on homepage
- [ ] `Article` / `BlogPosting` on all editorial pages (with `datePublished`, `dateModified`, `author`)
- [ ] `FAQPage` on pages with visible Q&A (content must match schema)
- [ ] `HowTo` on process/tutorial pages
- [ ] `BreadcrumbList` on all inner pages
- [ ] `Person` schema on author pages with `sameAs` to LinkedIn
- [ ] Schema validated with Rich Results Test

**Content Structure**
- [ ] Single `<h1>` matching primary user query
- [ ] Quick Answer block in first 200 words
- [ ] Sections begin with Definition Lead sentences
- [ ] H2/H3 headings phrased as natural-language questions
- [ ] Each section self-contained (can stand alone as a citation passage)
- [ ] 3–5 inline citations to authoritative external sources
- [ ] No marketing superlatives (check for: "premier", "industry-leading", "revolutionary", etc.)
- [ ] Visible update date / version block at top of page
- [ ] FAQ section with 50–100 word answers
- [ ] Comparison table for multi-entity content

**E-E-A-T / Entity**
- [ ] Named author with structured bio (50–100 words, credentials, LinkedIn link)
- [ ] `Person` schema on author page
- [ ] About page with organizational credentials
- [ ] Brand name consistent with Knowledge Graph / Google Business Profile

**Internal Linking**
- [ ] Page linked to from relevant pillar page
- [ ] Descriptive anchor text (no "click here" / "read more")
- [ ] Page is reachable within 3 clicks from homepage
- [ ] No broken internal links

**Off-Site**
- [ ] Content is share-ready (OG tags configured) for social/PR amplification
- [ ] Topic is covered in third-party sources (Reddit, LinkedIn, industry publications)