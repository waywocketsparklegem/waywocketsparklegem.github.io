/*
  Carrie's brain: the moving parts.
  1. Boot screen (home page only): types the welcome line, asks for the password, prints a boot log, then shows the site.
  2. Command line in the status bar: type help, ls, cd project-2, open resume, and so on.
  3. Clock and uptime in the status bar.
*/

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- 1. Boot screen ---------- */

// The password typed at the boot screen. This is for show: anyone can read it here in the page source.
const password = ":)";

// Lines printed after Enter. Edit freely.
const bootLog = [
  "[ ok ] power-on self test passed",
  "[ ok ] loading cortex kernel v4.0.26",
  "[ ok ] mounting /dev/imagination",
  "[ ok ] synapse bus online ......... 86,000,000,000 nodes",
  "[ ok ] loading palette ............ 16,777,216 colors",
  "[ ok ] indexing ~/portfolio ....... 3 found",
  "[ ok ] warming dream cache",
  "[ ok ] aligning memory to the northern stars",
  "",
  "system ready.",
];

async function runBoot() {
  const root = document.documentElement;
  const boot = document.getElementById("boot");
  if (!boot || !root.classList.contains("booting")) return;

  const text = document.getElementById("boot-text");
  const login = document.getElementById("boot-login");
  const input = document.getElementById("boot-password");
  const message = document.getElementById("boot-message");
  const log = document.getElementById("boot-log");
  const cursor = document.getElementById("boot-cursor");

  // Type the welcome line one character at a time, with a little human unevenness.
  await wait(700);
  for (const char of text.dataset.text) {
    text.textContent += char;
    await wait(40 + Math.random() * 40);
  }
  await wait(400);

  // Show the password prompt and move the cursor down to it.
  login.classList.add("is-visible");
  login.appendChild(cursor);
  input.focus({ preventScroll: true });

  // Clicking or tapping anywhere puts the typing back in the password field.
  boot.addEventListener("click", () => input.focus({ preventScroll: true }));

  // Keep the field as wide as what's been typed, so the cursor sits right after it.
  const fitInput = () => { input.style.width = `${input.value.length}ch`; };
  input.addEventListener("input", fitInput);
  fitInput();

  // Wait for the right password. A wrong one clears the field and asks again.
  await new Promise((resolve) => {
    login.addEventListener("submit", (event) => {
      event.preventDefault();
      if (input.value === password) {
        resolve();
      } else {
        message.textContent = "access denied. try again.";
        input.value = "";
        fitInput();
      }
    });
  });

  // Print the boot log.
  cursor.remove();
  input.disabled = true;
  message.textContent = "access granted.";
  for (const line of bootLog) {
    const row = document.createElement("div");
    row.textContent = line || " ";
    log.appendChild(row);
    await wait(90 + Math.random() * 160);
  }
  await wait(500);

  // Hide the boot screen and switch the desktop on.
  try { sessionStorage.setItem("booted", "1"); } catch (e) {}
  const screen = document.getElementById("screen");
  root.classList.remove("booting");
  screen.classList.add("powering-on");
  screen.addEventListener("animationend", () => screen.classList.remove("powering-on"), { once: true });
  document.getElementById("main").focus({ preventScroll: true });
}

/* ---------- 2. Command line ---------- */

// Places you can go. The first name is the one shown by `ls`.
const places = [
  { names: ["project-1", "project1", "p1", "1"], url: "project-1.html" },
  { names: ["project-2", "project2", "p2", "2"], url: "project-2.html" },
  { names: ["project-3", "project3", "p3", "3"], url: "project-3.html" },
  { names: ["resume.txt", "resume", "cv", "about"], url: "resume.html" },
  { names: ["portfolio", "work"], url: "portfolio.html" },
  { names: ["~", "home", "..", "/", "carries-brain"], url: "index.html" },
  { names: ["dream.exe", "dream"], url: "dream.html" },
];

