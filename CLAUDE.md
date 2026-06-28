# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static recruiting/marketing site for **Flying English Center**, a boutique English-language school in downtown Shanghai (Huangpu District, founded 2015) hiring teachers. Plain HTML/CSS/vanilla JS — no build step, no framework, no package manager. Deployed to GitHub Pages.

The site uses an aviation / "departures board" theme (the brand is *Flying* English; the pitch is teaching in Shanghai).

## Running & deploying

- **Local preview:** open any `.html` directly, or serve the root with `python3 -m http.server <port>` and visit `http://localhost:<port>`. No install/build required.
- **Deploy:** pushing to `main` triggers `.github/workflows/pages.yml`, which uploads the entire repo root (`path: .`) as the Pages artifact and deploys it. There is no build — what's in the repo is what ships.

## Architecture & conventions

- **Four standalone pages:** `index` (home), `story`, `jobs`, `testimonials`. Each is a complete document. The topbar, header `<nav>`, and footer are **duplicated by hand in every page** — there is no include/partial mechanism, so a nav/footer/topbar change must be made in all four files.
- **One shared stylesheet, `css/style.css`** (linked normally with `<link rel="stylesheet">`, no inline critical-CSS split). It holds the `:root` design tokens and every component. Editing shared styles happens in this one file.
  - **Design tokens** (`:root`): colors `--c-ink #07243B`, `--c-navy #0A3A5C`, `--c-sky #1B84C4`, `--c-gold #F2B705`, `--c-coral #FF6A3D`, `--c-paper #FBF8F1`; fonts `--f-display` (Bricolage Grotesque), `--f-body` (Hanken Grotesk), `--f-mono` (Space Mono); a 1.25 type scale (`--t--1`…`--t-5`); `--maxw`, `--pad`, `--r*`, `--shadow`.
  - Fonts load from **Google Fonts** (`<link>` in each page `<head>`).
  - The **home hero** (`.hero`) uses a CSS-only kinetic-type entrance (masked-line `unmask`, gold-underline `sweep`, `rise`, boarding-pass `deal`). **Inner pages** use `.pagehead` with a `--bg` custom property for the background image.
- **One shared script, `js/main.js`** (loaded `defer`): off-canvas mobile nav (`.hamburger` toggles `aria-expanded` + `.nav-backdrop`, closes on link/Escape), scroll reveals (`.reveal` via IntersectionObserver), and an accessible lightbox for the jobs gallery (`[data-lightbox]`). Defensive: null-checks and feature-detects, so pages degrade gracefully. Keep markup hooks, JS, and CSS selectors in sync.
- **Assets:** images in `images/`, served as-is; reference them as `images/...` (root-relative). Photos lazy-load via `loading="lazy"`. `videos/` exists but is empty.
- **Accessibility/SEO baked in:** skip link, semantic landmarks, `prefers-reduced-motion` honored for all hero/reveal animation, visible focus rings, per-page `<meta description>` + Open Graph tags + favicon.

## Content facts (keep accurate across pages)

- **One** teaching position open, starting **late 2026**. (This count appears in: home hero boarding pass + button, the topbar `NOW BOARDING: 1 TEACHER` on all four pages, jobs hero + meta/OG, testimonials CTA.)
- **18–22** teaching hrs/week, classes of **4–6** students ages **3–12**, evenings + weekends, two weekdays off.
- Pay **¥21k–26k net/month (≈ US $2.9k–3.6k** at ~7.2 CNY/USD). Apply: `flyingenglish@163.com`.

## Gotchas

- Editing the topbar, nav, footer, or design tokens: tokens live once in `css/style.css`, but the topbar/nav/footer **markup is repeated in all four HTML files** — change each.
- The opening **count** is scattered across pages (see Content facts) — when it changes, sweep all four files.
