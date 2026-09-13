// Plays back Pong frames recorded from the CHIP-8 emulator (see tools/record-pong).
// Draws onto a 64x32 canvas; CSS scales it up with crisp pixels.

(function () {
  const W = 64, H = 32, FPS = 60;
  const DECAY = 0.75;               // phosphor fade per frame: hides CHIP-8's XOR flicker
  const GREEN = [63, 185, 80];      // same as --accent

  const canvas = document.getElementById("pong");
  const still = document.getElementById("pong-still");
  if (!canvas || typeof PONG_FIRST === "undefined") return;   // keep the static SVG

  // Decode: the first frame in full, then per-frame lists of flipped pixel indices
  const firstFrame = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const byte = parseInt(PONG_FIRST.substr((i >> 3) * 2, 2), 16);
    firstFrame[i] = (byte >> (7 - (i & 7))) & 1;
  }
  const deltas = PONG_DELTAS.split(",").map(d => {
    const flips = [];
    for (let j = 0; j < d.length; j += 3) flips.push(parseInt(d.substr(j, 3), 16));
    return flips;
  });

  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(W, H);
  const pixels = new Uint8Array(W * H);        // current on/off state
  const glow = new Float32Array(W * H);        // displayed brightness 0..1
  let frame = 0;

  function reset() {
    pixels.set(firstFrame);
    for (let i = 0; i < W * H; i++) glow[i] = pixels[i];
    frame = 0;
  }

  function step() {
    if (frame === deltas.length) reset();
    else for (const i of deltas[frame++]) pixels[i] ^= 1;
    for (let i = 0; i < W * H; i++) glow[i] = pixels[i] ? 1 : glow[i] * DECAY;
  }

  function draw() {
    const d = image.data;
    for (let i = 0; i < W * H; i++) {
      d[i * 4]     = GREEN[0];
      d[i * 4 + 1] = GREEN[1];
      d[i * 4 + 2] = GREEN[2];
      d[i * 4 + 3] = glow[i] * 255;
    }
    ctx.putImageData(image, 0, 0);
  }

  reset();
  step();
  draw();
  canvas.hidden = false;
  still.setAttribute("hidden", "");   // <svg> has no .hidden property, only HTML elements do

  // Respect "reduce motion": show one frame and stop
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Advance at a fixed 60 Hz no matter the monitor's refresh rate
  let visible = false, last = 0, acc = 0;
  function tick(now) {
    if (!visible) return;
    acc += Math.min(now - last, 250);   // don't fast-forward after a stall
    last = now;
    while (acc >= 1000 / FPS) { step(); acc -= 1000 / FPS; }
    draw();
    requestAnimationFrame(tick);
  }

  // Only animate while the canvas is on screen
  new IntersectionObserver(([entry]) => {
    const wasVisible = visible;
    visible = entry.isIntersecting;
    if (visible && !wasVisible) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  }).observe(canvas);
})();
