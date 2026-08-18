// bg-rain.js — Autumn Leaves Canvas Animation (Oak, Maple, Catalpa)
// Targets: <canvas id="bg-canvas">
// Respects prefers-reduced-motion; pauses when tab is hidden

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const LEAF_COLORS = [
    '#C8603A', '#E8A830', '#8B4A3A', '#A0281A', '#D4531A', '#E87D45',
  ];

  const LEAF_TYPES = ['oak', 'maple', 'catalpa'];

  const LEAF_COUNT_MIN = 34;
  const LEAF_COUNT_MAX = 46;
  const FALL_DURATION_MIN = 15000;
  const FALL_DURATION_MAX = 20000;

  let leaves = [];
  let animationId = null;
  let paused = false;
  let lastTime = null;

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
      type:       LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)],
      color:      LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      swayAmplitude: randomBetween(30, 80),
      swayFrequency: randomBetween(0.5, 1.5),
      swayPhase:  randomBetween(0, Math.PI * 2),
      rotation:      randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.5, 0.5),
      speed:       canvas.height / fallDuration * 1000,
      elapsed:     0,
    };
  }

  // Oak leaf: rounded lobed shape built from a wavy path of bumps
  function drawOakLeaf(ctx, s) {
    ctx.beginPath();
    const lobes = 4;
    const halfLen = s * 0.9;
    ctx.moveTo(0, -halfLen);
    for (let i = 0; i < lobes; i++) {
      const yTop = -halfLen + (halfLen * 2 / lobes) * i;
      const yBot = -halfLen + (halfLen * 2 / lobes) * (i + 1);
      const yMid = (yTop + yBot) / 2;
      const outward = s * (0.55 - i * 0.05);
      ctx.quadraticCurveTo(outward, yMid, 0, yBot);
    }
    for (let i = lobes - 1; i >= 0; i--) {
      const yBot = -halfLen + (halfLen * 2 / lobes) * (i + 1);
      const yTop = -halfLen + (halfLen * 2 / lobes) * i;
      const yMid = (yTop + yBot) / 2;
      const outward = -s * (0.55 - i * 0.05);
      ctx.quadraticCurveTo(outward, yMid, 0, yTop);
    }
    ctx.closePath();
    ctx.fill();
    // stem
    ctx.beginPath();
    ctx.moveTo(0, halfLen);
    ctx.lineTo(0, halfLen + s * 0.3);
    ctx.stroke();
  }

  // Maple leaf: classic pointed 5-lobe star shape
  function drawMapleLeaf(ctx, s) {
    const points = 5;
    const outerR = s * 0.95;
    const innerR = s * 0.4;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    // stem
    ctx.beginPath();
    ctx.moveTo(0, outerR * 0.3);
    ctx.lineTo(0, outerR + s * 0.35);
    ctx.stroke();
  }

  // Catalpa leaf: large simple heart/oval shape with a pointed tip
  function drawCatalpaLeaf(ctx, s) {
    const w = s * 0.85;
    const h = s * 1.05;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.bezierCurveTo(w, -h * 0.6, w * 0.95, h * 0.5, 0, h);
    ctx.bezierCurveTo(-w * 0.95, h * 0.5, -w, -h * 0.6, 0, -h);
    ctx.closePath();
    ctx.fill();
    // stem
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h + s * 0.3);
    ctx.stroke();
  }

  function drawLeaf(leaf) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.rotation);
    ctx.fillStyle = leaf.color;
    ctx.strokeStyle = leaf.color;
    ctx.lineWidth = leaf.size * 0.08;
    const s = leaf.size;
    if (leaf.type === 'oak') drawOakLeaf(ctx, s);
    else if (leaf.type === 'maple') drawMapleLeaf(ctx, s);
    else drawCatalpaLeaf(ctx, s);
    ctx.restore();
  }

  function initLeaves() {
    const count = Math.floor(randomBetween(LEAF_COUNT_MIN, LEAF_COUNT_MAX + 1));
    leaves = [];
    for (let i = 0; i < count; i++) {
      const leaf = makeLeaf();
      leaf.y = randomBetween(-canvas.height, canvas.height * 0.9);
      leaves.push(leaf);
    }
  }

  function update(dt) {
    const dtSec = dt / 1000;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      leaf.elapsed += dt;
      leaf.y += leaf.speed * dtSec;
      leaf.x += Math.sin(
        leaf.swayPhase + leaf.elapsed / 1000 * leaf.swayFrequency * Math.PI * 2
      ) * leaf.swayAmplitude * dtSec * 0.5;
      leaf.rotation += leaf.rotationSpeed * dtSec;
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
    const dt = Math.min(timestamp - lastTime, 100);
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

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
      stop();
    } else {
      paused = false;
      start();
    }
  });

  window.addEventListener('resize', function () {
    resize();
    initLeaves();
  });

  resize();

  if (prefersReduced) {
    initLeaves();
    render();
  } else {
    initLeaves();
    start();
  }

})();
