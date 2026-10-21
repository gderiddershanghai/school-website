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

# Flying English guide integration and main branch handoff

21 October 2026. For the instance handling website integration and publication.

## User instruction and scope

The user wants the other instance to integrate this work and push it to `main`. A push triggers GitHub Pages. Proceed with the guide integration and publication checks under that instruction; do not request school interviews or repeat the earlier factual questionnaire.

This is a general teaching and China/Shanghai guide collection. School-specific details are deliberately limited. The earlier visual redesign was rejected; this handoff does not approve that rejected design or unrelated changes in the shared working tree. Reconcile the collection with the design decisions already made in your own session.

Workspace: `/home/ginger/code/gderiddershanghai/school-website` (Windows UNC: `\\wsl.localhost\Ubuntu\home\ginger\code\gderiddershanghai\school-website`). Work in this existing checkout; the guide files are already here. No cherry-pick or reconstruction is needed.

## Read first

1. Applicable repository AGENTS.md and CLAUDE.md instructions. No school-repository AGENTS.md was found during this work; reinspect current state. CLAUDE.md has historical design, deployment and salary details that should not override current code or user decisions.
2. `GUIDE-LIBRARY-HANDOFF.md` for server commands, all 20 article URLs, build commands and the original verification record.
3. `content-proposals/README.md` and `content-proposals/ART-REUSE.md` for editable copy, asset sources and current placements.
4. `SEO-GEO-HANDOFF.md` and `seo-geo-audit-2026-10-20/AUDIT-AND-BACKLOG.md` for the original SEO inventory and limits. Their no-publication instruction is historical: the latest user instruction authorizes this integration and push through your instance. Off-site outreach and external-listing edits remain outside scope.

## Completed files

| Path | Contents and treatment |
| --- | --- |
| `guides/index.html` | Searchable guide library, four categories, 20 linked articles |
| `guides/*.html` | Twenty complete articles; readable HTML independent of JavaScript |
| `guides/guides.css` | Isolated responsive guide styles; separate from the redesign's shared CSS |
| `guides/guides.js` | Search/category filters and arrival-budget calculator; no tracking or form submission |
| `guides/art/` | Local reused WebP artwork; no runtime dependency on the ai-adoption repo or its CDN |
| `guides/sitemap.xml` | The guide index plus 20 canonical article URLs |
| `guides/catalog.json` | Generated article metadata |
| `content-proposals/*.md` | Editable article sources and internal research/provenance notes; despite the folder name, the 20 articles are implemented |
| `tools/build-guides.ps1` | PowerShell 7 generator for index/article HTML, catalog and guide sitemap |
| `tools/check-guides.py` | Standard-library validation of all pages, local links, anchors, metadata and JSON-LD |
| `tools/check-guide-interactions.cjs` | Exercises the actual guide JS using a DOM fixture |
| `tools/serve-guides.py` | Standard-library local preview server |
| `GUIDE-LIBRARY-HANDOFF.md` | Review and maintenance instructions |
| `content-proposals/SHANGHAI-ART-INVENTORY.json` | 177 Shanghai scene-art files including versions; not 177 unique subjects |

The initial SEO work already exists in the shared HTML and workflow changes: canonicals, organization data, practical job-page copy, optimized images, robots.txt, root sitemap and public-file deployment staging. Preserve useful parts while reconciling your redesign. Do not restore the rejected visual version to recover these features.

## Integrate the collection

