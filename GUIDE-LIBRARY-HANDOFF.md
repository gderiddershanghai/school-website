# Published state — 21 October 2026 (Asia/Shanghai)

The latest approved redesign and integrated guide collection are LIVE at https://flyingenglish-shanghai.com/guides/ . The user's integration/publication instruction supersedes all historical local-only/no-push notes below.

- Integrated site commit: `cd71aa7d9c67145dddb922555a13345046bed40c`, pushed to `main`.
- GitHub Pages workflow: https://github.com/gderiddershanghai/school-website/actions/runs/39565547463 — completed successfully for that commit.
- Live HTTP verification: all 27 canonical pages returned 200, including all 20 guide articles and the searchable index. Canonicals matched each requested URL. Root sitemap returned 200 with 27 unique URLs; robots.txt returned 200 and declared the root sitemap. Homepage Guides navigation was present.
- Representative live guide CSS/JS, metro artwork, local font and Shanghai carousel artwork returned 200. The library was inspected in the production browser at desktop and mobile widths; no page overflow.
- Actual downloaded Pages artifact: 98 files, 27 HTML pages, 36.61 MiB. No research, audit evidence, tools, handoff Markdown, design experiments or images/qr files were present. Sample live requests for internal handoff/source/tool/audit/QR-generation paths returned 404.
- Local checks: supplied check-guides.py (21 guide pages, 20 articles, 569 local references), check-guide-interactions.cjs, JS syntax, and new check-public-site.py (27 staged pages, 741 local references, 27 sitemap URLs) passed.
- Rendered QA covered desktop/mobile guide index, long comparison tables, illustrated metro article and budget calculator; navigation, keyboard focus, table scrolling, contents anchors, search/category/no-results/clear and calculator total/invalid/reset. Fixed a mobile flex-width issue so tables scroll inside their container. Static HTML contains all article text and links without JavaScript; no separate browser JS-disable emulation was performed.
- The six school pages have Guides links in navigation/footer; jobs has a contextual guide link. The guide generator preserves matching local DM Sans, school branding and navigation. Root sitemap includes interview.html and teacher-quiz.html as well as the guides.
- Current homepage Shanghai carousel uses ten existing people-free illustrations with location captions. Teacher interview intro removed; historical video dates retained. Candidate questions and embedded quiz pages included in publication. The external quiz logo is managed by the separate quiz project.
- Unrelated research, original audit evidence, design experiments, QR work and unused initial carousel images remain local and uncommitted. Do not bulk-stage them.
- Evidence kept locally: `_site/live-verification.json`; deployed artifact `/tmp/flying-pages-cd71aa7/artifact.tar`; screenshots `C:/Users/ginge/.codex/visualizations/2026/10/20/01a15984-4583-7150-bc1e-d774ef958604/guides-live-{desktop,mobile}.jpg`.

No search-engine submission, external listing change, outreach or measured indexing/ranking/traffic/AI-citation result is claimed. A documentation-only follow-up commit records this result; the deployed website content remains the integrated commit above.

---

# Integration verification — 21 October 2026

Integrated with the current mint/wave/DM Sans design. Navigation and contextual links added; 27 canonical public URLs in the root sitemap. Explicit Pages staging includes guides and excludes research, tools, handoffs, design experiments and images/qr.

Checks passed: 21 guide pages/20 articles/569 guide references; supplied JS interaction tests; 27 staged pages/741 local references/27 sitemap URLs. Desktop/mobile browser QA covered library, comparison tables, illustrated metro article and arrival calculator. Fixed mobile article width so tables scroll within their container; keyboard table scrolling, contents links, search/category/no-results/clear and calculator total/invalid/reset were verified. Static HTML retains article text without JS.

Publication status: prepared for the authorized main push; deployment confirmation will be recorded after completion.

---

# Flying English guide library handoff

Latest instruction, 21 October: the user wants the other instance to integrate this collection and push to main. Read `GUIDE-INTEGRATION-HANDOFF.md` for the current publication scope and integration checklist. The earlier local-only status below describes what this instance completed, not a continuing requirement to request publication approval again.

Completed locally on 21 October 2026, using research checked on 20 October: **20 guide articles plus a searchable index**, ready to browse. The library covers general teaching, moving to China and Shanghai life. No school interview or factual questionnaire is needed to review these pages.

## Start the server

From an Ubuntu or WSL terminal:

```bash
cd /home/ginger/code/gderiddershanghai/school-website
python3 tools/serve-guides.py
```

