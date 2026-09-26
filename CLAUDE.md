# Portfolio site: project notes

Personal portfolio for Carrie Markusen, live at https://carriemarkusen.net. It's a hand-coded wireframe that Carrie designs on top of, one build at a time.

## Constraints

- Plain HTML, CSS and one small `script.js` (added in Build 4). No framework, no build step.
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
index.html      home: boot screen, then "readme" window (thoughts, whoami, project listing, covers)
project-1.html  \
project-2.html   } title, info.txt facts, cover image, readme paragraph, image gallery, prev/next
project-3.html  /
resume.html     "exploration / in progress", email, experience log, resumé link
styles.css      all styles
script.js       boot screen, command line, clock
images/placeholder.svg   flat #111111 box used for every placeholder image
favicon.svg     green :) on black
CNAME  .nojekyll  .gitignore
z_carrie/       old portfolio source (2020 site), local only, gitignored
```

## Page structure (Build 4: "carrie's brain", a terminal)

Every page: skip link, then `<div class="screen">` holding three shared parts:
- `<header class="sidebar">`: a `:)` label in Regular weight, with the same space above it as below the name block at the bottom, then a file tree (`~/carries-brain`, `projects/` with `project-1/` to `project-3/`, `resume.txt`). Tree lines are drawn in CSS. The current page link has `aria-current="page"`.
- `<main id="main" class="window">`: a `.titlebar` with a fake path, then `.window-body` made of sections. Each section is a fake command (`<p class="cmd">`, CSS adds `> `) and its `.output`. One `<h1>` per page, styled `.display`.
- `<footer class="statusbar">`: command line form (prompt `carrie@brain ~>`; JetBrains Mono ligatures merge `~>` into one squiggly arrow, which Carrie wants), reply line, uptime and clock.

The sidebar and status bar are **copied into every page**, with a comment above each, and must stay identical (apart from `aria-current`).

Home page only: a `<script>` in `<head>` adds `booting` to `<html>` on the first visit of a browser session (sessionStorage key `booted`). That shows `.boot`: it types "welcome to carrie's brain", then shows "> enter password:" with a plain text field (typed characters are shown, not masked). The password is `:)` (the `password` constant in `script.js`); a wrong one prints "access denied. try again." and clears the field. The right one prints "access granted.", a boot log (technical, with a touch of fantasy; no jokes), then reveals the site with a power-on animation. Clicking anywhere on the boot screen just refocuses the field. The password is cosmetic: it's readable in the page source, the other pages can be opened directly, and the repo is public. Carrie knows and chose this over taking the site offline. Later visits to home skip it; the `reboot` command replays it.

Carrie's Mac has Reduce motion on. Typing and the cursor blink run for everyone regardless; only the power-on animation is skipped under `prefers-reduced-motion`.

Command line (`script.js`): help, ls, cd/open/cat <place>, whoami, pwd, date, clear, reboot, sudo, exit. Places are listed in the `places` array. `/` focuses the command line; up/down arrows recall history.

Images: `<figure class="shot">` with an `<img>` and a `<figcaption>` (file name, size). Swap `images/placeholder.svg` for real files.

## CSS

Settings live at the top of `styles.css`:
- **Colors (only these three):** `--black: #000000` background, `--white: #fcfcfc` commands and secondary text, `--green: #03f900` main text, borders, hover. Green rules use `--rule: 0.5px` (a hairline on Retina). `--placeholder: #111111` is only for placeholder images (one tint lighter than black). `--gray: #a8a8a8` is for data text only: currently just the title bar path, chosen to match how the white `[ read only ]` and uptime look once the corner vignette darkens them. No other colors, per Carrie. The green text glow and black scanline overlay are effects, not new colors.
- **Font:** JetBrains Mono, Thin (100) everywhere by default. Regular (400) is used for the sidebar `:)` and the name block at the bottom of the sidebar. The Google Fonts `<link>` is in every page's `<head>`.
- **Type:** `--display-size` for page `<h1>`s, `--h2-size: 1.25rem` for the tree root, `--body-size: 0.875rem` for everything else.
- **Links:** no underline. Hover and keyboard focus invert them (green background, black text). Gallery thumbnails instead get a white frame.
- **CRT effect:** `body::after` draws scanlines and a vignette over everything, with `pointer-events: none`.
- **Layout:** one breakpoint at `50em`. Below: tree, window and status bar stack, status bar sticks to the bottom. From 50em: the screen is exactly one viewport tall, tree on the left at 30%, window on the right scrolls on its own, status bar across the bottom.
- **All visible text is lowercase,** written that way in the HTML.

## Build history

- **Build 1:** Carrie's 2017 portfolio rebuilt as clean code, using placeholders.
- **Build 2:** a neutral wireframe with separate HTML pages, one breakpoint, and a hover-to-reveal menu.
- **Build 3:** the hover was removed and the sidebar became name / projects / `:)`. The contact page was renamed `resume.html`. All text went lowercase, letter spacing to 0, and link hover to italic. New colors: black sidebar, off-black pages, green accent. A code cleanup came last.
- **Build 4:** "carrie's brain". The site became a terminal: boot screen with typed welcome and a password prompt (`:)`), file-tree sidebar, command windows, status bar with a working command line and clock, CRT scanlines, placeholder images, favicon (a green `:)` on black). Added `script.js`. Black, white and green only; JetBrains Mono Thin throughout.

## Open items (deferred by Carrie)

1. **Enforce HTTPS:** `http://` doesn't forward to `https://`. Fix it in the GitHub repo's Settings, then Pages, by ticking "Enforce HTTPS". This is a settings change, not code.
2. **The "resumé" link on `resume.html` is `href="#"`.** Link it to a PDF once one exists, or make it plain text.
3. **No custom `404.html`.** If one is added, its links must start with `/` (for example `/styles.css`), because GitHub serves it at whatever address was mistyped.
4. **No `<meta name="description">` on pages.** Add these once there's real content.

## Checking changes

The way used so far:
- Parse every page to confirm tags close properly, there's one `<h1>`, relative links point to existing files, and exactly one `aria-current` link matches the file.
- Confirm the sidebar and status bar blocks are identical across pages once `aria-current` is ignored.
- To screenshot the site past the boot screen, use a temporary copy of `index.html` without the `booting` script, or dispatch a `keydown` Enter event.
- Take screenshots with headless Chrome. Load the pages inside `<iframe>`s at 1440x900 and 390x844, because headless Chrome won't render narrower than about 500px on its own.

Git pushes use HTTPS with a token saved in the macOS Keychain. Commits in this repo use the GitHub noreply email address, set in this repository's git config.