1. Inspect current Git status and diffs. Multiple instances have edited this checkout. Do not reset, clean or bulk-stage the tree. The current workflow also includes `interview.html` and `teacher-quiz.html` from the other stream; preserve deliberate existing additions.
2. Add a clear **Guides** link to the main navigation/footer of the current public pages. Use `/guides/` (or an equivalent correct relative URL). Include pages introduced by your own stream. Add a relevant contextual link from the homepage or job page so the library is discoverable without knowing its address.
3. Preserve the guide library's existing navigation back to `../index.html`, `../story.html` and `../jobs.html`. If adapting header/footer styling, change the generator template as well as the generated output so rebuilding does not undo integration.
4. Add `guides/` to `.github/workflows/pages.yml` public-file staging. For the inspected workflow, extend the existing asset copy to `cp -R css js images guides _site/` or use an equivalent explicit public allowlist. Do not upload the repository root.
5. Merge the 21 URLs from `guides/sitemap.xml` into the root `sitemap.xml`, deduplicating and preserving all other legitimate existing public URLs. Keep the guide index canonical as `https://flyingenglish-shanghai.com/guides/`, with article canonicals ending in `.html`. The standalone guide sitemap can remain, but the root sitemap should provide complete discoverability.
6. Preserve `robots.txt`'s sitemap declaration pointing at the root sitemap. Check that all published guide/image/style/script URLs exist in the staged artifact.
7. Keep `content-proposals/`, `tools/`, audit evidence, research files, design experiments and handoff Markdown out of the Pages artifact. They may be versioned as source/documentation according to repository policy, but must not be copied to `_site`. Inspect asset-folder contents too: the workflow copies the entire images directory.

No JobPosting implementation is included in this guide collection. Do not invent vacancy dates, eligibility promises or salary facts during integration. Earlier requests for first-hand teacher diaries/interviews are superseded for this collection; they are not release prerequisites.

## Verification before push

Run from the school repository:

```bash
python3 tools/check-guides.py
node tools/check-guide-interactions.cjs
```

On Windows use `python`. Rebuild only if copy/templates changed:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File tools/build-guides.ps1
```

PowerShell 7 is needed only to regenerate the checked-in HTML. Serving/deploying requires no Node packages or build dependency.

Start local preview if necessary:

```bash
python3 tools/serve-guides.py
```

Open `http://127.0.0.1:8765/guides/`. A Windows-side preview server was left running by this instance; reuse it if reachable. If a port is occupied, identify its owner or use `--port 8766`. Do not terminate unrelated development servers.

Complete a desktop/mobile visual pass on the index, a long table article, an illustrated article and the budget tool. Test navigation, keyboard focus, category filters, search, no-results/clear states, contents anchors, table overflow and calculator reset. Keep article text available with JavaScript disabled. Inspect the actual staged public artifact, not merely the source tree.

Latest verified results before your integration:

- 21 HTML pages, 20 articles, 21 guide sitemap URLs.
- 527 local links/assets/anchors checked, zero errors; JSON-LD parsed.
- Search/category, empty-results, clear, case-insensitive search, budget total, invalid input and reset checks passed in a DOM fixture.
- Windows HTTP GET for `/guides/` returned 200 after starting the server outside the sandbox. Later `/guides/shanghai-metro-commute.html` returned 200 and contained the new metro image reference.
- Selected source artwork was visually inspected. A full rendered desktop/mobile site review remains pending; do not represent DOM-fixture checks as browser QA.

The old library handoff described initial approval timeouts. Those were later resolved for HTTP checks; the current status above takes precedence.

## Commit and publish

Review explicit file selections. The guide implementation, article sources, builder/check scripts and provenance/handoff documents are the work produced here. Reconcile shared HTML/CSS/JS and workflow changes with your own session before staging them. Avoid accidentally committing unrelated design experiments or sensitive files from the existing dirty tree. Treat the original audit evidence directory as internal working material unless intentionally versioning it under repository policy; never publish it as site content.

Commit the integrated site/source changes and push to `main` under the user's instruction. If repository branch policy requires a PR instead, follow that policy and report the actual state. Preserve existing unrelated changes.

After the Pages workflow completes, verify production `/guides/`, representative articles, artwork, root sitemap, robots.txt, canonical tags and navigation. Confirm that internal working files were excluded from the deployment artifact. Record commit, deployment and live HTTP verification separately. A successful push is not proof the new pages are deployed.

No outreach, directory edits or paid listings are authorized. No ranking, indexing, enquiry, AI-citation or traffic improvement has been measured. Search-account submissions are not needed to complete this integration and should follow the user's account-access instructions.

## Completion reply

Give the user the live guide-library URL, integrated commit, deployment status, checks performed and any concrete remaining failure. Keep the reply focused on the published result. Update the existing handoff with the actual deployed state so later instances do not restart from the earlier local-only snapshot.
