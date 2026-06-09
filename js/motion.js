/* static-motion: reveal-on-scroll (skill template) */
(function () {
  "use strict";
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], [data-stagger]"));
  if (!items.length) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-visible"); }); return; }
  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
