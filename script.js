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
  "[ ok ] indexing ~/projects ........ 3 found",
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
  { names: ["~", "home", "..", "/", "carries-brain"], url: "index.html" },
];

function findPlace(name) {
  const clean = (name || "").toLowerCase().replace(/^projects\//, "").replace(/\/$/, "");
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
    "commands: ls, cd <place>, open <place>, whoami, pwd, date, clear, reboot\n" +
    "places:   project-1, project-2, project-3, resume, home",
  ls: () => "projects/project-1/  projects/project-2/  projects/project-3/  resume.txt",
  cd: (name) => goTo(name || "~"),
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
};

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

    const [name, ...args] = line.split(/\s+/);
    const command = commands[name.toLowerCase()];
    output.textContent = command ? command(args.join(" ")) : `command not found: ${name}. try help`;
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

  // Press / anywhere to jump to the command line.
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== input && !document.documentElement.classList.contains("booting")) {
      event.preventDefault();
      input.focus();
    }
  });
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
