/* IKOM Productions v2 — interaction and motion.
   The page reads completely without this file; everything here is the lighting. */
(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });

  root.classList.remove("no-motion");
  root.classList.add("js");
  const year = $("[data-year]"); if (year) year.textContent = new Date().getFullYear();
  const progress = document.createElement("div"); progress.className = "progress"; progress.setAttribute("aria-hidden", "true"); document.body.appendChild(progress);

  /* ---------- header + menu ---------- */
  const header = $(".site-header"), menuBtn = $(".menu-btn");
  const setMenu = (open) => { header.classList.toggle("open", open); root.classList.toggle("menu-open", open); if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start(); menuBtn.setAttribute("aria-expanded", String(open)); menuBtn.textContent = open ? "Close" : "Menu"; };
  menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 40), { passive: true });

  /* =========================================================
     RIG — moving-head beams on a 2D canvas (additive light)
     ========================================================= */
  function Rig(canvas) {
    const ctx = canvas.getContext("2d");
    const finale = canvas.dataset.rigMode === "finale";
    const host = canvas.parentElement;
    const gels = [[223, 187, 107], [198, 140, 60], [255, 238, 205]];
    let w = 0, h = 0, dpr = 1, beams = [], flash = 0, running = false, t0 = performance.now(), aim = null;
    const logo = finale ? null : host.querySelector("[data-logo-stage]"); let lastLit = "";
    const haze = Array.from({ length: 7 }, () => ({ x: Math.random(), y: Math.random(), r: .25 + Math.random() * .35, s: .02 + Math.random() * .04, p: Math.random() * 6 }));

    function build() {
      const n = w < 700 ? 5 : finale ? 10 : 8;
      beams = Array.from({ length: n }, (_, i) => {
        const u = (i + .5) / n;
        return {
          u, gel: gels[i % 2 === 0 ? 0 : 1], lead: !finale && (i === Math.floor(n / 2) || i === Math.floor(n / 2) - 1),
          base: (finale ? 0 : (u - .5) * -.7), sweep: .35 + Math.random() * .25, speed: .35 + Math.random() * .4, phase: Math.random() * 6.28,
          width: finale ? .07 + Math.random() * .05 : .045 + Math.random() * .035, ang: 0,
        };
      });
      if (finale) beams.forEach((b, i) => { if (i % 3 === 2) b.gel = gels[2]; });
    }
    function size() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function beam(ox, oy, ang, spread, rgb, alpha) {
      const L = Math.hypot(w, h) * 1.2;
      const dx = Math.sin(ang), dy = finale ? -Math.cos(ang) : Math.cos(ang);
      const nx = -dy, ny = dx;
      const ex = ox + dx * L, ey = oy + dy * L;
      const half = Math.tan(spread) * L;
      const g = ctx.createLinearGradient(ox, oy, ox + dx * L * .8, oy + dy * L * .8);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(.45, `rgba(${rgb},${alpha * .35})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(ox + nx * 4, oy + ny * 4); ctx.lineTo(ex + nx * half, ey + ny * half); ctx.lineTo(ex - nx * half, ey - ny * half); ctx.lineTo(ox - nx * 4, oy - ny * 4); ctx.closePath(); ctx.fill();
    }
    const dust = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, v: .004 + Math.random() * .012, p: Math.random() * 6.28, s: .6 + Math.random() * 1.6 }));
    function deco(t, rect, px, py, inside) {
      const ox = w / 2, oy = logo ? (logo.getBoundingClientRect().top - rect.top + logo.offsetHeight / 2) : h * .45;
      const R = Math.hypot(w, h) * .62, gold = "223,187,107";
      // art-deco sunburst, slowly turning
      const n = 56, rot = t * .015;
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2, long = i % 2 === 0, r0 = Math.min(w, h) * (long ? .22 : .3), r1 = R * (long ? 1 : .7), sp = long ? .011 : .006;
        const g = ctx.createRadialGradient(ox, oy, r0, ox, oy, r1);
        g.addColorStop(0, `rgba(${gold},${long ? .09 : .06})`); g.addColorStop(1, `rgba(${gold},0)`);
        ctx.fillStyle = g; ctx.beginPath();
        ctx.moveTo(ox + Math.cos(a - sp * .3) * r0, oy + Math.sin(a - sp * .3) * r0);
        ctx.lineTo(ox + Math.cos(a - sp) * r1, oy + Math.sin(a - sp) * r1);
        ctx.lineTo(ox + Math.cos(a + sp) * r1, oy + Math.sin(a + sp) * r1);
        ctx.lineTo(ox + Math.cos(a + sp * .3) * r0, oy + Math.sin(a + sp * .3) * r0); ctx.closePath(); ctx.fill();
      }
      // concentric hairline rings
      const base = Math.min(w, h);
      ctx.lineWidth = 1;
      [.36, .44, .58].forEach((k, i) => { ctx.strokeStyle = `rgba(${gold},${.16 - i * .04})`; ctx.beginPath(); ctx.arc(ox, oy, base * k, 0, Math.PI * 2); ctx.stroke(); });
      ctx.save(); ctx.setLineDash([2, 10]); ctx.lineDashOffset = -t * 6; ctx.strokeStyle = `rgba(${gold},.28)`; ctx.beginPath(); ctx.arc(ox, oy, base * .5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      // tick marks on the outer ring, like a dial
      for (let i = 0; i < 72; i++) { const a = -rot * 2 + (i / 72) * Math.PI * 2, r = base * .58, l = i % 6 === 0 ? 10 : 4; ctx.strokeStyle = `rgba(${gold},${i % 6 === 0 ? .35 : .15})`; ctx.beginPath(); ctx.moveTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r); ctx.lineTo(ox + Math.cos(a) * (r + l), oy + Math.sin(a) * (r + l)); ctx.stroke(); }
      // warm core glow
      const cg = ctx.createRadialGradient(ox, oy, 0, ox, oy, base * .42);
      cg.addColorStop(0, `rgba(${gold},${.16 + flash * .3})`); cg.addColorStop(1, `rgba(${gold},0)`);
      ctx.fillStyle = cg; ctx.fillRect(0, 0, w, h);
      // floating gold dust
      dust.forEach((d) => {
        d.y -= d.v / 60 * (1 + flash * 6); if (d.y < -.02) { d.y = 1.02; d.x = Math.random(); }
        const x = (d.x + Math.sin(t * .3 + d.p) * .01) * w, y = d.y * h, a = (.25 + .75 * Math.max(0, Math.sin(t * d.s + d.p))) * .8;
        const g = ctx.createRadialGradient(x, y, 0, x, y, d.r * 4);
        g.addColorStop(0, `rgba(255,232,170,${a})`); g.addColorStop(1, "rgba(255,232,170,0)");
        ctx.fillStyle = g; ctx.fillRect(x - d.r * 4, y - d.r * 4, d.r * 8, d.r * 8);
      });
      // light follows the pointer
      if (inside && fine) { const pg = ctx.createRadialGradient(px, py, 0, px, py, 220); pg.addColorStop(0, `rgba(${gold},.12)`); pg.addColorStop(1, `rgba(${gold},0)`); ctx.fillStyle = pg; ctx.fillRect(px - 220, py - 220, 440, 440); }
    }
    function draw(now) {
      const t = (now - t0) / 1000;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = finale ? "#05060a" : "#000"; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      // haze
      haze.forEach((z) => {
        const x = (z.x + Math.sin(t * z.s + z.p) * .08) * w, y = (z.y + Math.cos(t * z.s * 1.3 + z.p) * .06) * h, r = z.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, finale ? "rgba(90,100,150,0.06)" : "rgba(255,255,255,0.025)"); g.addColorStop(1, finale ? "rgba(90,100,150,0)" : "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      const rect = host.getBoundingClientRect();
      const px = pointer.x - rect.left, py = pointer.y - rect.top;
      const inside = px > 0 && py > 0 && px < w && py < h;
      if (!finale) deco(t, rect, px, py, inside);
      if (finale) beams.forEach((b, i) => {
        const ox = b.u * w, oy = finale ? h + 10 : -10;
        let target = b.base + Math.sin(t * b.speed + b.phase) * b.sweep;
        if (b.lead && inside && fine) target = Math.atan2(px - ox, py - oy);
        if (!finale && inside && fine && !b.lead) target = target * .6 + Math.atan2(px - ox, py - oy) * .4;
        b.ang += (target - b.ang) * .06;
        const a = (finale ? .22 : .15) + flash * .35;
        const rgb = b.gel.join(",");
        beam(ox, oy, b.ang, b.width * (1 + flash * .8), rgb, a);
        beam(ox, oy, b.ang, b.width * .35, rgb, a * 1.3);
        // fixture lens
        const lg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 40);
        lg.addColorStop(0, `rgba(${rgb},.9)`); lg.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = lg; ctx.fillRect(ox - 40, oy - 40, 80, 80);
      });
      if (logo) {
        const lr = logo.getBoundingClientRect(), lx = lr.left - rect.left, ly = lr.top - rect.top, cx = lx + lr.width / 2, cy = ly + lr.height / 2;
        const spots = [];
        const cyc = (t % 7) / 7, sx = (-.4 + cyc * 1.8) * lr.width;
        if (cyc < .62) spots.push(`linear-gradient(110deg, transparent ${(sx - lr.width * .18).toFixed(0)}px, #000 ${(sx - lr.width * .04).toFixed(0)}px, #000 ${(sx + lr.width * .04).toFixed(0)}px, transparent ${(sx + lr.width * .18).toFixed(0)}px)`);
        if (inside && fine) spots.push(`radial-gradient(${(lr.width * .32).toFixed(0)}px ${(lr.width * .32).toFixed(0)}px at ${(px - lx).toFixed(0)}px ${(py - ly).toFixed(0)}px, #000 0, #000 35%, transparent 100%)`);
        if (flash > .15) spots.push("linear-gradient(#000, #000)");
        const v = spots.length ? spots.join(",") : "linear-gradient(transparent, transparent)";
        if (v !== lastLit) { logo.style.setProperty("--lit", v); lastLit = v; }
      }
      if (flash > .01) { ctx.fillStyle = `rgba(255,240,212,${flash * .55})`; ctx.fillRect(0, 0, w, h); flash *= .86; }
      // floor fade so the copy stays readable
      ctx.globalCompositeOperation = "source-over";
      const fg = finale ? ctx.createLinearGradient(0, 0, 0, h * .4) : ctx.createLinearGradient(0, h, 0, h * .55);
      fg.addColorStop(0, finale ? "rgba(5,6,10,.9)" : "rgba(0,0,0,.9)"); fg.addColorStop(1, finale ? "rgba(5,6,10,0)" : "rgba(0,0,0,0)");
      ctx.fillStyle = fg; ctx.fillRect(0, 0, w, h);
    }
    function loop(now) { if (!running) return; draw(now); requestAnimationFrame(loop); }
    size();
    addEventListener("resize", size);
    host.addEventListener("pointerdown", (e) => { if (e.target.closest("a,button")) return; flash = 1; });
    if (reduced) { draw(performance.now()); addEventListener("resize", () => draw(performance.now())); return; }
    new IntersectionObserver(([en]) => { const was = running; running = en.isIntersecting; if (running && !was) requestAnimationFrame(loop); }).observe(host);
  }
  $$("[data-rig]").forEach((c) => Rig(c));

  /* ---------- cursor follow-light ---------- */
  const spot = $(".spot");
  if (fine && !reduced && spot) {
    let sx = pointer.x, sy = pointer.y;
    spot.classList.add("on");
    (function tick() { sx += (pointer.x - sx) * .18; sy += (pointer.y - sy) * .18; spot.style.transform = `translate3d(${sx}px,${sy}px,0)`; requestAnimationFrame(tick); })();
    document.addEventListener("pointerover", (e) => spot.classList.toggle("big", !!e.target.closest("button, a, [data-lb], .desk, .reel")));
  }

  /* ---------- lighting desk ---------- */
  const desk = $("[data-desk]"), live = $("[data-live]"), allBtn = $("[data-desk-all]");
  if (desk) {
    const keys = $$("button", desk);
    const count = () => { const n = keys.filter((k) => k.getAttribute("aria-pressed") === "true").length; if (live) live.textContent = n; allBtn.textContent = n === keys.length ? "Fade to black" : "Bring all channels up"; };
    keys.forEach((k) => k.addEventListener("click", () => { k.setAttribute("aria-pressed", String(k.getAttribute("aria-pressed") !== "true")); count(); }));
    allBtn.addEventListener("click", () => {
      const on = keys.some((k) => k.getAttribute("aria-pressed") !== "true");
      keys.forEach((k, i) => setTimeout(() => { k.setAttribute("aria-pressed", String(on)); count(); }, reduced ? 0 : i * 55));
    });
  }

  /* ---------- corporate filters ---------- */
  const filters = $$("[data-filter]"), corp = $$("[data-corp] figure");
  filters.forEach((b) => b.addEventListener("click", () => {
    filters.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const f = b.dataset.filter;
    corp.forEach((fig) => fig.classList.toggle("dim", f !== "all" && fig.dataset.kind !== f));
  }));

  /* ---------- pointer tilt (corporate cards, features, pass) ---------- */
  function tilt(el, target, amt, glare) {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      target.style.transform = `perspective(900px) rotateX(${-y * amt}deg) rotateY(${x * amt}deg) translateZ(10px)`;
      if (glare) { target.style.setProperty("--gx", (x + .5) * 100 + "%"); target.style.setProperty("--gy", (y + .5) * 100 + "%"); }
    });
    el.addEventListener("pointerleave", () => (target.style.transform = ""));
  }
  if (fine && !reduced) {
    corp.forEach((f) => tilt(f, f, 10));
    $$("[data-tilt]").forEach((f) => tilt(f, f.querySelector("img"), 8));
    const pw = $("[data-pass]"); if (pw) tilt(pw, $(".pass", pw), 22, true);
  }

  /* ---------- hover list preview ---------- */
  const hl = $("[data-hover-list]"), hp = $("[data-hover-preview]");
  if (hl && hp && fine) {
    const img = $("img", hp); let px = 0, py = 0, on = false;
    $$("li", hl).forEach((li) => {
      li.addEventListener("pointerenter", () => { if (!li.dataset.img) return; img.src = li.dataset.img; hp.classList.add("on"); on = true; });
      li.addEventListener("pointerleave", () => { hp.classList.remove("on"); on = false; });
    });
    (function tick() { px += (pointer.x + 170 - px) * .14; py += (pointer.y - py) * .14; if (on || hp.classList.contains("on")) { hp.style.left = px + "px"; hp.style.top = py + "px"; } requestAnimationFrame(tick); })();
  }

  if (hl && !fine) $$("li[data-img]", hl).forEach((li) => { const t = document.createElement("img"); t.className = "hl-thumb"; t.src = li.dataset.img; t.alt = ""; t.loading = "lazy"; li.appendChild(t); });


  /* ---------- artist slider ---------- */
  const slider = $("[data-slider]");
  if (slider) {
    const track = $("[data-slider-track]", slider), slides = $$("figure", track), dotsWrap = $("[data-slider-dots]", slider);
    const MS = 4000; slider.style.setProperty("--slide-ms", MS + "ms");
    let idx = 0, timer = null, hover = false, inView = false, dragging = false;
    const dots = slides.map((_, i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", "Photo " + (i + 1)); b.addEventListener("click", () => { go(i); restart(); }); dotsWrap.appendChild(b); return b; });
    const maxIdx = () => { let m = 0; slides.forEach((f, i) => { if (f.offsetLeft - slides[0].offsetLeft <= track.scrollWidth - track.clientWidth + 2) m = i; }); return m; };
    const mark = (i) => dots.forEach((d, k) => d.setAttribute("aria-selected", String(k === i)));
    function go(i) { const m = maxIdx(); idx = i > m ? 0 : i < 0 ? m : i; track.scrollTo({ left: slides[idx].offsetLeft - slides[0].offsetLeft, behavior: reduced ? "auto" : "smooth" }); mark(idx); }
    function restart() { clearInterval(timer); timer = null; mark(idx); if (reduced || hover || !inView) { slider.classList.add(reduced ? "static" : "paused"); return; } slider.classList.remove("paused"); dots[idx].replaceWith(dots[idx]); const d = dots[idx]; d.setAttribute("aria-selected", "false"); void d.offsetWidth; d.setAttribute("aria-selected", "true"); timer = setInterval(() => go(idx + 1), MS); }
    $("[data-slider-prev]", slider).addEventListener("click", () => { go(idx - 1); restart(); });
    $("[data-slider-next]", slider).addEventListener("click", () => { go(idx + 1); restart(); });
    track.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); restart(); } if (e.key === "ArrowLeft") { e.preventDefault(); go(idx - 1); restart(); } });
    // keep the active dot in step with swipes and trackpad scrolls
    let st; track.addEventListener("scroll", () => { clearTimeout(st); st = setTimeout(() => { const x = track.scrollLeft; let best = 0, bd = 1e9; slides.forEach((f, i) => { const d = Math.abs(f.offsetLeft - slides[0].offsetLeft - x); if (d < bd) { bd = d; best = i; } }); if (best !== idx) { idx = best; restart(); } }, 120); }, { passive: true });
    slider.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { hover = true; restart(); } });
    slider.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hover = false; restart(); } });
    slider.addEventListener("focusin", () => { hover = true; restart(); });
    slider.addEventListener("focusout", () => { hover = false; restart(); });
    track.addEventListener("touchstart", () => { hover = true; restart(); }, { passive: true });
    track.addEventListener("touchend", () => { setTimeout(() => { hover = false; restart(); }, 2500); }, { passive: true });
    // mouse drag on desktop
    let sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; dragging = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("dragging"); });
    addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; track.scrollLeft = sl - dx; });
    addEventListener("pointerup", () => { if (!dragging) return; dragging = false; track.classList.remove("dragging"); const x = track.scrollLeft; let best = 0, bd = 1e9; slides.forEach((f, i) => { const d = Math.abs(f.offsetLeft - slides[0].offsetLeft - x); if (d < bd) { bd = d; best = i; } }); go(best); restart(); });
    track.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; restart(); }, { threshold: .35 }).observe(slider);
    mark(0);
  }

  /* ---------- follow-spot over the concert wall ---------- */
  const fs = $("[data-followspot]");
  if (fs) {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "desk-all"; btn.textContent = "Bring the house lights up"; btn.setAttribute("aria-pressed", "false");
    $("#concerts .wrap").appendChild(btn);
    btn.addEventListener("click", () => { const lit = !fs.classList.contains("lit"); fs.classList.toggle("lit", lit); btn.setAttribute("aria-pressed", String(lit)); btn.textContent = lit ? "House lights down" : "Bring the house lights up"; });
    let fx = .5, fy = .4, tx = .5, ty = .4, manual = false, idle = 0;
    fs.addEventListener("pointermove", (e) => { const r = fs.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; manual = true; idle = 0; });
    fs.addEventListener("pointerleave", () => (manual = false));
    fs.addEventListener("touchmove", (e) => { const t = e.touches[0], r = fs.getBoundingClientRect(); tx = (t.clientX - r.left) / r.width; ty = (t.clientY - r.top) / r.height; manual = true; }, { passive: true });
    fs.addEventListener("touchend", () => setTimeout(() => (manual = false), 1500));
    const setR = () => fs.style.setProperty("--r", (fine ? Math.max(160, Math.min(innerWidth * .22, 300)) : Math.max(170, innerWidth * .48)) + "px");
    setR(); addEventListener("resize", setR);
    if (!reduced) (function tick(now) {
      if (!manual) { idle += 1; const s = now / 1000; tx = .5 + Math.sin(s * .45) * .38; ty = .45 + Math.sin(s * .7) * .32; }
      fx += (tx - fx) * .09; fy += (ty - fy) * .09;
      fs.style.setProperty("--x", fx * 100 + "%"); fs.style.setProperty("--y", fy * 100 + "%");
      requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ---------- client flipboard: two tiles swap logos with a split-flap turn ---------- */
  const fb = $$("[data-flipboard] li");
  if (fb.length > 1 && !reduced) {
    const flip = (li, src, alt) => {
      const im = $("img", li);
      li.animate([{ transform: "rotateX(0)" }, { transform: "rotateX(90deg)" }], { duration: 260, easing: "ease-in" }).onfinish = () => {
        im.src = src; im.alt = alt;
        li.animate([{ transform: "rotateX(-90deg)" }, { transform: "rotateX(0)" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    };
    setInterval(() => {
      if (document.hidden) return;
      const a = fb[Math.floor(Math.random() * fb.length)]; let b = a; while (b === a) b = fb[Math.floor(Math.random() * fb.length)];
      const ia = $("img", a), ib = $("img", b), sa = [ia.src, ia.alt], sb = [ib.src, ib.alt];
      flip(a, sb[0], sb[1]); setTimeout(() => flip(b, sa[0], sa[1]), 140);
    }, 2200);
  }

  /* ---------- lightbox ---------- */
  const dlg = $("[data-lightbox]");
  const shots = $$("img[data-lb]");
  let cur = 0, dragMoved = false;
  const show = (i) => { cur = (i + shots.length) % shots.length; const s = shots[cur]; $("[data-lb-img]").src = s.currentSrc || s.src; $("[data-lb-img]").alt = s.alt; $("[data-lb-cap]").textContent = s.alt; };
  if (dlg && dlg.showModal) {
    shots.forEach((s, i) => s.addEventListener("click", () => { if (dragMoved) return; show(i); dlg.showModal(); }));
    $("[data-lb-prev]").addEventListener("click", () => show(cur - 1));
    $("[data-lb-next]").addEventListener("click", () => show(cur + 1));
    $("[data-lb-close]").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1); });
  }

  /* ---------- film reel: drag with inertia, frames curve on a drum ---------- */
  const reel = $("[data-reel]"), track = $("[data-reel-track]");
  let reelScrollOffset = 0;
  if (reel && track) {
    const frames = $$("figure", track);
    let x = 0, v = 0, down = false, lastX = 0, startX = 0, min = 0;
    const bounds = () => { min = Math.min(0, reel.clientWidth - track.scrollWidth); };
    bounds(); addEventListener("resize", bounds);
    reel.addEventListener("pointerdown", (e) => { down = true; dragMoved = false; lastX = startX = e.clientX; v = 0; reel.setPointerCapture(e.pointerId); });
    reel.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - lastX; lastX = e.clientX; x += dx; v = dx; if (Math.abs(e.clientX - startX) > 6) dragMoved = true; });
    const up = () => { down = false; setTimeout(() => (dragMoved = false), 0); };
    reel.addEventListener("pointerup", up); reel.addEventListener("pointercancel", up);
    reel.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") v -= 28; if (e.key === "ArrowLeft") v += 28; });
    reel.addEventListener("wheel", (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); v -= e.deltaX * .3; } }, { passive: false });
    (function tick() {
      if (!down) { x += v; v *= .93; }
      const target = Math.max(min, Math.min(0, x + reelScrollOffset));
      if (!down && (x + reelScrollOffset > 0 || x + reelScrollOffset < min)) x += (target - (x + reelScrollOffset)) * .15;
      const pos = Math.max(min - 120, Math.min(120, x + reelScrollOffset));
      track.style.transform = `translate3d(${pos}px,0,0)`;
      if (!reduced) {
        const mid = innerWidth / 2;
        frames.forEach((f) => {
          const r = f.getBoundingClientRect(); const d = (r.left + r.width / 2 - mid) / mid;
          const k = Math.max(-1.2, Math.min(1.2, d)); f.style.transform = `rotateY(${(k * -16).toFixed(2)}deg)`;
          f.style.setProperty("--dim", Math.min(.5, Math.abs(k) * .4).toFixed(3));
        });
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- scroll choreography (GSAP) ---------- */
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true }); window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); const target = id === "#top" ? 0 : $(id);
    if (target === null) return;
    e.preventDefault(); setMenu(false);
    if (lenis) lenis.scrollTo(target, { duration: 1.3 }); else scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY, behavior: reduced ? "auto" : "smooth" });
  }));

  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => (progress.style.transform = `scaleX(${s.progress})`) });

  const navLinks = $$(".site-nav a");
  navLinks.forEach((a) => { const sec = $(a.getAttribute("href")); if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => { if (s.isActive) navLinks.forEach((l) => l.setAttribute("aria-current", String(l === a))); } }); });

  if (reduced) return;

  /* hero entrance + exit */
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from(".logo-stage", { scale: .4, opacity: 0, rotate: -20, duration: 1.4 })
    .from(".hero-eyebrow, .hero-tag, .hero-hint", { y: 20, opacity: 0, duration: 1, stagger: .1 }, "-=.9")
    .from(".hero-facts div", { y: 30, opacity: 0, duration: .9, stagger: .07 }, "-=.8");
  gsap.to(".hero-inner", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ticker: endless, speeds up with scroll velocity and flips direction */
  const tk = $("[data-ticker]");
  if (tk) {
    tk.innerHTML += tk.innerHTML;
    let tx = 0, dir = -1, boost = 0;
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; boost = Math.min(12, Math.abs(s.getVelocity()) / 220); } });
    gsap.ticker.add(() => { const half = tk.scrollWidth / 2; tx += dir * (1.2 + boost); boost *= .94; if (tx <= -half) tx += half; if (tx > 0) tx -= half; tk.style.transform = `translate3d(${tx}px,0,0)`; });
  }

  /* section titles: letters scramble into place like a split-flap board */
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#&!";
  $$("[data-scramble]").forEach((el) => {
    const final = el.textContent; el.setAttribute("aria-label", final);
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => {
      const o = { p: 0 };
      gsap.to(o, { p: 1, duration: 1.1, ease: "power2.out", onUpdate: () => {
        const n = Math.floor(o.p * final.length);
        el.textContent = final.slice(0, n) + [...final.slice(n)].map((c) => (c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      }, onComplete: () => (el.textContent = final) });
    } });
  });

  /* profile paragraph lights up word by word as you read */
  const big = $("[data-words]");
  if (big) {
    big.innerHTML = big.textContent.split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
    gsap.fromTo($$(".w", big), { color: "#3a3d4d" }, { color: "#ecd9a8", stagger: .05, ease: "none", scrollTrigger: { trigger: big, start: "top 80%", end: "bottom 45%", scrub: true } });
  }

  gsap.from("#specialize .desk li", { y: 40, opacity: 0, rotateX: -50, transformOrigin: "50% 0", stagger: { each: .04, from: "start" }, duration: .9, ease: "expo.out", scrollTrigger: { trigger: "#specialize .desk", start: "top 85%" } });
  gsap.from(".board li", { scale: .6, opacity: 0, stagger: .03, duration: .6, ease: "back.out(2)", scrollTrigger: { trigger: ".board", start: "top 88%" } });
  gsap.from(".hover-list li", { x: -60, opacity: 0, stagger: .07, duration: .9, ease: "expo.out", scrollTrigger: { trigger: ".hover-list", start: "top 85%" } });

  /* reel also drifts as the page scrolls past it */
  if (reel) ScrollTrigger.create({ trigger: reel, start: "top bottom", end: "bottom top", onUpdate: (s) => (reelScrollOffset = -s.progress * Math.min(900, track.scrollWidth * .35)) });

  /* photos open like a shutter as they arrive */
  $$(".fs-grid figure, .corp-grid figure, .yoga figure, .tilt").forEach((f) => {
    gsap.fromTo(f, { clipPath: "inset(18% 18% 18% 18%)", opacity: 0 }, { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: f, start: "top 92%" } });
  });

  gsap.from(".flipboard li", { rotateX: -90, opacity: 0, stagger: { each: .05, from: "random" }, duration: .9, ease: "expo.out", scrollTrigger: { trigger: ".flipboard", start: "top 85%" } });
  gsap.from(".pass", { rotateY: -70, rotateX: 15, y: 80, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".pass", start: "top 85%" } });
  gsap.fromTo(".finale-h", { scale: .5, opacity: 0, letterSpacing: ".3em" }, { scale: 1, opacity: 1, letterSpacing: "0em", ease: "none", scrollTrigger: { trigger: ".finale", start: "top 85%", end: "center center", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();

/* hero frame stops above the facts strip */
(() => {
  const hero = document.querySelector(".hero"), facts = document.querySelector(".hero-facts");
  if (!hero || !facts) return;
  const set = () => hero.style.setProperty("--facts-h", facts.offsetHeight + "px");
  set(); addEventListener("resize", set);
})();

/* contact form: validates, then opens an email draft with the details filled in */
(() => {
  const form = document.querySelector("[data-contact-form]"), sec = document.getElementById("contact");
  if (!form || !sec) return;
  const note = form.querySelector("[data-cf-note]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let bad = null;
    form.querySelectorAll("[required]").forEach((el) => { const ok = el.value.trim() && (el.type !== "email" || /.+@.+\..+/.test(el.value)); el.setAttribute("aria-invalid", ok ? "false" : "true"); if (!ok && !bad) bad = el; });
    if (bad) { note.textContent = "Please add your name and a valid email."; bad.focus(); return; }
    const f = Object.fromEntries(new FormData(form));
    const subject = `Event enquiry: ${f.type} — ${f.name}`;
    const body = [`Name: ${f.name}`, `Phone: ${f.phone || "-"}`, `Email: ${f.email}`, `Planning: ${f.type}`, `Event date: ${f.date || "-"}`, "", f.message || ""].join("\n");
    location.href = `mailto:${sec.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Your email app should open now. If it doesn't, write to " + sec.dataset.email + ".";
  });
})();
