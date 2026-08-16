/* Rainbow Neon Matrix Rain — bg-rain.js
   Columns of falling cute symbols cycling through neon pastel colors.
   Canvas sits behind all page content (z-index: -1, pointer-events: none).
*/
(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var SYMBOLS = ['★', '✦', '✧', '♥', '💜', '💖', '✨', '🌈'];
  var COLORS  = ['#FF3DAD', '#C9A8FF', '#7FE7E0', '#A8F0C6', '#FFE99A'];
  var FONT_SIZE = 17;
  var cols, drops, colColors;

  function init() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / FONT_SIZE);
    drops = [];
    colColors = [];
    for (var i = 0; i < cols; i++) {
      drops[i]     = Math.random() * -100;  // stagger starts above viewport
      colColors[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  }

  function draw() {
    // Near-transparent dark overlay creates fading trail effect
    ctx.fillStyle = 'rgba(20, 10, 30, 0.10)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = FONT_SIZE + 'px monospace';
    ctx.textBaseline = 'top';

    for (var i = 0; i < cols; i++) {
      var sym   = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      var color = colColors[i];
      var x     = i * FONT_SIZE;
      var y     = drops[i] * FONT_SIZE;

      // Neon glow
      ctx.shadowBlur  = 8;
      ctx.shadowColor = color;
      ctx.fillStyle   = color;
      ctx.fillText(sym, x, y);

      // Reset glow so overlay rect isn't affected
      ctx.shadowBlur = 0;

      drops[i] += 1;

      // Random reset to top (creates varying column lengths)
      if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
        drops[i]     = 0;
        colColors[i] = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }
  }

  var animId = null;
  var paused = false;

  function loop() {
    if (!paused) draw();
    animId = requestAnimationFrame(loop);
  }

  // Pause when tab is hidden (performance)
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });

  // Resize gracefully
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      init();
    }, 200);
  });

  init();
  loop();
}());
