#!/usr/bin/env node
// Generates the static, crawlable parts of the site from the data in index.html:
//   - /<id>/index.html, one page per PROJECTS/RESEARCH item
//   - the plain-HTML fallback inside #projects and #researchGrid
//   - mainsitemap.xml
// Run `node build.js` after editing the arrays in index.html.
const fs = require('fs');
const path = require('path');

const SITE = 'https://advaynathany.github.io';
const root = __dirname;
const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');

const src = index.slice(index.indexOf('const ART = {'), index.indexOf('const ALL ='));
const { ART, PROJECTS, RESEARCH } = new Function(src + ';return {ART,PROJECTS,RESEARCH}')();
const css = index.slice(index.indexOf('<style>') + 7, index.indexOf('</style>'));
const fonts = index.match(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/)[0];
const today = new Date().toISOString().slice(0, 10);

const strip = s => s.replace(/<[^>]+>/g, '');
const attr = s => strip(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const art = p => ART[p.art || (p.id === 'basin-ledger' ? 'basin' : p.id)] || '';
const person = { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Advay Nathany', url: `${SITE}/` };

function schema(p, url) {
  const desc = strip(p.line);
  let item;
  if (p.id === 'aristotle') {
    item = { '@type': 'SoftwareApplication', name: p.title, operatingSystem: 'macOS', applicationCategory: 'ProductivityApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
  } else if (p.id === 'urban-heat') {
    item = { '@type': 'ScholarlyArticle', headline: 'Decoding and Mitigating the Urban Heat Island Effect in Kolkata: A Two-Decade Geospatial and Remote Sensing Analysis',
      datePublished: '2026', isPartOf: { '@type': 'Periodical', name: 'International Journal of Science and Research' } };
  } else {
    item = { '@type': 'CreativeWork', name: p.title };
  }
  Object.assign(item, { description: desc, url, author: person, keywords: p.tags.join(', ') });
  if (p.links.length) item.sameAs = p.links.map(l => l[1]);
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': url, url, name: `${p.title} · Advay Nathany`, description: desc, dateModified: today,
      isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#person` }, mainEntity: item },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Advay Nathany', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: p.title, item: url }] }
  ] };
}

function page(p, group, kind) {
  const gi = group.indexOf(p);
  const prev = group[(gi - 1 + group.length) % group.length], next = group[(gi + 1) % group.length];
  const url = `${SITE}/${p.id}/`;
  const title = `${strip(p.title)} · Advay Nathany`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${attr(title)}</title>
<meta name="description" content="${attr(p.line)}">
<meta name="author" content="Advay Nathany">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#fbfbf9">
<meta property="og:site_name" content="Advay Nathany">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(p.line)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/advay.jpg">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-96.png" sizes="96x96" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<script type="application/ld+json">
${JSON.stringify(schema(p, url))}
</script>
<script>try{const t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<style>${css}
.sheet.page{position:static;width:auto;max-width:680px;margin:0 auto;border:0;overflow:visible;animation:none;padding:24px 20px 72px}
.sheet.page h2.h4{font-size:.72rem;font-weight:500;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);margin:28px 0 10px}
.sheet.page .nextprev a{display:block;color:var(--ink-2);font-size:.88rem}
.sheet.page .nextprev a:last-child{text-align:right}
.sheet.page .nextprev a:hover{color:var(--ink)}
.sheet.page .bar a{color:var(--ink-2)}
.sheet.page .bar a:hover{color:var(--ink)}
</style>
</head>
<body>
<nav class="top scrolled">
  <div class="wrap">
    <a href="/" class="brand">Advay Nathany</a>
    <div class="navlinks"><a href="/#work">Work</a><a href="/#research">Research</a><a href="/#about">About</a><a href="/#contact">Contact</a></div>
    <div class="navtools"><button class="iconbtn" id="theme" aria-label="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg></button></div>
  </div>
</nav>
<main>
<article class="sheet page">
  <div class="bar"><a class="mono" href="/#${kind}">← ${kind === 'work' ? 'All projects' : 'All research'}</a><span class="mono">${kind === 'work' ? 'Project' : 'Research'} · ${p.year}</span></div>
  <div class="art" aria-hidden="true">${art(p)}</div>
  ${p.status[1] ? `<span class="badge ${p.status[0]}">${p.status[1]}</span>` : ''}
  <h1 style="margin-top:10px;font-family:var(--serif);font-weight:400;font-size:2.4rem;line-height:1.1;letter-spacing:-.015em">${p.title}</h1>
  <div class="role">${p.role} · by <a href="/" style="border-bottom:1px solid var(--line-2)">Advay Nathany</a></div>
  <div class="body">${p.body.map(b => `<p>${b}</p>`).join('')}</div>
  ${p.stats ? `<h2 class="h4">By the numbers</h2><div class="kv">${p.stats.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('')}</div>` : ''}
  ${p.points && p.points.length ? `<h2 class="h4">Details</h2><ul class="pts">${p.points.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
  ${p.links.length ? `<div class="links">${p.links.map(([t, u, pri]) => `<a class="btn${pri ? ' primary' : ''}" href="${u}" target="_blank" rel="noopener">${t} ↗</a>`).join('')}</div>` : ''}
  <div class="tags" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:22px">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
  <div class="nextprev"><a href="/${prev.id}/"><small>← Previous</small>${prev.title}</a><a href="/${next.id}/"><small>Next →</small>${next.title}</a></div>
</article>
</main>
<script>
document.getElementById('theme').addEventListener('click',()=>{const r=document.documentElement,d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'light':'dark';try{localStorage.setItem('theme',r.dataset.theme)}catch(e){}});
</script>
</body>
</html>
`;
}

for (const [group, kind] of [[PROJECTS, 'work'], [RESEARCH, 'research']]) {
  for (const p of group) {
    fs.mkdirSync(path.join(root, p.id), { recursive: true });
    fs.writeFileSync(path.join(root, p.id, 'index.html'), page(p, group, kind));
  }
}

const fallback = arr => arr.map(p => `<article><h3><a href="/${p.id}/">${p.title}</a></h3><p>${p.line}</p></article>`).join('');
for (const [id, arr] of [['projects', PROJECTS], ['researchGrid', RESEARCH]]) {
  const re = new RegExp(`(<div class="grid" id="${id}">)[\\s\\S]*?(</div>)`);
  if (!re.test(index)) throw new Error(`#${id} not found in index.html`);
  index = index.replace(re, `$1${fallback(arr)}$2`);
}
fs.writeFileSync(indexPath, index);

const urls = [{ loc: `${SITE}/`, image: `${SITE}/assets/advay.jpg` }, ...[...PROJECTS, ...RESEARCH].map(p => ({ loc: `${SITE}/${p.id}/` }))];
fs.writeFileSync(path.join(root, 'mainsitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>${u.image ? `\n    <image:image><image:loc>${u.image}</image:loc></image:image>` : ''}
  </url>`).join('\n')}
</urlset>
`);

console.log(`Built ${PROJECTS.length + RESEARCH.length} pages, homepage fallback and sitemap.`);
