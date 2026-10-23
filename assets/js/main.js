/* Youssef Ben Mbarek · 贝苏宇 — portfolio interactions (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var ZH = /^zh/i.test(root.lang);
  var T = ZH ? {
    play: '播放视频', pause: '暂停视频', copied: '已复制', copyFail: '请手动复制', copy: '复制'
  } : {
    play: 'Play videos', pause: 'Pause videos', copied: 'Copied', copyFail: 'Select & copy', copy: 'Copy'
  };

  /* ---------- language switch: remember the visitor's choice ---------- */
  $$('.lang-btn').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('lang', a.getAttribute('data-lang')); } catch (e) {}
      a.href = a.getAttribute('href').split('#')[0] + location.hash;
    });
  });

  /* ---------- theme ---------- */
  var themeListeners = [];
  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    themeListeners.forEach(function (fn) { fn(); });
  });
  $('#printBtn').addEventListener('click', function () { window.print(); });

  /* ---------- nav: scrolled state, progress, active link, project accent ---------- */
  var nav = $('.nav'), bar = $('#progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      nav.classList.toggle('is-scrolled', scrollY > 10);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.nav__links a');
  var sectionMap = { antroute: 'work', memo: 'work', axis: 'work', work: 'work', experience: 'experience', skills: 'skills', contact: 'contact' };
  var accentOf = { antroute: 'var(--c-amber)', memo: 'var(--c-green)', axis: 'var(--c-cyan)' };
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + sectionMap[id]); });
        if (accentOf[id]) root.style.setProperty('--pa', accentOf[id]);
        else root.style.removeProperty('--pa');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['work', 'antroute', 'memo', 'axis', 'experience', 'skills', 'contact'].forEach(function (id) {
      var el = document.getElementById(id); if (el) secIO.observe(el);
    });
  }

  /* ---------- reveal + count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduceMotion || isNaN(target)) return;
    var start = performance.now(), dur = 1300;
    (function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * e).toFixed(dec);
      if (t < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
    })(start);
  }
  var reveals = $$('.reveal, .bars');
  // stagger siblings
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 0.07 + 's');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('[data-count]', en.target).forEach(countUp);
        if (en.target.hasAttribute('data-count')) countUp(en.target);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  // print: make sure everything is visible
  addEventListener('beforeprint', function () { reveals.forEach(function (el) { el.classList.add('in'); }); });

  /* ---------- pointer glow on cards ---------- */
  document.addEventListener('pointermove', function (e) {
    var card = e.target.closest && e.target.closest('.glow');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- project index hover preview ---------- */
  var prev = $('.index__preview'), prevImg = $('#indexPreview');
  if (prev && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.index__list a').forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        prevImg.src = a.getAttribute('data-preview');
        prev.classList.add('is-on');
      });
      a.addEventListener('pointerleave', function () { prev.classList.remove('is-on'); });
      a.addEventListener('pointermove', function (e) {
        prev.style.setProperty('--px', (e.clientX + 24) + 'px');
        prev.style.setProperty('--py', (e.clientY - 100) + 'px');
      });
    });
  }

  /* ---------- segmented controls (tabs) ---------- */
  function segment(seg, onSelect) {
    var tabs = $$('[role="tab"]', seg);
    var thumb = $('.seg__thumb', seg);
    function place() {
      var sel = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0];
      if (!sel || !thumb) return;
      seg.style.setProperty('--tx', sel.offsetLeft + 'px');
      seg.style.setProperty('--tw', sel.offsetWidth + 'px');
    }
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      place();
      onSelect(tab);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowRight' || k === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        else if (k === 'ArrowLeft' || k === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (k === 'Home') n = tabs[0];
        else if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    place();
    addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    return { place: place };
  }

  /* ---------- sim-to-real video comparison ---------- */
  var s2r = $('#s2r');
  if (s2r) {
    var clips = $$('.clip', s2r);
    var playBtn = $('#s2rPlay'), modeBtn = $('#s2rMode');
    var st = { active: 'sim', mode: 'single', paused: false, inView: false };
    var conn = navigator.connection || {};
    if (conn.saveData || reduceMotion) st.paused = true;

    function sync() {
      s2r.setAttribute('data-mode', st.mode);
      s2r.setAttribute('data-active', st.active);
      playBtn.classList.toggle('is-paused', st.paused);
      playBtn.setAttribute('aria-label', st.paused ? T.play : T.pause);
      clips.forEach(function (c) {
        var v = $('video', c);
        var visible = st.mode === 'compare' || c.getAttribute('data-v') === st.active;
        c.classList.toggle('is-active', visible);
        c.toggleAttribute('hidden', false);
        var shouldPlay = visible && st.inView && !st.paused && !document.hidden;
        if (shouldPlay) {
          if (v.preload !== 'auto') { v.preload = 'auto'; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }
    segment($('.seg', s2r), function (tab) { st.active = tab.getAttribute('data-v'); sync(); });
    playBtn.addEventListener('click', function () { st.paused = !st.paused; sync(); });
    modeBtn.addEventListener('click', function () {
      st.mode = st.mode === 'single' ? 'compare' : 'single';
      modeBtn.setAttribute('aria-pressed', st.mode === 'compare' ? 'true' : 'false');
      sync();
    });
    clips.forEach(function (c) {
      var v = $('video', c), t = $('.clip__time span', c);
      v.addEventListener('timeupdate', function () {
        if (v.duration) t.style.setProperty('--t', (v.currentTime / v.duration).toFixed(4));
      });
      // click on a video toggles play/pause
      v.addEventListener('click', function () { st.paused = !st.paused; sync(); });
    });
    if ('IntersectionObserver' in window) {
      // "in view" = any part of the player inside the middle 60% of the screen
      // (a ratio threshold fails when compare mode makes the player taller than a phone screen)
      new IntersectionObserver(function (en) { st.inView = en[0].isIntersecting; sync(); }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 }).observe(s2r);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  /* ---------- MEMO system map ---------- */
  var diagram = $('.sysmap__diagram');
  if (diagram) {
    var nodes = $$('.node', diagram), wires = $$('.wire', diagram);
    function selectNode(node, focus) {
      var key = node.getAttribute('data-node');
      nodes.forEach(function (n) {
        var on = n === node;
        n.setAttribute('aria-selected', on ? 'true' : 'false');
        n.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(n.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      wires.forEach(function (w) { w.classList.toggle('is-on', key === 'backend' || w.getAttribute('data-a') === key); });
      if (focus) node.focus();
      oled.run(key === 'glasses');
    }
    nodes.forEach(function (n, i) {
      n.addEventListener('click', function () { selectNode(n); });
      n.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? -1 : 0;
        if (d) { e.preventDefault(); selectNode(nodes[(i + d + nodes.length) % nodes.length], true); }
      });
    });
  }

  /* OLED typing demo (example output of the glasses) */
  var oled = (function () {
    var el = $('#oledText'), timer = null, running = false, inView = false;
    var msgs = ['scanning...', 'Youssef – Son'];
    var mi = 0;
    function type(str, cb) {
      var i = 0;
      el.textContent = '';
      (function tick() {
        if (!running) return;
        el.textContent = str.slice(0, ++i);
        if (i < str.length) timer = setTimeout(tick, 70); else timer = setTimeout(cb, mi === 1 ? 2600 : 1100);
      })();
    }
    function loop() { if (!running) return; type(msgs[mi], function () { mi = (mi + 1) % msgs.length; loop(); }); }
    var want = true;
    function update() {
      var go = want && inView && !reduceMotion;
      if (go && !running) { running = true; loop(); }
      if (!go && running) { running = false; clearTimeout(timer); el.textContent = msgs[1]; }
    }
    if (el && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; update(); }).observe(el);
    }
    return { run: function (v) { want = v; if (el) update(); } };
  })();
  if (diagram) { var firstNode = $('.node[aria-selected="true"]', diagram); if (firstNode) firstNode.click(); }

  /* ---------- gallery filter ---------- */
  var gal = $('#gal');
  if (gal) {
    var chips = $$('.filters .chip');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var f = c.getAttribute('data-filter');
        chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
        $$('.gal__item', gal).forEach(function (it) {
          var cats = it.getAttribute('data-cat').split(' ');
          var show = f === 'all' || cats.indexOf(f) > -1;
          it.classList.toggle('is-hidden', !show);
          if (show) { it.classList.add('in'); }
        });
      });
    });
  }

  /* ---------- AXIS toggles ---------- */
  var pf = $('#passFail');
  if (pf) segment($('.seg', pf), function (tab) {
    var k = tab.getAttribute('data-shot');
    pf.setAttribute('data-shot', k);
    $$('.toggle-shot__frame img', pf).forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-shot') === k); });
  });
  var cls = $('#classifier'), clsP = $('#clsP');
  var pOf = { ok: 'p(ok) = 0.96', loose: 'p(loose) = 1.00', missing: 'p(missing) = 1.00' };
  if (cls) {
    clsP.textContent = pOf.ok;
    segment($('.seg', cls), function (tab) {
      var k = tab.getAttribute('data-cls');
      $$('.classifier__frame img', cls).forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-cls') === k); });
      clsP.textContent = pOf[k];
    });
  }
  var geo = $('#geo');
  var geoData = ZH ? {
    ok:      { seen: '明亮的镜面反光屏蔽罩', cognex: ['合格', 'v-ok'], axis: ['合格', 'v-ok'], why: '基准情况：屏蔽罩已放置并压平。镜面般的金属把光直接反射回镜头。' },
    missing: { seen: '裸露的焊盘区域', cognex: ['可检出', 'v-ok'], axis: ['可检出 · 100%', 'v-ok'], why: '金属区域从图像中消失。Checker 本来就能发现这种情况，也不需要 AI：模型对此类的识别率为 100%。' },
    tilt:    { seen: '轮廓不变，区域变暗', cognex: ['误判为合格', 'v-bad'], axis: ['可检出 · 82%', 'v-ok'], why: '这正是产线上的真实缺陷。几度的倾斜就会把反射光偏离镜头，该区域随之变暗。Checker 的区域阈值无法利用这种纹理，而 CNN 能从像素中学到它。' },
    lift:    { seen: '与压平时完全相同', cognex: ['看不见', 'v-miss'], axis: ['看不见', 'v-miss'], why: '整体平行抬起时，轮廓几乎不变：约 1% 的尺度变化，在 376 像素宽的图像上不到 2 个像素。任何俯视相机都看不到这种情况，这是几何极限，而不是参数设置问题。' }
  } : {
    ok:      { seen: 'bright, specular shield', cognex: ['pass', 'v-ok'], axis: ['OK', 'v-ok'], why: 'The reference case: shield placed and pressed flat. Its mirror-like metal reflects light straight back into the lens.' },
    missing: { seen: 'bare footprint', cognex: ['detected', 'v-ok'], axis: ['detected · 100%', 'v-ok'], why: 'The metal footprint disappears from the image. The Checker already caught this, and it does not need AI: the model gets 100% on it.' },
    tilt:    { seen: 'contour unchanged, region goes dark', cognex: ['passes as good', 'v-bad'], axis: ['detected · 82%', 'v-ok'], why: 'The production defect. A few degrees of tilt deflect the reflection away from the lens, so the region collapses to dark. The Checker’s zone thresholds ignore that texture; the CNN learns it from pixels.' },
    lift:    { seen: 'identical to seated', cognex: ['not visible', 'v-miss'], axis: ['not visible', 'v-miss'], why: 'Lifted parallel, the contour barely changes: ~1% scale, under 2 px on a 376 px image. No top-down camera can see this case; it is a geometric limit, not a setting.' }
  };
  if (geo) segment($('.seg', geo), function (tab) {
    var k = tab.getAttribute('data-geo'), d = geoData[k];
    geo.setAttribute('data-state', k);
    $('#geoSeen').textContent = d.seen;
    var c = $('#geoCognex'), a = $('#geoAxis');
    c.textContent = d.cognex[0]; c.className = d.cognex[1];
    a.textContent = d.axis[0]; a.className = d.axis[1];
    $('#geoWhy').textContent = d.why;
  });

  /* ---------- lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var group = [], gi = 0;
  function show(i) {
    gi = (i + group.length) % group.length;
    var b = group[gi];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = $('img', b) ? $('img', b).alt : '';
    lbCap.textContent = b.getAttribute('data-caption') || '';
    $('#lbPrev').hidden = $('#lbNext').hidden = group.length < 2;
  }
  if (lb && lb.showModal) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.zoomable');
      if (!b) return;
      var scope = b.closest('.project') || document;
      group = $$('.zoomable', scope).filter(function (z) { return z.offsetParent !== null; });
      show(group.indexOf(b));
      lb.showModal();
    });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    $('#lbPrev').addEventListener('click', function () { show(gi - 1); });
    $('#lbNext').addEventListener('click', function () { show(gi + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(gi + 1);
      if (e.key === 'ArrowLeft') show(gi - 1);
    });
  }

  /* ---------- copy WeChat ---------- */
  var copyBtn = $('#copyWechat');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var txt = copyBtn.getAttribute('data-copy'), label = $('span', copyBtn);
    function done(ok) { label.textContent = ok ? T.copied : T.copyFail; setTimeout(function () { label.textContent = T.copy; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
    else done(false);
  });

  /* ---------- hero: digital pheromone field ----------
     Agents travel a city grid, deposit pheromone at intersections and
     follow it; the pointer acts as a demand source. Pauses off-screen. */
  var cv = $('#field');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d');
    var G = 46, W = 0, H = 0, cols = 0, rows = 0, dpr = 1;
    var pher = null, agents = [], ptr = { x: -1e4, y: -1e4, on: false };
    var col = {}, running = false, raf = 0, last = 0, visible = true;
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    function readColors() {
      var cs = getComputedStyle(root);
      col.accent = cs.getPropertyValue('--accent').trim() || '#ff5a24';
      col.ink = cs.getPropertyValue('--ink-3').trim() || '#777';
      col.light = root.getAttribute('data-theme') === 'light';
    }
    function size() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / G) + 1; rows = Math.ceil(H / G) + 1;
      pher = new Float32Array(cols * rows);
      var n = Math.round(Math.min(56, Math.max(18, (W * H) / 26000)));
      agents = [];
      for (var i = 0; i < n; i++) agents.push(spawn());
    }
    function spawn() {
      var cx = (Math.random() * cols) | 0, cy = (Math.random() * rows) | 0;
      var d = DIRS[(Math.random() * 4) | 0];
      return { cx: cx, cy: cy, dx: d[0], dy: d[1], t: Math.random(), sp: 0.012 + Math.random() * 0.014, trail: [], kind: Math.random() < 0.18 ? 1 : 0 };
    }
    function choose(a) {
      var best = null, total = 0, opts = [];
      for (var i = 0; i < 4; i++) {
        var d = DIRS[i], nx = a.cx + d[0], ny = a.cy + d[1];
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        var w = 1;
        if (d[0] === -a.dx && d[1] === -a.dy) w *= 0.12;
        w += pher[ny * cols + nx] * 3.2;
        if (ptr.on) {
          var px = ptr.x / G - a.cx, py = ptr.y / G - a.cy, len = Math.hypot(px, py) || 1;
          if (len < 9) w += Math.max(0, (d[0] * px + d[1] * py) / len) * 2.6;
        }
        opts.push([d, w]); total += w;
      }
      var r = Math.random() * total;
      for (var j = 0; j < opts.length; j++) { r -= opts[j][1]; if (r <= 0) { best = opts[j][0]; break; } }
      best = best || (opts[0] && opts[0][0]) || [0, 0];
      a.dx = best[0]; a.dy = best[1];
    }
    function step(dt) {
      var k = Math.min(3, dt / 16.7);
      for (var i = 0; i < pher.length; i++) pher[i] *= 0.994;
      for (var n = 0; n < agents.length; n++) {
        var a = agents[n];
        a.t += a.sp * k;
        if (a.t >= 1) {
          a.cx += a.dx; a.cy += a.dy; a.t -= 1;
          if (a.cx < 0 || a.cy < 0 || a.cx >= cols || a.cy >= rows) { agents[n] = spawn(); continue; }
          var idx = a.cy * cols + a.cx;
          pher[idx] = Math.min(1, pher[idx] + 0.16);
          choose(a);
        }
        var x = (a.cx + a.dx * a.t) * G, y = (a.cy + a.dy * a.t) * G;
        a.trail.push(x, y);
        if (a.trail.length > 36) a.trail.splice(0, 2);
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      // grid intersections
      ctx.fillStyle = col.ink;
      for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
        var p = pher[y * cols + x];
        ctx.globalAlpha = 0.14 + Math.min(0.5, p * 0.6);
        var s = 1.2 + p * 2.2;
        ctx.fillRect(x * G - s / 2, y * G - s / 2, s, s);
      }
      // pheromone halos
      ctx.fillStyle = col.accent;
      for (var i = 0; i < pher.length; i++) {
        var v = pher[i];
        if (v < 0.25) continue;
        ctx.globalAlpha = (v - 0.25) * (col.light ? 0.16 : 0.2);
        var cx = (i % cols) * G, cy = ((i / cols) | 0) * G;
        ctx.beginPath(); ctx.arc(cx, cy, 6 + v * 10, 0, 6.283); ctx.fill();
      }
      // trails + agents
      ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      for (var n = 0; n < agents.length; n++) {
        var a = agents[n], tr = a.trail, L = tr.length;
        if (L < 4) continue;
        var c = a.kind ? col.ink : col.accent;
        ctx.strokeStyle = c;
        for (var j = 2; j < L; j += 2) {
          ctx.globalAlpha = (j / L) * (a.kind ? 0.35 : 0.6);
          ctx.beginPath(); ctx.moveTo(tr[j - 2], tr[j - 1]); ctx.lineTo(tr[j], tr[j + 1]); ctx.stroke();
        }
        ctx.globalAlpha = a.kind ? 0.6 : 0.95;
        ctx.fillStyle = c;
        ctx.fillRect(tr[L - 2] - 2, tr[L - 1] - 2, 4, 4);
      }
      // demand marker at pointer
      if (ptr.on) {
        ctx.globalAlpha = 0.5; ctx.strokeStyle = col.accent; ctx.lineWidth = 1;
        var r = 10 + ((performance.now() / 18) % 26);
        ctx.beginPath(); ctx.arc(ptr.x, ptr.y, r, 0, 6.283); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function frame(now) {
      var dt = last ? now - last : 16.7; last = now;
      step(dt); draw();
      if (running) raf = requestAnimationFrame(frame);
    }
    function setRunning(v) {
      v = v && !reduceMotion;
      if (v === running) return;
      running = v; last = 0;
      if (v) raf = requestAnimationFrame(frame); else cancelAnimationFrame(raf);
    }
    readColors(); size();
    if (reduceMotion) { for (var w = 0; w < 400; w++) step(16.7); draw(); }
    themeListeners.push(function () { readColors(); if (!running) draw(); });
    var hero = $('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = e.pointerType === 'mouse';
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { ptr.on = false; });
    var rt = 0;
    addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (!running) draw(); }, 150); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; setRunning(visible && !document.hidden); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () { setRunning(visible && !document.hidden); });
    setRunning(true);
  }
})();
