/* vanilla-i18n engine (skill template) — ko base + en */
(function () {
  "use strict";
  var SUPPORTED = ["ko", "en"], BASE = "ko", STORAGE_KEY = "woodam_lang";
  var DICT = window.I18N || {};
  function getStored() { try { var v = localStorage.getItem(STORAGE_KEY); return SUPPORTED.indexOf(v) !== -1 ? v : null; } catch (e) { return null; } }
  function setStored(l) { try { localStorage.setItem(STORAGE_KEY, l); } catch (e) {} }
  function resolve(lang, key) {
    var v = DICT[lang] && DICT[lang][key]; if (v !== undefined && v !== null && v !== "") return v;
    var b = DICT[BASE] && DICT[BASE][key]; return (b !== undefined && b !== null && b !== "") ? b : null;
  }
  function setMeta(s, v) { if (v == null) return; var el = document.querySelector(s); if (el) el.setAttribute("content", v); }
  function urlFor(l) { return l === BASE ? "/" : "/" + l + "/"; }
  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = BASE;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) { var v = resolve(lang, el.getAttribute("data-i18n")); if (v !== null) el.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { var v = resolve(lang, el.getAttribute("data-i18n-html")); if (v !== null) el.innerHTML = v; });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (p) { var x = p.split(":"); if (x.length !== 2) return; var v = resolve(lang, x[1].trim()); if (v !== null) el.setAttribute(x[0].trim(), v); });
    });
    document.querySelectorAll(".lang-switcher button[data-lang]").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-lang") === lang ? "true" : "false"); });
    var t = resolve(lang, "meta.title"); if (t) document.title = t;
    setMeta('meta[name="description"]', resolve(lang, "meta.desc"));
    setMeta('meta[property="og:title"]', resolve(lang, "meta.ogtitle"));
    setMeta('meta[property="og:description"]', resolve(lang, "meta.ogdesc"));
    setMeta('meta[property="og:locale"]', resolve(lang, "meta.locale"));
    setStored(lang);
  }
  function switchLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    var cur = document.documentElement.getAttribute("lang");
    if (lang === cur) return;
    if (location.protocol === "http:" || location.protocol === "https:") {
      setStored(lang);
      // 상대 이동: base 페이지(루트)↔언어 서브폴더. 서브경로 배포에서도 작동.
      var dest = (cur === BASE) ? (lang === BASE ? "./" : lang + "/") : (lang === BASE ? "../" : "../" + lang + "/");
      location.assign(dest);
    } else applyLang(lang);
  }
  function init() {
    var hl = document.documentElement.getAttribute("lang");
    applyLang(SUPPORTED.indexOf(hl) !== -1 ? hl : (getStored() || BASE));
    document.querySelectorAll(".lang-switcher").forEach(function (sw) {
      sw.addEventListener("click", function (e) { var b = e.target.closest("button[data-lang]"); if (b) switchLang(b.getAttribute("data-lang")); });
    });
    window.setLang = applyLang;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
