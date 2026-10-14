# advaynathany.github.io

Personal website of Advay Nathany: [advaynathany.github.io](https://advaynathany.github.io/).

A single static page (`index.html`) with inline CSS/JS and no build step. Images live in `assets/`.

Projects and research are data: edit the `PROJECTS` and `RESEARCH` arrays in the script at the bottom
of `index.html`, and the cards, detail panels, filters and ⌘K search update from them. Each card's
drawing is an inline SVG in `ART`, keyed by the item's `id` (or its `art` field). Detail panels are
deep-linked as `#work/<id>` and `#research/<id>`.
