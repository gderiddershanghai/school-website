"""Check the staged Pages artifact; run after the workflow staging commands."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import json, re, sys
import xml.etree.ElementTree as ET
root=Path(sys.argv[1] if len(sys.argv)>1 else '_site').resolve()
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__();self.refs=[];self.ids=[];self.h1=0;self.canonical=[];self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);self.h1+=tag=='h1'
  if 'id' in a:self.ids.append(a['id'])
  for k in ('src','href'):
   if k in a:self.refs.append(a[k])
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
errors=[];pages={p:Page(p.read_text(encoding='utf-8-sig')) for p in root.rglob('*.html')};refs=0
for p,page in pages.items():
 if page.h1!=1 or len(page.canonical)!=1:errors.append(str(p)+' heading/canonical')
 if len(page.ids)!=len(set(page.ids)):errors.append(str(p)+' duplicate IDs')
 for ref in page.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=(root/unquote(u.path).lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  refs+=1
  if not target.is_file():errors.append(f'{p.name}: missing {ref}')
  elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:errors.append(f'{p.name}: missing anchor {ref}')
 for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',p.read_text(encoding='utf-8-sig'),re.S):json.loads(raw)
for p in root.rglob('*'):
 if p.is_file() and (p.suffix.lower() in ('.md','.py','.ps1','.cjs') or any(x in p.parts for x in ('content-proposals','tools','design-ideas','seo-geo-audit-2026-10-20','qr'))):errors.append('Internal file staged: '+str(p))
for p in root.rglob('*.css'):
 for ref in re.findall(r'url\([\'"]?([^\)\'"]+)',p.read_text(encoding="utf-8-sig")):
  if not urlsplit(ref).scheme and not (p.parent/ref).is_file():errors.append('CSS asset missing: '+ref)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[e.text for e in ET.parse(root/'sitemap.xml').findall('s:url/s:loc',ns)]
if len(urls)!=len(set(urls)):errors.append('Duplicate sitemap URLs')
if set(urls)!={p.canonical[0] for p in pages.values()}:errors.append('Sitemap/canonical coverage differs')
print(json.dumps({'pages':len(pages),'local_references':refs,'sitemap_urls':len(urls),'errors':errors},indent=2))
sys.exit(bool(errors))
