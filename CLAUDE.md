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
- Carrie says when a new build starts. Until she does, commits (when she asks for them) are part of the current build; never number or start a new build on your own. Earlier builds are the restore points.

## Files

```
index.html      home ("home terminal"): boot screen, then the dream (dream.js) filling the window
portfolio.html  the old home content: thoughts, whoami, portfolio listing, tip
project-1.html  \
project-2.html   } title, info.txt facts, cover image, readme paragraph, image gallery, prev/next
project-3.html  /
resume.html     "exploration / in progress", email, experience log, resumé link
dream.html      hidden page (the `dream` command): the same dream full screen, status bar only
styles.css      all styles
script.js       boot screen, command line, clock
dream.js        the WebGL2 dream simulation, used by index.html and dream.html (settings at the top)
sky.js          sky mode's clouds (the `sky` command), loaded on every page (settings at the top)
images/placeholder.svg   flat #111111 box used for every placeholder image
favicon.svg     green :) on black
CNAME  .nojekyll  .gitignore
z_carrie/       old portfolio source (2020 site), local only, gitignored
```

## Page structure (Build 4: "carrie's brain", a terminal)

Every page: skip link, then `<div class="screen">` holding three shared parts:
- `<header class="sidebar">`: a `:)` label in Regular weight, with the same space above it as below the name block at the bottom, then a file tree (`~/carries-brain`, an empty `sketchbook/` (plain text, no page yet), `portfolio/` (links to `portfolio.html`) with `project-1/` to `project-3/`, `resume.txt`). Tree lines are drawn in CSS. The current page link has `aria-current="page"`.
- `<main id="main" class="window">`: a `.titlebar` with a fake path, then `.window-body` made of sections. Each section is a fake command (`<p class="cmd">`, CSS adds `> `) and its `.output`. One `<h1>` per page, styled `.display`.
- `<footer class="statusbar">`: command line form (prompt `carrie@brain ~>`; JetBrains Mono ligatures merge `~>` into one squiggly arrow, which Carrie wants), reply line, uptime and clock.

The home page's window holds the dream instead of sections: its `<h1>` is the title bar path (`~/carries-brain/dream.exe`), and a `.home-dream` box holds the canvas (at least 70vh tall on small screens). The dream waits while the boot screen shows, so it starts growing as the site appears. `dream.html` is the exception to the shared frame: no sidebar and no window body, just a canvas with a floating title bar (its `<h1>` is the path) and the shared status bar. It isn't in the sidebar tree or `ls`; `dream` or `cd dream` opens it. `dream.js` runs a Gray-Scott reaction-diffusion simulation on the graphics card, seeded with a big `:)`; dragging seeds new growth; the feed and kill rates drift slightly across the screen and over time (kept narrow: wider drift turns areas solid or spotty). A window resize restarts it. Needs WebGL2 with float render targets; otherwise the title bar says so. To screenshot it, run frames synchronously in a test copy (headless Chrome needs `--use-angle=swiftshader --enable-unsafe-swiftshader` and is slow: about 1,100 frames, 18 seconds of real time, takes a few minutes).

The sidebar and status bar are **copied into every page**, with a comment above each, and must stay identical (apart from `aria-current`).

Home page only: a `<script>` in `<head>` adds `booting` to `<html>` on the first visit of a browser session (sessionStorage key `booted`). That shows `.boot`: it types "welcome to carrie's brain", then shows "> enter password:" with a plain text field (typed characters are shown, not masked). The password is `:)` (the `password` constant in `script.js`); a wrong one prints "access denied. try again." and clears the field. The right one prints "access granted.", a boot log (technical, with a touch of fantasy; no jokes), then reveals the site with a power-on animation. Clicking anywhere on the boot screen just refocuses the field. The password is cosmetic: it's readable in the page source, the other pages can be opened directly, and the repo is public. Carrie knows and chose this over taking the site offline. Later visits to home skip it; the `reboot` command replays it.

Carrie's Mac has Reduce motion on. Typing and the cursor blink run for everyone regardless; only the power-on animation is skipped under `prefers-reduced-motion`.

Command line (`script.js`): help, ls, cd/open/cat <place> (a bare `cd` goes home), whoami, pwd, date, clear, reboot, sudo, exit, dream, sky / sunset / daytime / normal (sky mode, below), cowsay <words> (the classic cow in a speech bubble; lines wrap at 30 characters so it fits on a phone; no words: "moo."; afterwards the hint says "type so cute", and `so cute` replaces the cow with just `:)`). A command can set `nextHint` to suggest what to type next; otherwise the hint is "type help", or "type too silly" in silly mode. `silly` turns on silly mode (class `silly` on `<html>`): Wingdings everywhere except the command line and its reply, a rainbow gradient background sliding slowly right to left, text and lines in one color that cycles every 8 seconds (set on `body` and inherited), placeholder images replaced by one color slowly cycling through the rainbow, the dream see-through with its folds in a rainbow gradient that cycles every 8 seconds (`dream.js` checks the `silly` class every frame), and no terminal effects (no glow, scanlines or vignette); the hint changes to "type too silly", and `too silly` turns it off. It isn't saved, so changing page also ends it. Styles are at the end of `styles.css`. `sky` turns on sky mode (class `sky` on `<html>`): `sky.js` puts one fixed canvas behind everything that paints the sky and clouds across the whole screen (body, title bar and status bar go see-through). The window's content is hidden (the dream is paused), the only line left is the status bar's top rule (sidebar edge, title bar underline and tree branches are removed), the CRT scanlines and vignette are off, `--green` and `--glow` become bright red-orange (`#ff4500`), and on home and `dream.html` the title bar's `dream.exe` path and drag hint are hidden. The hint is "type sunset"; `sunset` fades to the sunset colors over 4 seconds (class `sunset`) and the hint becomes "type daytime"; `daytime` fades back. `normal` ends sky mode. Like silly mode it isn't saved. The clouds come from Carrie's cloud simulator (`~/Documents/claude-repo/web-experiments/cloud-simulator.html`); she tuned the motion and colors by eye, so change them only when asked. Places are listed in the `places` array. `/` focuses the command line; up/down arrows recall history. If the command line had focus when a page was left (a reload, or a command like `cd`), the next page focuses it again (sessionStorage key `cli-focus`), except while the boot screen shows.

