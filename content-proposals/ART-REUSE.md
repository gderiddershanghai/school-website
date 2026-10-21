# Guide artwork reuse

## Expanded topic selection

The larger Shanghai scene collection has now been reviewed for four additional placements. These files were visually inspected and copied unchanged from `../ai-adoption-test/asset-gen/refs/scenes/shanghai-plates/` into `guides/art/`:

| Source filename | Guide | Saved rating |
| --- | --- | --- |
| metro-rush.webp | Planning your Shanghai commute | 5/10; selected for direct topic relevance |
| wet-market.webp | Everyday payments in China | 9/10 |
| ffc-coffee-v2.webp | Teaching without Mandarin | 9/10 |
| leaf-streets-v3.webp | Shanghai seasons | 7/10 |

The café replaces the previous shopping illustration on the Mandarin page. The earlier shopping file is retained locally but is no longer referenced. Six distinct images are now used across the index and articles. Square illustrations display at a maximum width of 520 pixels, preserve their full composition and load lazily. All appear after the direct introductory answer, with descriptive alt text and illustration captions.

Ratings are existing selection evidence, not a claim that these placements were previously approved. No ranking or AI-citation effect is attributed to adding images.

21 October 2026. The user authorized inspecting and reusing artwork from the sibling ai-adoption repository. Existing illustrations are sufficient for this collection; no new generation is needed.

## Selected artwork

Paths in the source column are relative to `../ai-adoption-test/`. The files were copied unchanged into this repository and are served locally, without depending on the source project's server or asset CDN.

| Source | Local copy | Dimensions | Placement |
| --- | --- | --- | --- |
| public/landing/shanghai-v3-b.webp | guides/art/shanghai-street.webp | 1536 × 1024 | Guide index, Shanghai overview, moving checklist |
| public/landing/shanghai-nanjinglu-v1-a.webp | guides/art/shanghai-shopping.webp | 906 × 604 | Mandarin and everyday communication guide |
| public/deck-art/f_mentors_restorative_embracing.webp | guides/art/teacher-planning.webp | 272 × 320 | Desktop sidebars on the three classroom articles |

The three files total 408,042 bytes. The small teacher asset is displayed at 180 pixels wide; it is not stretched into a large hero. Article images load lazily, include intrinsic dimensions and have descriptive alt text. The index image receives loading priority. Files are reused across pages so the browser can cache them.

## Selection rationale

The tree-lined street scene provides Shanghai atmosphere without requiring new artwork. The shopping scene supports everyday language questions. A generic teacher-planning illustration fits practical classroom content.

Celebrity teaching portraits and celebrity-led Bund scenes were inspected but omitted: their identities are unrelated to the guides and could suggest an association the pages do not establish. Existing quiz archetype wording and results were not imported.

Captions identify the scenes as illustrations. They do not identify depicted people as school employees or present the scenes as photographs of Flying English. The artwork supports navigation and atmosphere; it is not evidence for employment or city-service claims.

## Future assets

Do not create 20 separate decorative heroes. If a later guide needs a transport diagram, floor plan or classroom setup example, build that specific visual from verified information. Generate additional illustrations only when the collection lacks something useful.

The guide builder preserves these placements on regeneration. The original ai-adoption repository and the parallel school redesign files remain unchanged.
