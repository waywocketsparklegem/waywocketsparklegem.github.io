/*
  dream.exe: a brain that grows its own folds.

  A reaction-diffusion simulation (the Gray-Scott model). Two imaginary chemicals, A and B, spread across
  a grid. Where they meet, B feeds on A and makes more B, while B slowly fades away. With the right rates,
  the pattern that appears looks like brain coral. It starts from a big :) and grows outward.
  Used on the home page (in the window) and on dream.html (full screen).
  Drag across it to seed new growth. The rates drift slowly, so the folds keep rearranging.

  It runs on the graphics card (WebGL2): each step is a tiny program (a shader) run on every cell at once.
*/

// Settings. Edit freely.
const cellSize = 2;        // screen pixels per grid cell: bigger means bigger folds and less work
const stepsPerFrame = 4;   // simulation steps per frame: more means faster growth
const brushSize = 5;       // radius of the drag brush, in cells
const green = [3 / 255, 249 / 255, 0];            // --green
const white = [252 / 255, 252 / 255, 252 / 255];  // --white

/* ---------- Shaders ---------- */

// Covers the screen with one big triangle; uv runs from 0 to 1 across it.
const vertexShader = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Starting state: chemical A everywhere, plus B wherever the :) was drawn.
// Each spot in the :) starts with a slightly different amount of B, so the folds grow differently every time.
const seedShader = `#version 300 es
precision highp float;
uniform sampler2D seed;
uniform float salt;  // a random number, new for every start
in vec2 uv;
out vec4 color;
void main() {
  float amount = fract(sin(dot(uv * 997.0 + salt, vec2(12.9898, 78.233))) * 43758.5453);
  color = vec4(1.0, step(0.5, texture(seed, uv).a) * (0.55 + 0.45 * amount), 0.0, 1.0);
}`;

// One step of the simulation. The red channel holds chemical A, green holds chemical B.
const stepShader = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 grid;         // grid size, in cells
uniform float time;        // seconds
uniform vec2 brushFrom;    // the line the pointer dragged along, in cells
uniform vec2 brushTo;
uniform float brushSize;   // 0 when nothing is being dragged
uniform float rage;        // 1 in rage mode: rules that grow sharp strands, stretched downward like drips
in vec2 uv;
out vec4 color;

vec2 at(vec2 offset) {
  return texture(state, uv + offset / grid).rg;
}

void main() {
  vec2 here = at(vec2(0.0));

  // How much each chemical differs from its neighbours: this is what makes them spread.
  // In rage mode they spread seven times as easily up and down as sideways, so growth runs in vertical strands.
  float across = mix(1.0, 0.25, rage);
  float down = mix(1.0, 1.75, rage);
  vec2 spread = -here * (0.4 * across + 0.4 * down + 0.2)
    + 0.2 * (across * (at(vec2(1.0, 0.0)) + at(vec2(-1.0, 0.0))) + down * (at(vec2(0.0, 1.0)) + at(vec2(0.0, -1.0))))
    + 0.05 * (at(vec2(1.0, 1.0)) + at(vec2(-1.0, 1.0)) + at(vec2(1.0, -1.0)) + at(vec2(-1.0, -1.0)));

  // Feed and kill rates drift across the screen and over time, so different areas grow different folds.
  // Rage mode feeds less and kills a little less, which grows thin, sharp strands instead of rounded coral.
  float feed = mix(0.0545, 0.030, rage) + 0.003 * sin(uv.x * 4.0 + time * 0.07) * cos(uv.y * 3.0 - time * 0.05);
  float kill = mix(0.0625, 0.0565, rage) + 0.0008 * sin(uv.y * 5.0 + time * 0.04);

  float reaction = here.r * here.g * here.g;
  vec2 next = here + vec2(
    1.0 * spread.r - reaction + feed * (1.0 - here.r),
    0.5 * spread.g + reaction - (kill + feed) * here.g
  );

  // Dragging drops chemical B along the pointer's path.
  vec2 p = uv * grid - brushFrom;
  vec2 line = brushTo - brushFrom;
  float along = clamp(dot(p, line) / max(dot(line, line), 0.0001), 0.0, 1.0);
  if (length(p - line * along) < brushSize) next.g = 1.0;

  color = vec4(clamp(next, 0.0, 1.0), 0.0, 1.0);
}`;

// Draws the grid: chemical B is treated as height and lit from the top left, so the folds look solid.
// In silly mode, the folds are a cycling rainbow and everything else is see-through.
const drawShader = `#version 300 es
precision highp float;
uniform sampler2D state;
uniform vec2 grid;
uniform vec3 green;
uniform vec3 white;
uniform float time;
uniform float silly;  // 1 in silly mode, 0 otherwise
uniform float holo;   // 1 in holo mode, 0 otherwise
uniform vec2 tilt;    // holo mode's tilt, -1 to 1 on each axis
uniform float rage;   // 1 in rage mode, 0 otherwise
uniform vec3 red;     // rage mode's blood red
in vec2 uv;
out vec4 color;

