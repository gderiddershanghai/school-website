# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for **Flying English Center**, an English-language school in Shanghai recruiting teachers. Plain HTML/CSS/vanilla JS — no build step, no framework, no package manager. Deployed to GitHub Pages.

## Running & deploying

- **Local preview:** open any `.html` directly, or serve the root with `python3 -m http.server` then visit `http://localhost:8000`. No install/build required.
- **Deploy:** pushing to `main` triggers `.github/workflows/pages.yml`, which uploads the entire repo root (`path: .`) as the Pages artifact and deploys it. There is no build — what's in the repo is what ships.

## Architecture & conventions

- **Pages are standalone, not templated.** Each top-level `.html` (`index`, `story`, `jobs`, `testimonials`) is a complete document. The header `<nav>` and footer are **duplicated by hand in every page** — there is no include/partial mechanism, so a nav or footer change must be made in all four files.
- **Three-tier CSS, intentionally split:**
  1. `:root` design tokens (`--primary` `#CBA205` gold, `--accent` `#074E78` blue, `--light`, `--radius`, `--gap`) are defined in `css/style.css` **and re-declared inline** in each page's `<head>` `<style>` block.
  2. Each page inlines its **critical above-the-fold CSS** in `<head>` (header, hero, layout) and loads `css/style.css` asynchronously via the `media="print"` + `onload="this.media='all'"` trick (with a `<noscript>` fallback). When changing shared styles, check both the inline block and `style.css`.
  3. Page-specific rules are **scoped under a page id** (e.g. `#story-page`, `#jobs-page`) set on the `<body>` to avoid cross-page bleed.
- **JS is one optional file.** `js/main.js` handles the mobile hamburger toggle and an IntersectionObserver fade-in (`.fade` → `.fade.in`). It's defensive (null-checks elements, feature-detects `IntersectionObserver`) so pages work without it. Toggling is driven by `aria-expanded` on `nav ul`, which the CSS `nav ul[aria-expanded="true"]` selector keys off of — keep markup, JS attribute, and CSS selector in sync.
- **Assets:** images in `images/`, served as-is. Hero/banner images are `.webp`; photos lazy-load via `loading="lazy"` and carry explicit `width`/`height`. `videos/` exists but is empty.
- The `<template id="...">` blocks in `index.html` (`cta-template`, `card-template`) are unused scaffolding, not wired to any JS.

## Gotchas

- Editing nav links, footer, or design tokens means repeating the change across all four HTML files.
- `readme.MD` is empty.
