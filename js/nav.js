/* header shadow + scroll progress + scrollspy + mobile drawer + back-to-top */
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var toTop = document.querySelector(".to-top");
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".nav-drawer");
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-primary a[href^="#"]'));

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) { var h = document.documentElement; var max = h.scrollHeight - h.clientHeight; progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%"; }
    if (toTop) toTop.classList.toggle("is-visible", y > window.innerHeight * 1.2);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    var r = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: r ? "auto" : "smooth" });
  });

  var sections = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false"); }); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  function open() { drawer.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); document.body.classList.add("nav-open"); }
  function close() { drawer.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("nav-open"); }
  function isOpen() { return drawer && drawer.classList.contains("is-open"); }
  if (toggle) toggle.addEventListener("click", function () { isOpen() ? close() : open(); });
  if (drawer) drawer.addEventListener("click", function (e) { if (e.target.closest('a[href^="#"]')) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) { close(); toggle.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1080 && isOpen()) close(); });
})();
