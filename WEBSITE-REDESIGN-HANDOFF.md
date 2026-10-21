# Latest implementation status — 21 October 2026

The reference-based replacement is now implemented locally across index.html, story.html, jobs.html and testimonials.html. The earlier notes below describe the rejected baseline and are retained as history, not current implementation status. User visual approval is still pending. Do not push or deploy.

- New homepage composition: mint hero with overlapping organic classroom photographs; shallow SVG waves between teaching, pay, Shanghai, teacher and application sections; DM Sans served locally under css/fonts with its OFL license.
- Copied the visually inspected Shanghai street illustration from the read-only reference into images/shanghai-street.webp. Real school photographs lead the design; no new generated artwork.
- Rewrote homepage and generic inner-page copy. Pay components remain separate. The conflicting opening date is omitted from the timeline rather than guessed; 2014 versus 2015 still needs owner confirmation. Existing metadata, canonicals, JSON-LD, robots, sitemap and deployment improvements remain. SEO/GEO proposal directories were not edited.
- Shared CSS carries the design through all pages. Mobile menu and gallery retained. Teacher videos now use local posters and explicit play buttons, with direct external links retained. Clicking Winnie’s button was verified to create the correct Vimeo iframe; actual video playback is unverified.
- Browser visual inspection: desktop and mobile homepage, school, role and teacher pages. Overflow checks passed on all four pages at 360, 768 and 1440px. Mobile menu open/Escape close, gallery open/Escape/focus return, gallery close button and FAQ open/close passed. Reduced-motion CSS was inspected in browser; OS preference emulation was not available. DM Sans loaded successfully.
- Static checks passed: one H1/page, unique IDs, local assets/links, cross-page fragments, JSON-LD parsing, sitemap XML, node --check js/main.js.
- Preview: http://localhost:49174/index.html served by a loopback-only WSL Python server. Confirmed HTTP 200 from Windows and rendered in the Codex browser. The old Windows 49173 servers were stopped. Leave the WSL preview running for user review.
- Screenshots: C:/Users/ginge/.codex/visualizations/2026/10/20/01a15984-4583-7150-bc1e-d774ef958604/flying-{home,school,jobs,teachers}-{desktop,mobile}.jpg. Also flying-home-desktop-preview.jpg and flying-home-mobile-preview.jpg.

Next: collect visual feedback on the working local redesign, resolve factual questions with the owner, and coordinate separately proposed SEO/GEO changes before publication. Nothing was committed, pushed or deployed in this redesign pass.

---

# Flying English website redesign handoff

Continue the local website redesign in `/home/ginger/code/gderiddershanghai/school-website`. The user rejected the first redesign and requested a fresh instance because this chat has too much accumulated context. Do not push or deploy until the user approves the visual result.

## The actual brief

The user finds the original site generic and AI-generated-looking, especially its typography. The first redesign replaced it with white backgrounds, Arial/Helvetica, thin large headings, rectangular photographs and restrained layouts. The user rejected that too: “I hate it. it gives me 2005 website feels.” Do not polish that direction or treat it as an approved baseline.

The positive reference is https://ai-test.humanmeetsai.com/. The user particularly likes its wavy section demarcations and permits reuse of its art or generation of new art appropriate to the school. They also rejected the homepage copy as slop. This is permission to redesign locally, not publish.

Reference source is available at:

`/home/ginger/code/gderiddershanghai/ai-adoption-test/public/site/index.html`

Read its styles in `public/site/styles/base.css`, `hero.css`, `sections.css` and `nav.css`. Inspect the reference repository's scoped AGENTS.md and CLAUDE.md instructions before working there. Use it as read-only reference; do not modify the quiz project.

The supplied screenshot shows a pale teal section, dark sans-serif headings, a substantial visual beside a useful numbered explanation, and a shallow organic wave into the next background. The preference is demonstrated by the reference; do not apply the earlier blanket rejection of pill buttons or other elements the reference itself uses.

## Reference findings already established

- Reference body typography: Inter/system-ui, 17px/1.62. Headings generally weight 600, with H1 weight 650 and moderate negative tracking.
- Colours include white, grey wash #f1f5f4, pale teal #e7f4f2, teal #0d9488, dark ink #0B1220.
- Wave SVGs use viewBox `0 0 1440 90`, `preserveAspectRatio="none"`, distinct cubic paths for adjacent sections, and paths extending to y=92 to avoid seams.
- Reference art uses organic image masks and multi-image compositions.
- Two locally available art files are `ai-adoption-test/public/landing/shanghai-v3-b.webp` and `shanghai-bund-v1-a.webp`. These have been located but NOT visually reviewed or copied. Inspect them before deciding whether to reuse them.
- A live-browser attempt timed out during automatic permission review; that was not a safety rejection. The website has not been visually inspected live in this resumed work. The source and user's screenshot remain available.

