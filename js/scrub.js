/* 스크롤 스크럽 — 핀 고정 섹션에서 스크롤 진행도를 프레임 인덱스에 매핑해 캔버스에 drawImage.
   프레임 경로는 포스터 <img>.src 에서 유도(생성기가 src를 서브경로로 보정하므로 ko/en 모두 정확).
   reduce-motion / 데이터절약 / 캔버스 미지원 → 포스터 한 장 정적 표시. */
(function () {
  "use strict";
  var section = document.querySelector("[data-scrub]");
  if (!section) return;
  var canvas = section.querySelector(".scrub__canvas");
  var poster = section.querySelector(".scrub__poster");
  var stage = section.querySelector(".scrub__stage");
  var N = parseInt(section.getAttribute("data-frames"), 10) || 61;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var lite = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
  if (!canvas || !poster || reduce || lite || !canvas.getContext) {
    section.classList.add("scrub--static");
    return;
  }

  // 포스터 src(브라우저가 절대경로로 해석) → 프레임 베이스 경로
  var base = poster.currentSrc || poster.src;
  base = base.replace(/frame_\d+\.webp(\?.*)?$/, "");
  function frameURL(i) { return base + "frame_" + String(i).padStart(3, "0") + ".webp"; }

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var imgs = new Array(N), curIdx = -1, started = false;

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(curIdx < 0 ? 0 : curIdx, true);
  }
  function draw(i, force) {
    var im = imgs[i];
    if (!im || !im.complete || !im.naturalWidth) return;
    if (i === curIdx && !force) return;
    curIdx = i;
    var cw = stage.clientWidth, ch = stage.clientHeight;
    ctx.clearRect(0, 0, cw, ch);
    var s = Math.min(cw / im.naturalWidth, ch / im.naturalHeight); // contain
    var dw = im.naturalWidth * s, dh = im.naturalHeight * s;
    ctx.drawImage(im, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }
  function preload() {
    if (started) return; started = true;
    for (var i = 0; i < N; i++) (function (i) {
      var im = new Image(); im.decoding = "async";
      im.onload = function () { if (i === 0 || i === curIdx) draw(i, true); };
      im.src = frameURL(i); imgs[i] = im;
    })(i);
    poster.style.opacity = "0"; // 캔버스가 받음
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - stage.offsetHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      draw(Math.round(p * (N - 1)), false);
    });
  }

  // 섹션이 가까워지면 프리로드 시작(초기 로딩 비차단)
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { preload(); io.disconnect(); } });
    }, { rootMargin: "120% 0px 120% 0px" });
    io.observe(section);
  } else { preload(); }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("load", resize);
  resize();
})();
