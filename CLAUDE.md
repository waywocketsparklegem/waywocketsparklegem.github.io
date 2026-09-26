# Portfolio site: project notes

Personal portfolio for Carrie Markusen, live at https://carriemarkusen.net. It's a hand-coded wireframe that Carrie designs on top of, one build at a time.

## Constraints

- Plain HTML and CSS only. No framework, no build step, no JavaScript so far.
- Hosted on GitHub Pages from the `main` branch, root folder. Repo: `waywocketsparklegem/waywocketsparklegem.github.io` (public).
- `CNAME` holds `carriemarkusen.net`. `.nojekyll` is empty and turns off Jekyll.
- Files are edited by hand, so keep the code simple and readable, and keep links relative (`styles.css`, `project-1.html`) so pages work when opened locally and on the live site.

## Working with Carrie

- Carrie is a graphic and web designer. She knows basic HTML and CSS but is new to git and the terminal. Explain each command before running it.
- For a new build: plan first, show the plan, and wait for approval before writing files.
- Don't commit until Carrie has seen it working locally. Don't push unless asked.
- Don't give visual design advice (colors, contrast, sizing, type). Make the requested visual change and report what was done. Code and technical issues are fine to raise.
- No emojis anywhere, including commit messages.
- Each build is one commit named "Build N: ...". Earlier builds are the restore points.

## Files

```
index.html      home: large H1 "what / will / this be"
project-1.html  \
project-2.html   } title, one gray placeholder box, one placeholder paragraph
project-3.html  /
resume.html     "exploration / in progress", email, "resumé" link
styles.css      all styles
CNAME  .nojekyll  .gitignore
z_carrie/       old portfolio source (2020 site), local only, gitignored
```

## Page structure

Every page has the same skeleton: a skip link, the shared `<header class="sidebar">` with `<nav class="menu">`, then `<main id="main">` with one `<h1>`.

The sidebar block is **copied into every page**, with a comment above it. It's identical everywhere except that the link to the current page has `aria-current="page"`. Adding, removing or renaming a page means updating the sidebar in every `.html` file.

Sidebar contents, top to bottom:
- `carrie markusen`: link to `index.html`
- `project 1`, `project 2`, `project 3`: `<ul class="project-list">`
- `:)`: link to `resume.html`, with hidden text ` resume` inside it for screen readers

The sidebar items are links, not heading tags. Project page titles are `<h1 class="page-title">`. The resume page's `<h1>` is visually hidden.

## CSS

Settings live at the top of `styles.css`:
- **Colors:**
  - `--black: #011e15`: text on white pages
  - `--pure-black: #000000`: sidebar background
  - `--off-black: #111111`: home and resume page backgrounds
  - `--green: #03f900`: hover, current page, resume email
  - `--white: #fcfcfc`: sidebar text and home/resume text
  - `--gray: #ececec`: placeholders
- **Font:** JetBrains Mono from Google Fonts, in weights 100 and 400, each upright and italic. The same `<link>` is in every page's `<head>`.
- **Type styles:**
  - **H1:** the homepage title, Thin, large.
  - **H2:** the sidebar and project titles, `--h2-size: 1.25rem`, Regular. Project links in the sidebar are Thin.
  - **Body:** everything else, `--body-size: 0.8125rem`, Thin.
  - Letter spacing is 0 for both H2 and Body (`--h2-tracking`, `--body-tracking`).
- **Links:** no underline. Hover and keyboard focus make them green and italic, and the current page is green. On the resume page, links keep their color and only go italic on hover.
- **Layout:** one breakpoint at `50em`.
  - **Below 50em:** a single stacked column, with the sidebar on top and the content below.
  - **50em and up:** the sidebar is fixed on the left at 30% width, with its rows arranged as name / centered project list / `:)`. `main` sits to its right.
- The desktop homepage is exactly one screen tall.
- **All visible text is lowercase,** written that way in the HTML (not with `text-transform`).

## Build history

- **Build 1:** Carrie's 2017 portfolio rebuilt as clean code, using placeholders.
- **Build 2:** a neutral wireframe with separate HTML pages, one breakpoint, and a hover-to-reveal menu.
- **Build 3:** the hover was removed and the sidebar became name / projects / `:)`. The contact page was renamed `resume.html`. All text went lowercase, letter spacing to 0, and link hover to italic. New colors: black sidebar, off-black pages, green accent. A code cleanup came last.

## Open items (deferred by Carrie)

1. **Enforce HTTPS:** `http://` doesn't forward to `https://`. Fix it in the GitHub repo's Settings, then Pages, by ticking "Enforce HTTPS". This is a settings change, not code.
2. **The "resumé" link on `resume.html` is `href="#"`.** Link it to a PDF once one exists, or make it plain text.
3. **No favicon,** so every visit gets a harmless "not found" error for `/favicon.ico`.
4. **No custom `404.html`.** If one is added, its links must start with `/` (for example `/styles.css`), because GitHub serves it at whatever address was mistyped.
5. **No `<meta name="description">` on pages.** Add these once there's real content.

## Checking changes

The way used so far:
- Parse every page to confirm tags close properly, there's one `<h1>`, relative links point to existing files, and exactly one `aria-current` link matches the file.
- Confirm the sidebar block is identical across pages once `aria-current` is ignored.
- Take screenshots with headless Chrome. Load the pages inside `<iframe>`s at 1440x900 and 390x844, because headless Chrome won't render narrower than about 500px on its own.

Git pushes use HTTPS with a token saved in the macOS Keychain. Commits in this repo use the GitHub noreply email address, set in this repository's git config.
