# advaynathany.github.io

Personal website of Advay Nathany: [advaynathany.github.io](https://advaynathany.github.io/).

A single static page (`index.html`) with inline CSS/JS and no build step. Images live in `assets/`.

Projects and research are data: edit the `PROJECTS` and `RESEARCH` arrays in the script at the bottom
of `index.html`, and the cards, detail panels, filters and ⌘K search update from them. Each card's
drawing is an inline SVG in `ART`, keyed by the item's `id` (or its `art` field). Detail panels are
deep-linked as `#work/<id>` and `#research/<id>`.

## Search

After editing `PROJECTS` or `RESEARCH`, run `node build.js`. It regenerates a static page per item at
`/<id>/` (what search engines index and what the panel's share button links to), the plain-HTML fallback
inside `#projects`/`#researchGrid` for crawlers that don't run JS, and `mainsitemap.xml`. Don't hand-edit
those outputs.

`<head>` in `index.html` carries the meta/Open Graph tags and a JSON-LD `@graph` (Person, ProfilePage,
WebSite, Aristotle, the UHI paper); update it by hand when roles or links change. `robots.txt` points at
the sitemap; `nope.html` is `noindex`.