function findPlace(name) {
  const clean = (name || "").toLowerCase().replace(/\/$/, "").replace(/^portfolio\//, "");
  return places.find((place) => place.names.includes(clean));
}

function goTo(name) {
  const place = findPlace(name);
  if (!place) return `no such file or directory: ${name || "(nothing)"}`;
  window.location.href = place.url;
  return `opening ${place.names[0]} ...`;
}

const commands = {
  help: () =>
    "commands: ls, cd <place>, open <place>, whoami, pwd, date, clear, reboot, silly, holo, cowsay <words>, dream, sky\n" +
    "places:   portfolio, project-1, project-2, project-3, resume, home",
  ls: () => "sketchbook/  portfolio/  resume.txt",
  cd: (name) => goTo(name || "~"),
  dream: () => goTo("dream"),
  open: goTo,
  cat: goTo,
  whoami: () => "carrie markusen. physical + digital designer.",
  pwd: () => document.querySelector(".titlebar-path").textContent,
  date: () => new Date().toString().toLowerCase(),
  clear: () => "",
  reboot: () => {
    try { sessionStorage.removeItem("booted"); } catch (e) {}
    window.location.href = "index.html";
    return "rebooting ...";
  },
  sudo: () => "nice try.",
  exit: () => "there is no exit. only more ideas.",
  silly: () => setSilly(true),
  "too silly": () => setSilly(false),
  cowsay: (words) => {
    nextHint = "type so cute";
    return cowsay(words || "moo.");
  },
  "so cute": () => ":)",
  sky: () => setSky(true),
  sunset: () => setSunset(true),
  daytime: () => setSunset(false),
  holo: () => setHolo(true),
  normal: () => backToNormal(),
};

// A command can set this to suggest what to type next. Otherwise the hint goes back to "type help".
let nextHint = "";

// Silly mode: Wingdings and rainbows (styles at the end of styles.css). Lasts until "too silly" or the page changes.
function setSilly(on) {
  document.documentElement.classList.toggle("silly", on);
  return on ? cowsay("silly mode on.") : "back to normal.";
}

// Sky mode: the site's background becomes the sky and clouds fill the window (sky.js, styles at the end of
// styles.css). "sunset" and "daytime" switch colors; Esc ends it. Like silly mode, it lasts until the page changes.
function setSky() {
  const root = document.documentElement;
  if (!sky.start()) return "no sky here: this browser can't draw it.";
  root.classList.add("sky");
  return "sky mode on.";
}

function setSunset(on) {
  const root = document.documentElement;
  if (!root.classList.contains("sky")) {
    nextHint = "type sky";
    return "no sky yet. type sky first.";
  }
  sky.setSunset(on);
  root.classList.toggle("sunset", on);
  return on ? "sunset." : "daytime.";
}

// Holo mode: the whole site turns into holographic foil that catches the light as it tilts (styles at the end of
// styles.css). The mouse is the tilt; on phones, the phone's own tilt or a dragging finger. Esc ends it, and
// like silly mode it lasts until the page changes.
// holoTilt runs from -1 to 1 on each axis; dream.js reads it too, to light its folds.
const holoTilt = { x: 0, y: 0 };
const holoTarget = { x: 0, y: 0 };
let holoRunning = false;

function aimHolo(x, y) {
  holoTarget.x = Math.max(-1, Math.min(1, x));
  holoTarget.y = Math.max(-1, Math.min(1, y));
}

const holoPointer = (event) => aimHolo((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
// Phone tilt: leaning left and right, and forward and back from holding it at about 45 degrees.
const holoOrientation = (event) => {
  if (event.gamma === null) return;
  aimHolo(event.gamma / 30, (event.beta - 45) / 30);
};

// Each frame the tilt eases toward where it's aimed, so the light glides instead of jumping, and the
// styles read it as CSS variables: --tx and --ty (-1 to 1), --mx and --my (where the glare sits, in %).
function holoFrame() {
  if (!holoRunning) return;
  holoTilt.x += (holoTarget.x - holoTilt.x) * 0.12;
  holoTilt.y += (holoTarget.y - holoTilt.y) * 0.12;
  const style = document.documentElement.style;
  style.setProperty("--tx", holoTilt.x.toFixed(4));
  style.setProperty("--ty", holoTilt.y.toFixed(4));
  style.setProperty("--mx", `${(50 + holoTilt.x * 50).toFixed(2)}%`);
  style.setProperty("--my", `${(50 + holoTilt.y * 50).toFixed(2)}%`);
  requestAnimationFrame(holoFrame);
}

function setHolo(on) {
  const root = document.documentElement;
  root.classList.toggle("holo", on);
  if (on && !holoRunning) {
    holoRunning = true;
    window.addEventListener("pointermove", holoPointer);
    window.addEventListener("deviceorientation", holoOrientation);
    // iPhones only share their tilt after asking. Typing the command counts as a tap, so the question can show.
    if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
    requestAnimationFrame(holoFrame);
  } else if (!on) {
    holoRunning = false;
    window.removeEventListener("pointermove", holoPointer);
    window.removeEventListener("deviceorientation", holoOrientation);
    for (const name of ["--tx", "--ty", "--mx", "--my"]) root.style.removeProperty(name);
  }
  return on ? "holo mode on. move around to tilt it." : "back to normal.";
}

// Esc (or "normal") ends whichever modes are on: sky, holo and silly.
function backToNormal() {
  const root = document.documentElement;
  const inSky = root.classList.contains("sky");
  const inHolo = root.classList.contains("holo");
  const inSilly = root.classList.contains("silly");
  if (!inSky && !inHolo && !inSilly) return "already normal.";
  if (inSilly) setSilly(false);
  if (inSky) {
    sky.stop();
    root.classList.remove("sky", "sunset");
  }
  if (inHolo) setHolo(false);
  return "back to normal.";
}

// The hint in the command line when no command has suggested anything.
function defaultHint() {
  const root = document.documentElement;
  if (root.classList.contains("sky")) return root.classList.contains("sunset") ? "type daytime" : "type sunset";
  if (root.classList.contains("holo")) return "press esc";
  return root.classList.contains("silly") ? "type too silly" : "type help";
}

// cowsay: a cow says your words in a speech bubble. Lines wrap at 30 characters so the cow fits on a phone.
function cowsay(words) {
  const width = 30;
  const lines = [];
  let line = "";
  // Words longer than a whole line are cut into line-sized pieces.
  const pieces = words.split(" ").flatMap((word) => word.match(new RegExp(`.{1,${width}}`, "g")));
  for (const word of pieces) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  lines.push(line);

  const longest = Math.max(...lines.map((l) => l.length));
  const bubble = lines.map((l, i) => {
    const [left, right] =
      lines.length === 1 ? ["<", ">"] :
      i === 0 ? ["/", "\\"] :
      i === lines.length - 1 ? ["\\", "/"] : ["|", "|"];
    return `${left} ${l.padEnd(longest)} ${right}`;
  });

  return [
    ` ${"_".repeat(longest + 2)}`,
    ...bubble,
    ` ${"-".repeat(longest + 2)}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

function setupCli() {
  const form = document.getElementById("cli");
  const input = document.getElementById("cli-input");
  const output = document.getElementById("cli-output");
  if (!form) return;

  const history = [];
  let historyIndex = 0;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    input.value = "";
    if (!line) return;

    history.push(line);
    historyIndex = history.length;

    // Two-word commands (like "too silly") are looked up whole first.
    const [name, ...args] = line.split(/\s+/);
    const command = commands[line.toLowerCase().replace(/\s+/g, " ")] || commands[name.toLowerCase()];
    output.textContent = command ? command(args.join(" ")) : `command not found: ${name}. try help`;

    // Show the suggested next command, or the usual hint.
    input.placeholder = nextHint || defaultHint();
    nextHint = "";
  });

  // Up and down arrows walk through earlier commands, like a real shell.
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && historyIndex > 0) {
      historyIndex -= 1;
    } else if (event.key === "ArrowDown" && historyIndex < history.length) {
      historyIndex += 1;
    } else {
      return;
    }
    event.preventDefault();
    input.value = history[historyIndex] || "";
  });

  // Esc anywhere ends the modes. It only answers when a mode was on, so Esc stays quiet the rest of the time.
  document.addEventListener("keydown", (event) => {
    const root = document.documentElement;
    if (event.key !== "Escape" || root.classList.contains("booting")) return;
    if (!["sky", "holo", "silly"].some((mode) => root.classList.contains(mode))) return;
    output.textContent = backToNormal();
    input.placeholder = defaultHint();
  });

  // Press / anywhere to jump to the command line.
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== input && !document.documentElement.classList.contains("booting")) {
      event.preventDefault();
      input.focus();
    }
  });

  // Stay in the command line across page loads: if it was in use when the page was left (a reload, or a
  // command like cd), the next page puts the typing back there. Not while the boot screen wants the password.
  window.addEventListener("pagehide", () => {
    try { sessionStorage.setItem("cli-focus", document.activeElement === input ? "1" : ""); } catch (e) {}
  });
  try {
    if (sessionStorage.getItem("cli-focus") && !document.documentElement.classList.contains("booting")) {
      input.focus({ preventScroll: true });
    }
  } catch (e) {}
}

/* ---------- 3. Clock and uptime ---------- */

function setupClock() {
  const clock = document.getElementById("clock");
  const uptime = document.getElementById("uptime");
  if (!clock) return;

  const start = Date.now();
  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const seconds = Math.floor((Date.now() - start) / 1000);
    uptime.textContent = `uptime ${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  };
  tick();
  setInterval(tick, 1000);
}

setupCli();
setupClock();
runBoot();