Then open **[http://127.0.0.1:8765/guides/](http://127.0.0.1:8765/guides/)** in your browser.

Leave the terminal running while you browse. Press **Ctrl+C** to stop it. There is no installation, npm command or build step needed: the generated HTML is already present.

From Windows PowerShell, this equivalent command uses the existing Windows Python installation:

```powershell
Set-Location '\\wsl.localhost\Ubuntu\home\ginger\code\gderiddershanghai\school-website'
python tools/serve-guides.py
```

If port 8765 is already occupied, use:

```bash
python3 tools/serve-guides.py --port 8766
```

Then open [http://127.0.0.1:8766/guides/](http://127.0.0.1:8766/guides/). On Windows, use `python` instead of `python3`.

The server binds to the local computer only. Do not use `0.0.0.0` or expose the repository publicly to review these pages.

## Suggested review route

1. Open the guide index. Search for a topic and try a category filter.
2. Open the budget guide and enter your own sample numbers in its calculator.
3. Open a long guide and use its contents links.
4. Narrow the browser window to review the responsive layout.
5. Follow related-reading links between articles.

The guide library has its own CSS and JavaScript in `guides/`. The existing homepage, job page, story page, testimonial page and shared assets were not edited by this content task. The earlier visual redesign remains a separate review.

## All completed pages

### Choosing a role

1. [Teach English in Shanghai](http://127.0.0.1:8765/guides/teach-english-shanghai.html)
2. [Choosing a teaching role in China](http://127.0.0.1:8765/guides/choosing-teaching-role-china.html)
3. [Comparing teaching offers](http://127.0.0.1:8765/guides/compare-teaching-offers.html)
4. [Teaching hours versus working hours](http://127.0.0.1:8765/guides/teaching-hours-working-hours.html)
5. [Teacher interview questions](http://127.0.0.1:8765/guides/teacher-interview-questions.html)
6. [Shanghai teaching qualifications](http://127.0.0.1:8765/guides/teaching-eligibility-shanghai.html)
7. [TEFL, TESOL and CELTA](http://127.0.0.1:8765/guides/tefl-tesol-celta.html)

### Moving to China

8. [Moving to Shanghai](http://127.0.0.1:8765/guides/moving-to-shanghai.html)
9. [Money before your first salary and budget calculator](http://127.0.0.1:8765/guides/china-first-month-budget.html)
10. [Renting in Shanghai](http://127.0.0.1:8765/guides/renting-shanghai.html)
11. [Packing for Shanghai](http://127.0.0.1:8765/guides/packing-shanghai.html)
12. [Phone and internet setup](http://127.0.0.1:8765/guides/phone-internet-china.html)
13. [Paying for everyday things](http://127.0.0.1:8765/guides/paying-in-china.html)

### Living in Shanghai

14. [Planning your commute](http://127.0.0.1:8765/guides/shanghai-metro-commute.html)
15. [Teaching without Mandarin](http://127.0.0.1:8765/guides/teaching-without-mandarin.html)
16. [Shanghai's seasons](http://127.0.0.1:8765/guides/shanghai-seasons.html)
17. [Your first train trip in China](http://127.0.0.1:8765/guides/train-travel-china.html)

### In the classroom

18. [Planning your first young-learner lesson](http://127.0.0.1:8765/guides/first-young-learner-lesson.html)
19. [Five games for small English classes](http://127.0.0.1:8765/guides/small-class-english-games.html)
20. [Teaching children at different English levels](http://127.0.0.1:8765/guides/mixed-level-classroom.html)

## What was built

Artwork update, 21 October: six distinct existing illustrations from the sibling ai-adoption project are now used in the guide index and selected articles. The expanded selection includes metro, market, café and autumn street scenes. See `content-proposals/ART-REUSE.md` for source paths, ratings and placements. No new artwork was generated.

- Readable static HTML, with all article text and navigation present without JavaScript.
- A directory with full-text search and four category filters.
- Article contents navigation, related reading and links to the existing school pages.
- A local arrival-budget calculator; values are neither saved nor transmitted.
- Page titles, meta descriptions, canonical URLs, Article/Breadcrumb structured data and a separate guide sitemap.
- Responsive guide styles, visible keyboard focus, reduced-motion support and print styling.
- Source Markdown, a repeatable build script and static/interaction checks.

Changing official guidance is linked to current sources. Financial examples are labeled fictional, not market averages or Flying English offers. No teacher diary, invented testimonial, personal interview or school-specific visa guarantee was added.

## Verification

See `content-proposals/build-validation.json` for the static validation results. The checker covers every generated HTML page, local links/assets, contents anchors, metadata, JSON-LD parsing, index coverage and sitemap counts.

The actual enhancement script was exercised in a DOM fixture for category filtering, case-insensitive search, empty results, clearing filters, calculator addition, invalid amounts and resetting. This is not a rendered-browser test.

Browser preview and loopback HTTP requests could not complete because the automatic approval reviews timed out, including their permitted retries. No visual rendering, mobile screenshot or HTTP success is claimed. The pages remain available for your own local browser review using the commands above.

Later update: the server was restarted outside the sandbox and Windows HTTP checks succeeded for `/guides/` and the updated metro guide. The preview was left running. Full rendered-browser/mobile validation is still pending; see the integration handoff for current verification details.

## Editing and rebuilding

Article copy lives in `content-proposals/*.md`. Article order and categories, page templates and metadata generation live in `tools/build-guides.ps1`. The CSS and JS in `guides/` are hand-maintained and are not overwritten by the builder.

To regenerate the HTML from PowerShell 7:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File tools/build-guides.ps1
```

The execution-policy option applies only to that process; it does not change the machine's saved policy. On Linux with PowerShell 7 installed, use `pwsh -NoProfile -File tools/build-guides.ps1`.

To check the generated output:

```bash
python3 tools/check-guides.py
node tools/check-guide-interactions.cjs
```

On Windows, substitute `python` for `python3`.

## Local versus deployed

Everything above is implemented locally. Nothing was pushed, deployed, submitted to search engines or changed on an external listing. No indexing, traffic or AI-citation improvement is claimed.

The current deployment workflow still stages only the original four pages, and the root navigation/sitemap remain unchanged. After publication is authorized, integration should add `guides/` to the public deployment, link the library from the main navigation and merge its URLs into the production sitemap. Do not publish `content-proposals/`, `tools/`, research or audit files.

The earlier suggestions to arrange teacher interviews or request school confirmations are superseded for this general-guide collection. They are not prerequisites for reviewing these finished local pages.