Images: `<figure class="shot">` with an `<img>` and a `<figcaption>` (file name, size). Swap `images/placeholder.svg` for real files.

## CSS

Settings live at the top of `styles.css`:
- **Colors (black, white and green, plus gray for data text):** `--black: #000000` background, `--white: #fcfcfc` commands and secondary text, `--green: #03f900` main text, borders, hover. Green rules use `--rule: 0.5px` (a hairline on Retina). `--placeholder: #111111` is only for placeholder images (one tint lighter than black). `--gray: #a8a8a8` is for data text only: currently just the title bar path, chosen to match how the white `[ read only ]` and uptime look once the corner vignette darkens them. No other colors, per Carrie. The green text glow and black scanline overlay are effects, not new colors.
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
- **Build 4:** "carrie's brain". The site became a terminal: boot screen with typed welcome and a password prompt (`:)`), file-tree sidebar, command windows, status bar with a working command line and clock, CRT scanlines, placeholder images, favicon (a green `:)` on black). Added `script.js`. Black, white and green, plus gray for data text; JetBrains Mono Thin throughout. Pushed live as one commit (`c7a7838`).

## Where things stand (2026-09-26)

- Build 4 is live at carriemarkusen.net and is the current build. Carrie will say when Build 5 starts.
- A wrap-up fix pass is committed and pushed as part of Build 4: password prompt can't be tabbed to or submitted before it appears, no focus outline around the window after login, bare `cd` goes home, unused `.dim` and `.visually-hidden` styles removed.
- GitHub's Pages "DNS check" showed "in progress" after launch. DNS at Porkbun was verified correct (four GitHub A records, `www` CNAME to `waywocketsparklegem.github.io`) and the site loads. If the check is still stuck, remove and re-add the custom domain in Settings > Pages, then confirm `CNAME` is still in the repo.
- Carrie was offered real privacy (verify the domain, make the repo private, take Pages offline) and chose the cosmetic password instead. Don't re-suggest unless she asks.

## Open items (deferred by Carrie)

1. **Enforce HTTPS:** `http://` doesn't forward to `https://`. Fix it in the GitHub repo's Settings, then Pages, by ticking "Enforce HTTPS". This is a settings change, not code.
2. **The "resumé" link on `resume.html` is `href="#"`.** Link it to a PDF once one exists, or make it plain text.
3. **No custom `404.html`.** If one is added, its links must start with `/` (for example `/styles.css`), because GitHub serves it at whatever address was mistyped.
4. **No `<meta name="description">` on pages.** Add these once there's real content.
5. **iPhone zoom on the command line:** its text is 0.75rem (12px). iOS Safari zooms the page in when a field under 16px is focused, so tapping the command line on an iPhone zooms in. The boot password field (1.25rem) is fine. Fixing it means a 16px field on phones, which is a visual change for Carrie to decide.
6. **Enforce HTTPS may stay greyed out** in Settings > Pages until the DNS check passes.

## Checking changes

The way used so far:
- Parse every page to confirm tags close properly, there's one `<h1>`, relative links point to existing files, and exactly one `aria-current` link matches the file.
- Confirm the sidebar and status bar blocks are identical across pages once `aria-current` is ignored.
- To screenshot the site past the boot screen, use a temporary copy of `index.html` without the `booting` script. To test the boot flow, set `#boot-password` to `:)` and call `requestSubmit()` on `#boot-login`, then read the result with `--dump-dom`.
- Headless Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Since 2026-09-26 it hangs unless it gets `--no-sandbox` (Chrome's own sandbox) and runs outside Claude Code's sandbox. Use `.claude/chrome.sh` (by its absolute path), which adds the working flags; `.claude/settings.local.json` lets it run without a prompt and outside the sandbox. Both are local only (`.claude/` is listed in `.git/info/exclude`). Chrome also never exits after a screenshot, so wait for the file to appear, then kill it. Don't use `--virtual-time-budget`: the clock's timer keeps it running forever. To run a command in a test copy, wait for `load` first: `script.js` is `defer`red, so an earlier `requestSubmit()` does a real form submit and reloads the page endlessly. Not installed on this Mac: `node`, `gh` (GitHub CLI), Python `PIL` and `fontTools`. GitHub settings changes are done by Carrie in the browser.
- Check with Carrie's display in mind: a Retina 5K screen with Reduce motion turned on.
- Take screenshots with headless Chrome. Load the pages inside `<iframe>`s at 1440x900 and 390x844, because headless Chrome won't render narrower than about 500px on its own.

Git pushes use HTTPS with a token saved in the macOS Keychain. Commits in this repo use the GitHub noreply email address, set in this repository's git config.
