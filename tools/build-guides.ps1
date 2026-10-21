# Requires PowerShell 7 (ConvertFrom-Markdown). Generated HTML needs no runtime.
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$sourceDir = Join-Path $repoRoot 'content-proposals'
$outputDir = Join-Path $repoRoot 'guides'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
$baseUrl = 'https://flyingenglish-shanghai.com'
$reviewDate = '2026-10-20'
$articleArt = @{
  'teach-english-shanghai' = @('shanghai-street.webp', 'Illustrated tree-lined Shanghai street with neighbours, shops and people talking', 'Shanghai street life · illustration', 1536, 1024)
  'moving-to-shanghai' = @('shanghai-street.webp', 'Illustrated Shanghai neighbourhood with local shops and pedestrians', 'Finding your feet in Shanghai · illustration', 1536, 1024)
  'teaching-without-mandarin' = @('ffc-coffee-v2.webp', 'Illustrated neighbourhood café with people talking at outdoor tables', 'Everyday conversations at a neighbourhood café · illustration', 1024, 1024)
  'shanghai-metro-commute' = @('metro-rush.webp', 'Illustrated commuters waiting to board a metro train', 'Planning for the daily commute · illustration', 1024, 1024)
  'paying-in-china' = @('wet-market.webp', 'Illustrated shoppers and vegetable stalls inside a neighbourhood market', 'Everyday shopping at a neighbourhood market · illustration', 1024, 1024)
  'shanghai-seasons' = @('leaf-streets-v3.webp', 'Illustrated tree-lined Shanghai street with yellow autumn leaves', 'A change of season on a tree-lined street · illustration', 1024, 1024)
}
$classroomArt = @('first-young-learner-lesson','small-class-english-games','mixed-level-classroom')
function Encode([string]$value) { [System.Net.WebUtility]::HtmlEncode($value) }
$groups = [ordered]@{
  'Choosing a role' = @('teach-english-shanghai','choosing-teaching-role-china','compare-teaching-offers','teaching-hours-working-hours','teacher-interview-questions','teaching-eligibility-shanghai','tefl-tesol-celta')
  'Moving to China' = @('moving-to-shanghai','china-first-month-budget','renting-shanghai','packing-shanghai','phone-internet-china','paying-in-china')
  'Living in Shanghai' = @('shanghai-metro-commute','teaching-without-mandarin','shanghai-seasons','train-travel-china')
  'In the classroom' = @('first-young-learner-lesson','small-class-english-games','mixed-level-classroom')
}
$articles = @()
foreach ($group in $groups.Keys) {
  foreach ($slug in $groups[$group]) {
    $source = Get-Content -Raw -LiteralPath (Join-Path $sourceDir "$slug.md")
    $title = [regex]::Match($source, '(?m)^title: "(.+)"').Groups[1].Value
    $description = [regex]::Match($source, '(?m)^meta_description: "(.+)"').Groups[1].Value
    if (!$title -or !$description) { throw "Missing metadata: $slug" }
    $body = [regex]::Replace($source, '(?s)\A---\r?\n.*?\r?\n---\r?\n', '')
    $body = [regex]::Replace($body, '(?m)^# .+\r?\n', '')
    $body = $body.Replace('https://flyingenglish-shanghai.com/jobs.html','../jobs.html').Replace('https://flyingenglish-shanghai.com/story.html','../story.html')
    $body = [regex]::Replace($body, '\]\(([a-z0-9-]+)\.md\)', ']($1.html)')
    $html = (ConvertFrom-Markdown -InputObject $body).Html
    $html = $html.Replace('<table>', '<div class="table-scroll" role="region" aria-label="Comparison table" tabindex="0"><table>').Replace('</table>', '</table></div>')
    $headings = [regex]::Matches($html, '<h2 id="([^"]+)">(.*?)</h2>')
    $toc = ($headings | ForEach-Object { '<li><a href="#' + $_.Groups[1].Value + '">' + $_.Groups[2].Value + '</a></li>' }) -join "`n"
    $wordCount = [regex]::Matches([regex]::Replace($html,'<[^>]+>',' '),'\S+').Count
    $articles += [pscustomobject]@{slug=$slug;title=$title;description=$description;category=$group;html=$html;toc=$toc;minutes=[Math]::Max(2,[Math]::Ceiling($wordCount/200))}
  }
}
function Header {
@'
<a class="skip" href="#main">Skip to content</a>
<header class="site-head"><div class="shell head-inner">
<a class="brand" href="../index.html"><img class="brand-logo" src="../images/logo.png" alt="" width="500" height="341"><span>Flying English<span class="brand-sub">Shanghai</span></span></a>
<nav aria-label="Main navigation"><a href="index.html">All guides</a><a href="../story.html">Our school</a><a href="../teacher-quiz.html">Teacher quiz</a><a class="nav-role" href="../jobs.html">Teaching role <span aria-hidden="true">↗</span></a></nav>
</div></header>
'@
}
function Footer {
@'
<footer class="site-foot"><div class="shell footer-inner"><div><strong>Flying English Center</strong><p>Practical reading for teaching and living in China.</p></div><nav aria-label="Footer"><a href="index.html">Browse all guides</a><a href="../index.html">School website</a><a href="../jobs.html">Explore the role</a></nav><p class="fine">General guides · Sources linked in the articles</p></div></footer>
'@
}
function Head([string]$title,[string]$description,[string]$path,[object]$schema) {
  $json = ConvertTo-Json -InputObject $schema -Depth 12 -Compress
  $json = $json.Replace('<','\u003c')
@"
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>$(Encode $title) | Flying English</title><meta name="description" content="$(Encode $description)">
<link rel="canonical" href="$baseUrl/guides/$path"><meta property="og:title" content="$(Encode $title)"><meta property="og:description" content="$(Encode $description)"><meta property="og:type" content="website"><meta property="og:url" content="$baseUrl/guides/$path">
<link rel="icon" href="../images/logo.svg" type="image/svg+xml"><link rel="stylesheet" href="guides.css"><script src="guides.js" defer></script>
<script type="application/ld+json">$json</script></head>
"@
}
$calculator = @'
<section class="budget-tool" aria-labelledby="budget-heading"><h3 id="budget-heading">Your arrival budget</h3><p>Enter amounts in RMB. No figures are saved or sent.</p>
<form id="budget-form"><div class="budget-inputs">
<label>Travel and documents<input name="travel" type="number" min="0" step="1" inputmode="numeric" value="0"></label>
<label>Temporary accommodation<input name="temporary" type="number" min="0" step="1" inputmode="numeric" value="0"></label>
<label>Deposit and advance rent<input name="housing" type="number" min="0" step="1" inputmode="numeric" value="0"></label>
<label>Living costs before payday<input name="living" type="number" min="0" step="1" inputmode="numeric" value="0"></label>
<label>Contingency<input name="reserve" type="number" min="0" step="1" inputmode="numeric" value="0"></label></div>
<div class="budget-result"><span>Amount to have available</span><output id="budget-total" aria-live="polite">RMB 0</output></div>
<p id="budget-error" class="form-error" role="status"></p><button type="reset">Clear amounts</button></form>
<noscript><p>Add the five amounts above to calculate your total. Enable JavaScript for automatic calculation.</p></noscript></section>
'@
foreach ($article in $articles) {
  $slug = $article.slug
  $schema = @{
    '@context'='https://schema.org';'@graph'=@(
      @{'@type'='Article';headline=$article.title;description=$article.description;url="$baseUrl/guides/$slug.html";inLanguage='en';author=@{'@type'='Organization';name='Flying English Center';url="$baseUrl/"};mainEntityOfPage="$baseUrl/guides/$slug.html"},
      @{'@type'='BreadcrumbList';itemListElement=@(
        @{'@type'='ListItem';position=1;name='Guides';item="$baseUrl/guides/"},
        @{'@type'='ListItem';position=2;name=$article.title;item="$baseUrl/guides/$slug.html"}
      )}
    )
  }
  $related = @($articles | Where-Object {$_.category -eq $article.category -and $_.slug -ne $slug} | Select-Object -First 3)
  $relatedHtml = ($related | ForEach-Object {'<li><a href="'+$_.slug+'.html">'+(Encode $_.title)+' <span aria-hidden="true">↗</span></a></li>'}) -join "`n"
  $content = $article.html.Replace('<!-- budget-calculator -->',$calculator)
  $featureArt = ''
  if ($articleArt.ContainsKey($slug)) {
    $art = $articleArt[$slug]
    $artClass = if ($art[3] -eq $art[4]) { 'article-art art-square' } else { 'article-art' }
    $featureArt = '<figure class="'+$artClass+'"><img src="art/'+$art[0]+'" alt="'+(Encode $art[1])+'" width="'+$art[3]+'" height="'+$art[4]+'" loading="lazy" decoding="async"><figcaption>'+(Encode $art[2])+'</figcaption></figure>'
  }
  $sidebarArt = ''
  if ($slug -in $classroomArt) {
    $sidebarArt = '<figure class="teacher-art"><img src="art/teacher-planning.webp" alt="Illustrated teacher planning with a laptop and a map on a desk" width="272" height="320" loading="lazy" decoding="async"><figcaption>Planning the next lesson · illustration</figcaption></figure>'
  }
  $page = (Head $article.title $article.description "$slug.html" $schema) + @"
<body>$(Header)
<main id="main" class="shell"><div class="breadcrumb"><a href="index.html">Guides</a><span aria-hidden="true">/</span><span>$(Encode $article.category)</span></div>
<header class="article-head"><p class="eyebrow">$(Encode $article.category)</p><h1>$(Encode $article.title)</h1><div class="article-meta"><span>Flying English Center</span><span>$($article.minutes) min read</span><span>Reviewed 20 October 2026</span></div></header>
<div class="reading-layout"><aside class="on-page"><details open><summary>In this guide</summary><nav aria-label="On this page"><ol>$($article.toc)</ol></nav></details><a class="back-link" href="index.html">← All questions</a>$sidebarArt</aside>
<article class="article-body">$content
<div class="article-end"><span class="eyebrow">Keep exploring</span><h2>Related reading</h2><ul>$relatedHtml</ul></div>
</article></div></main>$(Footer)</body></html>
"@
  if ($featureArt) {
    # Keep the direct answer first, followed by the contextual illustration.
    $leadEnd = $page.IndexOf('</p>', $page.IndexOf('<article class="article-body">')) + 4
    $page = $page.Insert($leadEnd, $featureArt)
  }
  Set-Content -LiteralPath (Join-Path $outputDir "$slug.html") -Value $page -Encoding utf8
}
$sections = ''
$number = 0
foreach ($group in $groups.Keys) {
  $groupId = $group.ToLower().Replace(' ','-')
  $rows = ''
  foreach ($article in ($articles | Where-Object {$_.category -eq $group})) {
    $number++
    $searchText = "$($article.title) $($article.description) " + [System.Net.WebUtility]::HtmlDecode([regex]::Replace($article.html,'<[^>]+>',' '))
    $rows += @"
<li class="guide-item" data-category="$(Encode $group)" data-search="$(Encode $searchText)"><a href="$($article.slug).html"><span class="row-number">$('{0:d2}' -f $number)</span><div><h3>$(Encode $article.title)</h3><p>$(Encode $article.description)</p></div><span class="row-arrow" aria-hidden="true">↗</span></a></li>
"@
  }
  $sections += "<section class=`"guide-group`" id=`"$groupId`"><div class=`"group-heading`"><h2>$(Encode $group)</h2><span>$($groups[$group].Count) guides</span></div><ol class=`"guide-list`">$rows</ol></section>"
}
$filterButtons = ($groups.Keys | ForEach-Object {'<button type="button" data-filter="'+(Encode $_)+'" aria-pressed="false">'+(Encode $_)+'</button>'}) -join ''
$indexSchema = @{'@context'='https://schema.org';'@type'='CollectionPage';name='Teaching in China and living in Shanghai';url="$baseUrl/guides/";description='Practical questions, clear answers and useful tools for your next chapter in China.'}
$index = (Head 'Teaching in China and living in Shanghai' 'Explore 20 practical guides to teaching jobs, qualifications, moving to China, Shanghai life and classroom ideas.' '' $indexSchema) + @"
<body>$(Header)<main id="main">
<section class="library-hero"><div class="shell hero-layout"><div><p class="eyebrow">The China &amp; Shanghai guidebook</p><h1>Teaching in China.<br><em>Life in Shanghai.</em></h1><p class="hero-intro">Practical answers about finding a role, planning the move, settling into the city and teaching your first classes.</p><a class="text-link" href="#library">Find your question <span aria-hidden="true">↓</span></a></div><aside class="start-note"><figure class="index-art"><img src="art/shanghai-street.webp" alt="Illustrated tree-lined Shanghai neighbourhood with shops and people talking" width="1536" height="1024" fetchpriority="high" decoding="async"><figcaption>Shanghai street life · illustration</figcaption></figure><span class="note-label">Start here</span><h2>Thinking about<br>teaching in China?</h2><p>Work out what you want from the classroom, the job and the move.</p><a href="teach-english-shanghai.html">Read the Shanghai guide <span aria-hidden="true">↗</span></a><div class="note-bottom"><span>20 guides</span><span>4 collections</span></div></aside></div></section><svg class="guide-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 55 C240 0 480 78 760 35 S1210 5 1440 50 L1440 92 L0 92 Z"/></svg>
<section class="shell quick-paths" aria-label="Popular starting points"><a href="china-first-month-budget.html"><span>Plan the money</span><strong>What do I need before payday? ↗</strong></a><a href="teaching-without-mandarin.html"><span>Find your feet</span><strong>Do I need to speak Mandarin? ↗</strong></a><a href="small-class-english-games.html"><span>Try an idea</span><strong>Five games for small classes ↗</strong></a></section>
<div class="shell library" id="library"><div class="library-heading"><div><p class="eyebrow">Browse the fieldnotes</p><h2>What are you wondering?</h2></div><p id="result-count" aria-live="polite">20 guides to explore</p></div>
<div id="library-controls" hidden><label class="search-label" for="guide-search">Search questions and topics</label><div class="search-box"><input id="guide-search" type="search" placeholder="Try salary, Mandarin, rent or lesson games…" autocomplete="off"><button type="button" id="clear-search">Clear</button></div><div class="filters" role="group" aria-label="Filter guides"><button type="button" data-filter="all" aria-pressed="true">All guides</button>$filterButtons</div></div>
<p class="empty-state" id="empty-state" hidden>No matching guides. Try a shorter question, or choose All guides.</p>
$sections</div>
<section class="closing-note shell"><div><p class="eyebrow">From Flying English Center</p><h2>A school in Shanghai.<br>A useful place to begin.</h2></div><p>These guides are for anyone exploring teaching and life in China. If you are curious about Flying English, <a href="../story.html">meet the school</a> or <a href="../jobs.html">explore the teaching role</a>.</p></section>
</main>$(Footer)</body></html>
"@
Set-Content -LiteralPath (Join-Path $outputDir 'index.html') -Value $index -Encoding utf8
$locs = @("$baseUrl/guides/") + @($articles | ForEach-Object {"$baseUrl/guides/$($_.slug).html"})
$xml = '<?xml version="1.0" encoding="UTF-8"?>' + "`n" + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n" + (($locs | ForEach-Object {"  <url><loc>$_</loc></url>"}) -join "`n") + "`n</urlset>"
Set-Content -LiteralPath (Join-Path $outputDir 'sitemap.xml') -Value $xml -Encoding utf8
$articles | Select-Object slug,title,category,minutes | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $outputDir 'catalog.json') -Encoding utf8
Write-Output "Built $($articles.Count) guide articles and index in $outputDir"