// A fully saturated color for a hue from 0 to 1 (red, yellow, green, cyan, blue, magenta, red).
vec3 rainbow(float hue) {
  return clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

float height(vec2 offset) {
  return texture(state, uv + offset / grid).g;
}

void main() {
  vec2 slope = vec2(height(vec2(1.0, 0.0)) - height(vec2(-1.0, 0.0)),
                    height(vec2(0.0, 1.0)) - height(vec2(0.0, -1.0)));
  vec3 normal = normalize(vec3(-slope * 6.0, 1.0));
  vec3 light = normalize(vec3(-0.6, 0.7, 0.8));
  float diffuse = max(dot(normal, light), 0.0);
  float shine = pow(max(reflect(-light, normal).z, 0.0), 20.0);

  float fold = smoothstep(0.08, 0.3, height(vec2(0.0)));
  // Silly mode: a rainbow across the screen that slides through every color every 8 seconds.
  vec3 goo = mix(green, rainbow(uv.x + uv.y * 0.5 - time / 8.0), silly);
  vec3 lit = fold * (goo * (0.2 + 0.8 * diffuse) + white * shine * 0.7);

  // Holo mode: the folds are an iridescent film. Each fold's color comes from the angle between its surface
  // and the tilt, like a hologram sticker, and a bright glint sits where the tilted light hits it square on.
  vec3 holoLight = normalize(vec3(tilt.x, -tilt.y, 0.9));
  float angle = dot(normal, holoLight);
  vec3 film = 0.55 + 0.45 * cos(6.2831 * (angle * 1.6 + dot(normal.xy, tilt) * 0.8 + vec3(0.0, 0.33, 0.67)));
  float glint = pow(max(reflect(-holoLight, normal).z, 0.0), 30.0);
  vec3 holoLit = fold * (mix(film, vec3(1.0), 0.15) * (0.55 + 0.45 * diffuse) + vec3(glint));
  lit = mix(lit, holoLit, holo);

  // Rage mode: hard-edged strands shaded like dark metal: near black in the creases, blood red on the faces,
  // and a hot, almost white edge where the light catches.
  float blade = smoothstep(0.22, 0.25, height(vec2(0.0)));
  float hot = pow(max(reflect(-light, normal).z, 0.0), 40.0);
  vec3 rageLit = blade * (red * (0.08 + 1.1 * pow(diffuse, 3.0)) + vec3(1.0, 0.78, 0.72) * hot * 0.9);
  lit = mix(lit, rageLit, rage);

  // Outside the folds: black normally, see-through in silly and holo modes.
  float alpha = mix(1.0, fold, max(silly, holo));
  color = vec4(min(lit, vec3(alpha)), alpha);
}`;

/* ---------- WebGL plumbing ---------- */

const canvas = document.getElementById("dream");
const hint = document.getElementById("dream-hint");
const gl = canvas.getContext("webgl2", { antialias: false });

function makeProgram(fragmentSource) {
  const program = gl.createProgram();
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexShader], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
  }
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

// Uses a program and sets its uniforms, e.g. use(step, { grid: [w, h], time: 1.5 }).
function use(program, uniforms) {
  gl.useProgram(program);
  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    const values = [].concat(value);
    gl[`uniform${values.length}f`](location, ...values);
  }
}

// The grid lives in two textures: each step reads one and writes the other, then they swap.
let floatFormat;
let filter;

function makeTarget(width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, floatFormat, width, height, 0, gl.RGBA, gl.FLOAT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("can't draw into float textures");
  return { texture, framebuffer };
}

// Runs a program over a whole target (or the screen, when target is null).
function run(target, width, height, input) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
  gl.viewport(0, 0, width, height);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, input);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

/* ---------- The dream ---------- */

let seedProgram, stepProgram, drawProgram;
let grid = [1, 1];
let targets = [];
let current = 0;
let brush = null;   // { from, to } in cells, waiting to be drawn
let lastPoint = null;

// Sizes the canvas and grid to the window, then plants the :).
function setup() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  grid = [Math.max(1, Math.round(canvas.clientWidth / cellSize)), Math.max(1, Math.round(canvas.clientHeight / cellSize))];

  for (const target of targets) {
    gl.deleteTexture(target.texture);
    gl.deleteFramebuffer(target.framebuffer);
  }
  targets = [makeTarget(...grid), makeTarget(...grid)];
  current = 0;

  // Draw a big :) on a hidden canvas the size of the grid, and use it as the starting B. In rage mode it's a :( instead.
  const sketch = document.createElement("canvas");
  [sketch.width, sketch.height] = grid;
  const pen = sketch.getContext("2d");
  const size = Math.min(grid[1] * 0.6, grid[0] / 1.4);
  pen.font = `400 ${size}px "JetBrains Mono", monospace`;
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText(document.documentElement.classList.contains("rage") ? ":(" : ":)", grid[0] / 2, grid[1] / 2);

  const seed = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, seed);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sketch);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  use(seedProgram, { salt: Math.random() * 100 });
  run(targets[0], ...grid, seed);
  gl.deleteTexture(seed);
}

// The feed and kill rates drift over time; starting at a random point in that drift gives each visit a
// different layout of rates, so the first folds don't always grow the same way.
const rateStart = Math.random() * 1000;

// Rage mode (the "rage" command): sharp strands grow from a :( in blood red.
const rageRed = [215 / 255, 38 / 255, 46 / 255];  // --rage-red in styles.css
let raging = false;

function frame(now) {
  // Entering or leaving rage mode plants a fresh face (:( in rage, :) otherwise), so no mode inherits the other's growth.
  const rageNow = document.documentElement.classList.contains("rage");
  if (rageNow !== raging) setup();
  raging = rageNow;

  // In sky mode the clouds take the window's place, so the dream pauses until it ends.
  if (document.documentElement.classList.contains("sky")) {
    requestAnimationFrame(frame);
    return;
  }

  // On the home page, the dream waits behind the boot screen, so it starts growing as the site appears.
  const waiting = document.documentElement.classList.contains("booting");

  use(stepProgram, {
    grid,
    time: now / 1000 + rateStart,
    brushFrom: brush ? brush.from : [0, 0],
    brushTo: brush ? brush.to : [0, 0],
    brushSize: brush ? brushSize : 0,
    rage: raging ? 1 : 0,
  });
  // Rage mode grows at half speed.
  const steps = waiting ? 0 : raging ? Math.ceil(stepsPerFrame / 2) : stepsPerFrame;
  for (let i = 0; i < steps; i++) {
    run(targets[1 - current], ...grid, targets[current].texture);
    current = 1 - current;
  }
  brush = null;

  use(drawProgram, {
    grid,
    green,
    white,
    time: now / 1000,
    silly: document.documentElement.classList.contains("silly") ? 1 : 0,
    holo: document.documentElement.classList.contains("holo") ? 1 : 0,
    tilt: [holoTilt.x, holoTilt.y],
    rage: raging ? 1 : 0,
    red: rageRed,
  });
  run(null, canvas.width, canvas.height, targets[current].texture);
  requestAnimationFrame(frame);
}

// Pointer position in grid cells (y counts up from the bottom, like the grid).
function toCells(event) {
  const box = canvas.getBoundingClientRect();
  return [
    ((event.clientX - box.left) / box.width) * grid[0],
    (1 - (event.clientY - box.top) / box.height) * grid[1],
  ];
}

function setupPointer() {
  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    lastPoint = toCells(event);
    brush = { from: lastPoint, to: lastPoint };
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!lastPoint) return;
    const point = toCells(event);
    brush = { from: brush ? brush.from : lastPoint, to: point };
    lastPoint = point;
  });
  const stop = () => { lastPoint = null; };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
}

async function start() {
  try {
    if (!gl) throw new Error("no webgl2");
    // Full floats where the graphics card can draw into them, half floats otherwise.
    const fullFloat = gl.getExtension("EXT_color_buffer_float");
    if (!fullFloat && !gl.getExtension("EXT_color_buffer_half_float")) throw new Error("no float textures");
    floatFormat = fullFloat ? gl.RGBA32F : gl.RGBA16F;
    filter = !fullFloat || gl.getExtension("OES_texture_float_linear") ? gl.LINEAR : gl.NEAREST;

    const triangle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    seedProgram = makeProgram(seedShader);
    stepProgram = makeProgram(stepShader);
    drawProgram = makeProgram(drawShader);

    // Wait for the font so the :) is drawn in JetBrains Mono.
    try { await document.fonts.load('400 100px "JetBrains Mono"'); } catch (e) {}
    setup();
    setupPointer();
    requestAnimationFrame(frame);

    // A new window size starts a new dream.
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 250);
    });
  } catch (error) {
    hint.textContent = "[ this dream needs a browser with webgl2 ]";
    console.error(error);
  }
}

start();
