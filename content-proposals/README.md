# Flying English guide library source

The completed local library contains **20 articles and a searchable index** in `../guides/`.

Start with `../GUIDE-LIBRARY-HANDOFF.md` for the exact server commands, all page URLs, completed features and verification results. No interviews or school fact questionnaires are required for this general-guide collection.

## Current workflow

- Edit article copy in the Markdown files in this directory.
- Run `pwsh -NoProfile -ExecutionPolicy Bypass -File tools/build-guides.ps1` from the repository root to regenerate HTML.
- Run `python tools/check-guides.py` and `node tools/check-guide-interactions.cjs` to verify the output.
- Run `python tools/serve-guides.py` and open `http://127.0.0.1:8765/guides/` to browse. On Ubuntu use `python3`.

The content uses general advice, cited public guidance and labeled illustrative examples. It does not invent school operating details or teacher experiences. Earlier proposals to collect interviews and owner confirmations are superseded for this collection.

`RESEARCH-AND-BACKLOG.md` records the initial research; `RESEARCH-EXPANSION.md` records the expansion. Those are internal notes, not public pages. `build-validation.json` records static checks. Do not publish this directory.

Everything remains local. The production workflow, root navigation and sitemap need integration only when publication is authorized. No indexing or traffic results have been measured.
