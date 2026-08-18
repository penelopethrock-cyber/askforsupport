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

  // Wind drift state: a slowly-oscillating bias that gives the sway a wind-like feel
  let windDrift = 0;
  let windCycleTime = 0;

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
    const xBase = randomBetween(0, canvas.width);
    return {
      xBase,
      x: xBase,
      y:            randomBetween(-100, -10),
      size:         randomBetween(10, 20),
      type:         LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)],
      color:        LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      swayAmplitude: randomBetween(30, 80),
      swayFrequency: randomBetween(0.5, 1.5),
      swayPhase:    randomBetween(0, Math.PI * 2),
      rotation:     randomBetween(0, Math.PI * 2),
      rotationSpeed: randomBetween(-0.5, 0.5),
      speed:        canvas.height / fallDuration * 1000,
      elapsed:      0,
    };
  }

  function darkenColor(hex, amount) {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // Oak leaf: elongated silhouette with 4 rounded finger-like lobes per side,
  // deep smooth U-shaped sinuses, cubic bezier curves.
  function drawOakLeaf(ctx, s, color) {
    const h = s * 1.0;
    const veinColor = darkenColor(color, 30);

    const lobes = [
      { y: -h * 0.85, outX: s * 0.50, cpY: -h * 0.95 },
      { y: -h * 0.45, outX: s * 0.60, cpY: -h * 0.55 },
      { y: -h * 0.05, outX: s * 0.58, cpY: -h * 0.15 },
      { y:  h * 0.30, outX: s * 0.45, cpY:  h * 0.20 },
    ];

    ctx.beginPath();
    ctx.moveTo(0, -h);

    for (let i = 0; i < lobes.length; i++) {
      const l = lobes[i];
      const prevY = i === 0 ? -h : lobes[i - 1].y;
      const sinusX = s * 0.12;
      ctx.bezierCurveTo(l.outX * 0.5, prevY, l.outX, l.cpY, l.outX, l.y);
      const nextY = i < lobes.length - 1 ? lobes[i + 1].y : h * 0.65;
      const nextSinusY = (l.y + nextY) / 2;
      ctx.bezierCurveTo(l.outX, l.y + (nextY - l.y) * 0.3, sinusX, nextSinusY, sinusX * 0.5, nextSinusY);
    }

    ctx.bezierCurveTo(s * 0.2, h * 0.75, s * 0.1, h * 0.65, 0, h * 0.65);

    for (let i = lobes.length - 1; i >= 0; i--) {
      const l = lobes[i];
      const nextY = i > 0 ? lobes[i - 1].y : -h;
      const sinusY = (l.y + nextY) / 2;
      ctx.bezierCurveTo(-s * 0.12 * 0.5, sinusY, -l.outX, l.cpY, -l.outX, l.y);
      const prevY = i === 0 ? -h : lobes[i - 1].y;
      ctx.bezierCurveTo(-l.outX, l.y - (l.y - prevY) * 0.3, -l.outX * 0.5, prevY, i === 0 ? 0 : -s * 0.12 * 0.5, prevY);
    }

    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.045;
    ctx.moveTo(0, -h);
    ctx.lineTo(0, h * 0.60);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.07;
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(0, h * 0.65 + s * 0.3);
    ctx.stroke();
  }

  // Maple leaf: palmate — tall center lobe, two diagonal side lobes,
  // two small basal lobes near stem. Deep V-shaped sinuses.
  function drawMapleLeaf(ctx, s, color) {
    const veinColor = darkenColor(color, 30);
    const h = s;

    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    ctx.bezierCurveTo(-s * 0.15, h * 0.50, -s * 0.42, h * 0.38, -s * 0.48, h * 0.22);
    ctx.bezierCurveTo(-s * 0.44, h * 0.10, -s * 0.35, h * 0.08, -s * 0.30, h * 0.02);
    ctx.bezierCurveTo(-s * 0.65, -h * 0.10, -s * 0.90, -h * 0.28, -s * 0.82, -h * 0.42);
    ctx.bezierCurveTo(-s * 0.78, -h * 0.50, -s * 0.68, -h * 0.48, -s * 0.60, -h * 0.40);
    ctx.bezierCurveTo(-s * 0.48, -h * 0.28, -s * 0.30, -h * 0.32, -s * 0.20, -h * 0.38);
    ctx.bezierCurveTo(-s * 0.28, -h * 0.60, -s * 0.18, -h * 0.90, 0, -h);
    ctx.bezierCurveTo(s * 0.18, -h * 0.90, s * 0.28, -h * 0.60, s * 0.20, -h * 0.38);
    ctx.bezierCurveTo(s * 0.30, -h * 0.32, s * 0.48, -h * 0.28, s * 0.60, -h * 0.40);
    ctx.bezierCurveTo(s * 0.68, -h * 0.48, s * 0.78, -h * 0.50, s * 0.82, -h * 0.42);
    ctx.bezierCurveTo(s * 0.90, -h * 0.28, s * 0.65, -h * 0.10, s * 0.30, h * 0.02);
    ctx.bezierCurveTo(s * 0.35, h * 0.08, s * 0.44, h * 0.10, s * 0.48, h * 0.22);
    ctx.bezierCurveTo(s * 0.42, h * 0.38, s * 0.15, h * 0.50, 0, h * 0.55);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.05;
    ctx.moveTo(0, -h * 0.85);
    ctx.lineTo(0, h * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.07;
    ctx.moveTo(0, h * 0.55);
    ctx.lineTo(0, h * 0.55 + s * 0.35);
    ctx.stroke();
  }

  // Catalpa leaf: broad asymmetric heart/spade shape, wide rounded base,
  // single pointed tip offset slightly for natural asymmetry.
  function drawCatalpamLeaf(ctx, s, color) {
    const veinColor = darkenColor(color, 30);
    const w = s * 0.95;
    const h = s * 1.05;

    ctx.beginPath();
    ctx.moveTo(s * 0.05, -h);
    ctx.bezierCurveTo(w * 0.9, -h * 0.55, w, h * 0.10, w * 0.55, h * 0.62);
    ctx.bezierCurveTo(w * 0.30, h * 0.85, s * 0.12, h * 0.92, 0, h);
    ctx.bezierCurveTo(-s * 0.12, h * 0.92, -w * 0.30, h * 0.85, -w * 0.55, h * 0.62);
    ctx.bezierCurveTo(-w, h * 0.10, -w * 0.9, -h * 0.55, s * 0.05, -h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.05;
    ctx.moveTo(s * 0.05, -h * 0.85);
    ctx.bezierCurveTo(s * 0.02, 0, 0, h * 0.5, 0, h * 0.90);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = veinColor;
    ctx.lineWidth = s * 0.08;
    ctx.moveTo(0, h);
    ctx.lineTo(0, h + s * 0.30);
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
    if (leaf.type === 'oak') drawOakLeaf(ctx, s, leaf.color);
    else if (leaf.type === 'maple') drawMapleLeaf(ctx, s, leaf.color);
    else drawCatalpamLeaf(ctx, s, leaf.color);
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

    windCycleTime += dt;
    const windPeriod = 11000;
    const windDriftVel = Math.sin(windCycleTime / windPeriod * Math.PI * 2) * 0.0008;
    windDrift += windDriftVel * dt;

    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      leaf.elapsed += dt;
      leaf.y += leaf.speed * dtSec;

      const phase = leaf.swayPhase + leaf.elapsed / 1000 * leaf.swayFrequency * Math.PI * 2 + windDrift;
      leaf.x = leaf.xBase + Math.sin(phase) * leaf.swayAmplitude;

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