## User reference material

- Screenshot: `C:/Users/ginge/AppData/Local/Temp/codex-clipboard-590e35ed-f42f-40a5-ae0e-00b1ba17ef6c.png`
- Article: `C:/Users/ginge/.codex/attachments/68bb3cbe-7bcf-4963-a1a2-1b80378efc5e/Pasted text.txt`

Read the article. Its useful design argument is that changing a palette alone does not escape a formula: deliberate composition, relevant source material and iteration matter. Do not treat every stylistic example in the article as a prohibited element.

## Current working tree

Static HTML/CSS/vanilla JS, no build step. Four pages: index.html, story.html, jobs.html and testimonials.html. css/style.css and js/main.js are shared. Header/footer markup is repeated across pages.

The rejected redesign remains in the working tree. No replacement based on the new reference has been implemented. No new artwork has been generated. Do not tell the user otherwise.

Existing local changes worth retaining independently of the visual design:

- Canonicals, absolute Open Graph image URLs and EducationalOrganization JSON-LD.
- robots.txt and sitemap.xml.
- A job facts table and practical FAQ.
- Base pay separated from housing allowance and conditional bonuses.
- 17 optimized WebP copies in images/optimized, reducing those referenced images from roughly 19.5 MB to 3.1 MB; originals retained.
- Content visible without scroll-reveal JavaScript.
- Mobile menu and gallery lightbox, including Escape close and focus handling.
- Pages workflow staging public files instead of the entire repository.

The rejected version previously passed local links/assets/anchors, one-H1/unique-ID, JSON and XML checks. Its mobile navigation, FAQ and lightbox were checked in-browser. This does not verify any future redesign. Vimeo playback was not verified; direct video links were added.

Existing untracked `design-ideas/`, `images/qr/` and `GEO-suggestions-flying-english.md` may belong to other work. Preserve them. Do not bulk-stage, reset or clean the repository. Read current git status before edits.

## Copy direction

Audience: overseas teachers considering the school and moving to Shanghai. Give them specific information about the role, school, workload, support and application process. Do not replace vague copy with new vague slogans.

Rejected examples currently on the homepage include “A small school. A whole new city.” and “Could this be your next classroom?” The user wants less formulaic copy.

Use the installed deslop skill when useful:

`C:/Users/ginge/.codex/skills/deslop/SKILL.md`

Its stages reference has been read in the old chat, but no editorial pipeline artifacts have been created yet. Follow the skill's actual workflow if applying it. Do not invent teacher anecdotes, testimonials, statistics or employment benefits.

Content questions already flagged: founded in 2015 versus timeline opening in 2014; gross/net salary treatment; classroom versus total working hours; current vacancy dates and eligibility. Preserve uncertainty and avoid inventing facts.

## Separate SEO and GEO instance

The user is handing SEO/GEO work to another instance using `SEO-GEO-HANDOFF.md`. Its detailed plan is `SEO-GEO-PLAN.md`; the design description there refers to the rejected first version, not an approved direction.

This design instance owns page composition, shared CSS/JS, artwork and copy edits. The SEO instance should initially audit and propose separate changes rather than edit these same files concurrently. Preserve existing technical SEO improvements and coordinate integration later. Do not send messages to another chat unless the user authorizes that communication.

## Preview and environment

Windows PowerShell accesses the WSL checkout at:

`\\wsl.localhost\Ubuntu\home\ginger\code\gderiddershanghai\school-website`

The earlier local preview used `http://127.0.0.1:49173/`, served by Windows Python from this checkout. Check whether it is still running before starting another server. Ports 8765/8766 failed with Windows socket permission errors; 49173 worked. Historical accessibility is not current verification.

Windows Git needed a per-command safe.directory setting for this UNC path and reported some WSL filesystem limitations. Do not change global Git settings or infer a rebase from that warning without checking.

For visual checks use the supported browser tools. Verify desktop and mobile layouts, menu, CTA destinations, FAQ, gallery, reduced motion and overflow after changes. Keep the result local, show screenshots and a working preview, and request design feedback before any push.

## Next concrete action

Read the reference HTML/CSS, inspect its local artwork and the user's screenshot, then implement a substantially different local homepage using curved section transitions and a coherent school-appropriate visual treatment. Rewrite the copy for specificity. Review the rendered result before extending the chosen treatment to the other pages. Do not spend the first turn proposing generic palettes or asking the user to repeat this brief.
