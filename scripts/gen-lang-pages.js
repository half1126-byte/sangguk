/* vanilla-i18n 스킬 생성기 — 단일 소스 index.html(ko) → /en. 의존성 0.
   콘텐츠/딕셔너리 수정 후 재실행:  node scripts/gen-lang-pages.js  */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.resolve(__dirname, ".."), SRC = path.join(ROOT, "index.html");
var ORIGIN = "https://half1126-byte.github.io/sangguk", BASE = "ko", LANGS = ["en"], GLOBAL = "I18N";

var win = {};
[BASE].concat(LANGS).forEach(function (l) { new Function("window", fs.readFileSync(path.join(ROOT, "i18n", l + ".js"), "utf8"))(win); });
var DICT = win[GLOBAL] || {};
function resolve(lang, key) {
  var v = DICT[lang] && DICT[lang][key]; if (v !== undefined && v !== null && v !== "") return v;
  var b = DICT[BASE] && DICT[BASE][key]; return (b !== undefined && b !== null && b !== "") ? b : null;
}
function escHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
function findClose(html, from, tag) {
  var re = new RegExp("<" + tag + "(?:\\s|>|/)|</" + tag + "\\s*>", "gi"); re.lastIndex = from; var d = 1, m;
  while ((m = re.exec(html)) !== null) { if (m[0].charAt(1) === "/") { if (--d === 0) return m.index; } else d++; }
  return -1;
}
function applyAttrSpec(openTag, spec, lang) {
  spec.split(";").forEach(function (pair) {
    var p = pair.split(":"); if (p.length !== 2) return;
    var attr = p[0].trim(), val = resolve(lang, p[1].trim()); if (val == null) return; val = escAttr(val);
    var re = new RegExp("(\\s" + attr + "\\s*=\\s*\")[^\"]*(\")");
    openTag = re.test(openTag) ? openTag.replace(re, "$1" + val + "$2") : openTag.replace(/\s*\/?>$/, function (e) { return ' ' + attr + '="' + val + '"' + e; });
  });
  return openTag;
}
function applyI18n(html, lang) {
  var tagRe = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, jobs = [], m;
  while ((m = tagRe.exec(html)) !== null) { if (m[0].indexOf("data-i18n") === -1) continue; jobs.push({ tag: m[1], openStart: m.index, openEnd: m.index + m[0].length, full: m[0] }); }
  for (var i = jobs.length - 1; i >= 0; i--) {
    var j = jobs[i];
    var hk = (/\sdata-i18n-html\s*=\s*"([^"]*)"/.exec(j.full) || [])[1];
    var ak = (/\sdata-i18n-attr\s*=\s*"([^"]*)"/.exec(j.full) || [])[1];
    var tk = (/\sdata-i18n\s*=\s*"([^"]*)"/.exec(j.full) || [])[1];
    var newOpen = ak ? applyAttrSpec(j.full, ak, lang) : j.full;
    if (hk || tk) {
      var c = findClose(html, j.openEnd, j.tag);
      if (c === -1) { html = html.slice(0, j.openStart) + newOpen + html.slice(j.openEnd); continue; }
      var v, inner;
      if (hk) { v = resolve(lang, hk); inner = v == null ? html.slice(j.openEnd, c) : v; }
      else { v = resolve(lang, tk); inner = v == null ? html.slice(j.openEnd, c) : escHtml(v); }
      html = html.slice(0, j.openStart) + newOpen + inner + html.slice(c);
    } else { html = html.slice(0, j.openStart) + newOpen + html.slice(j.openEnd); }
  }
  return html;
}
function replaceMeta(html, lang) {
  function set(re, r) { html = html.replace(re, r); }
  set(/<title>[\s\S]*?<\/title>/, "<title>" + escHtml(resolve(lang, "meta.title") || "") + "</title>");
  set(/(<meta name="description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.desc") || "") + "$2");
  set(/(<meta property="og:title" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogtitle") || "") + "$2");
  set(/(<meta property="og:description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogdesc") || "") + "$2");
  set(/(<meta property="og:locale" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.locale") || "") + "$2");
  set(/(<meta name="twitter:title" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogtitle") || "") + "$2");
  set(/(<meta name="twitter:description" content=")[^"]*(")/, "$1" + escAttr(resolve(lang, "meta.ogdesc") || "") + "$2");
  var u = ORIGIN + "/" + lang + "/", esc = ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  set(new RegExp('(<link rel="canonical" href=")' + esc + '\\/(")'), "$1" + u + "$2");
  set(new RegExp('(<meta property="og:url" content=")' + esc + '\\/(")'), "$1" + u + "$2");
  return html;
}
/* 서브경로(/sangguk/en/) 대응: 상대경로 자산 → ../ 로 (루트·서브경로 어디서나 작동) */
var rewriteAssets = function (h) { return h.replace(/(\s(?:href|src)=")(css\/|js\/|assets\/|i18n\/)/g, "$1../$2"); };

var src = fs.readFileSync(SRC, "utf8");
LANGS.forEach(function (lang) {
  var html = src.replace(new RegExp('<html lang="' + BASE + '">'), '<html lang="' + lang + '">');
  html = rewriteAssets(replaceMeta(applyI18n(html, lang), lang));
  fs.mkdirSync(path.join(ROOT, lang), { recursive: true });
  fs.writeFileSync(path.join(ROOT, lang, "index.html"), html);
  console.log(lang + "/index.html written");
});
console.log("done: " + LANGS.join(", "));
