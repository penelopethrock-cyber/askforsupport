// bg-rain.js — Autumn Leaves Static Canvas Background (Oak, Maple, Catalpa)
// Targets: <canvas id="bg-canvas">
// Static scatter: draws once on load and on resize; no animation loop.

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const LEAF_COLORS = [
    '#C8603A', '#E8A830', '#8B4A3A', '#A0281A', '#D4531A', '#E87D45',
  ];

  const LEAF_TYPES = ['oak', 'maple', 'catalpa'];

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
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

  function drawScene() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const count = Math.floor(randomBetween(60, 91));

    for (let i = 0; i < count; i++) {
      const x       = randomBetween(0, canvas.width);
      const y       = randomBetween(0, canvas.height);
      const size    = randomBetween(18, 48);
      const rotation = randomBetween(0, Math.PI * 2);
      const type    = LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)];
      const color   = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      const opacity = randomBetween(0.5, 0.9);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;
      ctx.fillStyle   = color;
      ctx.strokeStyle = color;
      ctx.lineWidth   = size * 0.08;

      if (type === 'oak')        drawOakLeaf(ctx, size, color);
      else if (type === 'maple') drawMapleLeaf(ctx, size, color);
      else                       drawCatalpamLeaf(ctx, size, color);

      ctx.restore();
    }
  }

  window.addEventListener('resize', drawScene);
  drawScene();

})();
