"""Validate generated guide structure and local links without external packages."""
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "guides"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.refs, self.json_scripts = [], [], []
        self.h1 = 0
        self.canonicals = []
        self.description = ""
        self.in_json = False
        self.json_buffer = ""
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        self.h1 += tag == "h1"
        for field in ("href", "src"):
            if field in attrs:
                self.refs.append(attrs[field])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonicals.append(attrs["href"])
        if tag == "meta" and attrs.get("name") == "description":
            self.description = attrs.get("content", "")
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_json, self.json_buffer = True, ""

    def handle_data(self, data):
        if self.in_json:
            self.json_buffer += data

    def handle_endtag(self, tag):
        if tag == "script" and self.in_json:
            self.json_scripts.append(json.loads(self.json_buffer))
            self.in_json = False


pages = {path.resolve(): Page(path.read_text(encoding="utf-8-sig")) for path in GUIDES.glob("*.html")}
errors = []
links = 0
for path, page in pages.items():
    if page.h1 != 1:
        errors.append(f"{path.name}: {page.h1} H1s")
    if len(page.canonicals) != 1 or not page.description or not page.json_scripts:
        errors.append(f"{path.name}: missing/duplicate metadata")
    duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
    if duplicates:
        errors.append(f"{path.name}: duplicate IDs {duplicates}")
    for ref in page.refs:
        parts = urlsplit(ref)
        if parts.scheme or parts.netloc:
            continue
        links += 1
        target = (path.parent / unquote(parts.path)).resolve() if parts.path else path
        if target.is_dir():
            target /= "index.html"
        if not target.exists():
            errors.append(f"{path.name}: missing {ref}")
        elif parts.fragment and target.suffix == ".html":
            target_page = pages.get(target) or Page(target.read_text(encoding="utf-8-sig"))
            if unquote(parts.fragment) not in target_page.ids:
                errors.append(f"{path.name}: missing anchor {ref}")
        if target.suffix == ".md":
            errors.append(f"{path.name}: draft link leaked: {ref}")
    text = path.read_text(encoding="utf-8-sig")
    if re.search(r"\b(TODO|TBD)\b|<!-- budget-calculator -->|Draft requiring", text):
        errors.append(f"{path.name}: unfinished marker")

catalog = json.loads((GUIDES / "catalog.json").read_text(encoding="utf-8-sig"))
sitemap = ET.parse(GUIDES / "sitemap.xml")
urls = [item.text for item in sitemap.findall(".//{*}loc")]
if len(pages) != 21 or len(catalog) != 20 or len(urls) != 21:
    errors.append("Expected 20 articles, index and 21 sitemap URLs")
index = (GUIDES / "index.html").read_text(encoding="utf-8-sig")
for article in catalog:
    if f'href="{article["slug"]}.html"' not in index:
        errors.append(f"Index missing {article['slug']}")
if len({p.canonicals[0] for p in pages.values()}) != len(pages):
    errors.append("Duplicate canonicals across pages")
report = {
    "html_pages": len(pages), "articles": len(catalog),
    "local_links_and_assets_checked": links, "sitemap_urls": len(urls),
    "errors": errors, "scope": "Static validation only; not browser rendering or HTTP."
}
(ROOT / "content-proposals" / "build-validation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
raise SystemExit(bool(errors))
