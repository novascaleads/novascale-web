"use strict";

const isFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/*=================================================
  NAV SCROLL STATE + PROGRESS BAR
=================================================*/

const nav = document.getElementById("nav");
const scrollFill = document.getElementById("scroll-fill");

function onScroll(){
  if (window.scrollY > 40) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");

  const height = document.documentElement.scrollHeight - window.innerHeight;
  const pct = height > 0 ? (window.scrollY / height) * 100 : 0;
  scrollFill.style.width = pct + "%";
}
window.addEventListener("scroll", onScroll, { passive:true });
onScroll();

/*=================================================
  MOBILE MENU
=================================================*/

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobile-menu");

if (burger && mobileMenu){
  burger.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      burger.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });
}

/*=================================================
  CURSOR GLOW (desktop only)
=================================================*/

if (isFinePointer && !prefersReducedMotion){
  const glow = document.getElementById("cursor-glow");
  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
  let tx = gx, ty = gy;

  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });

  function loop(){
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
}

/*=================================================
  MAGNETIC BUTTONS
=================================================*/

if (isFinePointer && !prefersReducedMotion){
  document.querySelectorAll("[data-magnetic]").forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });
}

/*=================================================
  3D TILT CARDS
=================================================*/

if (isFinePointer && !prefersReducedMotion){
  const tiltStrong = document.querySelectorAll("[data-tilt]");
  const tiltSoft = document.querySelectorAll("[data-tilt-soft]");

  function bindTilt(el, maxDeg){
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const ry = (px - 0.5) * maxDeg * 2;
      const rx = (0.5 - py) * maxDeg * 2;
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
    });
    el.addEventListener("mouseleave", () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  }

  tiltStrong.forEach(el => bindTilt(el, 7));
  tiltSoft.forEach(el => bindTilt(el, 3.5));
}

/*=================================================
  SCROLL REVEAL (generic)
=================================================*/

const revealTargets = document.querySelectorAll(
  ".hero-copy, .hero-signal, .hstat, .method-step, .case-tag, .case-title, .case-intro, .case-panel, .metric-block, .terminal, .radar-wrap, .compare-grid, .section-title, .section-sub, .cta-inner"
);

revealTargets.forEach(el => el.classList.add("reveal"));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.15 });

revealTargets.forEach(el => revealObserver.observe(el));

/*=================================================
  HERO STAT COUNT-UP
=================================================*/

const heroStats = document.querySelectorAll(".hstat-num");

function animateCount(el){
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function tick(now){
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold:0.6 });

heroStats.forEach(el => statObserver.observe(el));

/*=================================================
  SIGNATURE ELEMENT — RANK CLIMB CHART
  Real data points: avg. position improving 42.9 -> 16.7
  across the 7-month engagement. Position is inverted for
  plotting so an *improving* rank reads as a rising line.
=================================================*/

const rankPositions = [42.9, 38.4, 33.1, 28.6, 24.2, 20.5, 18.1, 16.7];

function buildRankPath(){
  const w = 520, h = 220, padX = 10, padY = 18;
  const minPos = 16.7, maxPos = 42.9;

  const points = rankPositions.map((pos, i) => {
    const x = padX + (i / (rankPositions.length - 1)) * (w - padX * 2);
    const norm = (pos - minPos) / (maxPos - minPos);
    const y = padY + norm * (h - padY * 2);
    return { x, y };
  });

  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++){
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    line += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const area = `${line} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;
  return { line, area, last: points[points.length - 1] };
}

const rankLine = document.getElementById("rank-line");
const rankArea = document.getElementById("rank-area");
const rankDot = document.getElementById("rank-dot");

if (rankLine){
  const { line, area, last } = buildRankPath();
  rankLine.setAttribute("d", line);
  rankArea.setAttribute("d", area);
  rankDot.setAttribute("cx", last.x);
  rankDot.setAttribute("cy", last.y);

  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        rankLine.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)";
        rankLine.style.strokeDashoffset = "0";
        rankArea.style.transition = "opacity 1.2s ease 1s";
        rankArea.style.opacity = "1";
        rankDot.style.transition = "opacity .4s ease 1.5s";
        rankDot.style.opacity = "1";
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold:0.4 });

  chartObserver.observe(document.querySelector(".signal-chart"));
}

/*=================================================
  METRIC BARS — CASE STUDY 01
=================================================*/

const metricBars = document.querySelectorAll(".metric-bar");

const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const bar = entry.target;
    const before = parseFloat(bar.dataset.from);
    const after = parseFloat(bar.dataset.to);
    const max = parseFloat(bar.dataset.max);
    const isInverse = bar.classList.contains("metric-bar--inverse");

    const beforeEl = bar.querySelector(".metric-bar-before");
    const afterEl = bar.querySelector(".metric-bar-after");

    const beforePct = isInverse ? 1 : before / max;
    const afterPct  = isInverse ? (max - after) / max : after / max;

    requestAnimationFrame(() => {
      beforeEl.style.transition = "transform 1.1s cubic-bezier(.16,1,.3,1)";
      afterEl.style.transition  = "transform 1.1s cubic-bezier(.16,1,.3,1) .25s";
      beforeEl.style.transform = `scaleX(${Math.min(1, beforePct)})`;
      afterEl.style.transform  = `scaleX(${Math.min(1, afterPct)})`;
    });

    barObserver.unobserve(bar);
  });
}, { threshold:0.5 });

metricBars.forEach(bar => barObserver.observe(bar));

/*=================================================
  TERMINAL — SEQUENTIAL LINE REVEAL
=================================================*/

const terminalBody = document.getElementById("terminal-body");

if (terminalBody){
  const lines = terminalBody.querySelectorAll(".t-line");

  const terminalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add("t-show"), i * 420);
      });
      terminalObserver.unobserve(entry.target);
    });
  }, { threshold:0.5 });

  terminalObserver.observe(terminalBody);
}

/*=================================================
  RADAR STATUS — SCANNING -> ENTITY LIVE
=================================================*/

const radarStatus = document.getElementById("radar-status");

if (radarStatus){
  const radarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        radarStatus.textContent = "ENTITY LIVE";
        radarStatus.style.color = "#2DD9A8";
      }, 2200);
      radarObserver.unobserve(entry.target);
    });
  }, { threshold:0.5 });

  radarObserver.observe(radarStatus);
}

console.log("%cNovaScaleAds", "color:#E8A33D;font-size:16px;font-weight:700;font-family:monospace;");



