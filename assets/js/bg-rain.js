// bg-rain.js — Autumn Leaves Canvas Animation
// Targets: <canvas id="bg-canvas">
// Respects prefers-reduced-motion; pauses when tab is hidden

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Leaf colour palette — autumnal
  const LEAF_COLORS = [
    '#C8603A', // burnt orange
    '#E8A830', // golden yellow
    '#8B4A3A', // rust brown
    '#A0281A', // deep red
    '#D4531A', // sienna
    '#E87D45', // warm amber
  ];

  const LEAF_COUNT_MIN = 18;
  const LEAF_COUNT_MAX = 25;
  const FALL_DURATION_MIN = 15000; // ms
  const FALL_DURATION_MAX = 20000; // ms

  let leaves = [];
  let animationId = null;
  let paused = false;
  let lastTime = null;

  // Check reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeLeaf() {
    const fallDuration = randomBetween(FALL_DURATION_MIN, FALL_DURATION_MAX);
    return {
      x:          randomBetween(0, canvas.width),
      y:          randomBetween(-100, -10),
      size:       randomBetween(10, 20),
      color:      LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      // sway: horizontal oscillation
      swayAmplitude: randomBetween(30, 80),
      swayFrequency: randomBetween(0.5, 1.5),  // cycles per second
      swayPhase:  randomBetween(0, Math.PI * 2),
      // rotation
      rotation:      randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.5, 0.5), // radians per second
      // fall speed derived from duration
      speed:       canvas.height / fallDuration * 1000, // px per second
      elapsed:     0,
    };
  }

  function drawLeaf(leaf) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.fillStyle = leaf.color;
    const s = leaf.size;
    // Simple maple-leaf-like shape: two overlapping ellipses + stem
    ctx.beginPath();
    // Left lobe
    ctx.ellipse(-s * 0.35, -s * 0.1, s * 0.45, s * 0.3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Right lobe
    ctx.beginPath();
    ctx.ellipse(s * 0.35, -s * 0.1, s * 0.45, s * 0.3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Centre body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.3, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stem
    ctx.strokeStyle = leaf.color;
    ctx.lineWidth = s * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.45);
    ctx.lineTo(0, s * 0.75);
    ctx.stroke();
    ctx.restore();
  }

  function initLeaves() {
    const count = Math.floor(randomBetween(LEAF_COUNT_MIN, LEAF_COUNT_MAX + 1));
    leaves = [];
    for (let i = 0; i < count; i++) {
      const leaf = makeLeaf();
      // Spread them vertically so they don't all start at once
      leaf.y = randomBetween(-canvas.height, canvas.height * 0.9);
      leaves.push(leaf);
    }
  }

  function update(dt) {
    // dt = elapsed ms since last frame
    const dtSec = dt / 1000;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      leaf.elapsed += dt;
      // Fall downward
      leaf.y += leaf.speed * dtSec;
      // Side-to-side sway (sinusoidal)
      leaf.x += Math.sin(
        leaf.swayPhase + leaf.elapsed / 1000 * leaf.swayFrequency * Math.PI * 2
      ) * leaf.swayAmplitude * dtSec * 0.5;
      // Rotate slowly
      leaf.rotation += leaf.rotationSpeed * dtSec;
      // Recycle leaf when it goes below the screen
      if (leaf.y > canvas.height + 40) {
        leaves[i] = makeLeaf();
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const leaf of leaves) {
      drawLeaf(leaf);
    }
  }

  function loop(timestamp) {
    if (paused) return;
    if (lastTime === null) lastTime = timestamp;
    const dt = Math.min(timestamp - lastTime, 100); // cap at 100ms to avoid jumps
    lastTime = timestamp;
    update(dt);
    render();
    animationId = requestAnimationFrame(loop);
  }

  function start() {
    if (animationId !== null) return;
    lastTime = null;
    animationId = requestAnimationFrame(loop);
  }

  function stop() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Visibility API — pause when tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
      stop();
    } else {
      paused = false;
      start();
    }
  });

  // Resize handler
  window.addEventListener('resize', function () {
    resize();
    // Re-initialise so leaves don't pile up in one corner
    initLeaves();
  });

  // Bootstrap
  resize();

  if (prefersReduced) {
    // Draw one static frame and stop
    initLeaves();
    render();
  } else {
    initLeaves();
    start();
  }

})();
