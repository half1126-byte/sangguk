/* 스크롤 인터랙션 — 히어로 패럴럭스 + 부위 갤러리 드래그 스크롤.
   transform만 사용(컴포지터 친화), rAF 스로틀, prefers-reduced-motion 존중. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 히어로 패럴럭스: 배경 이미지가 스크롤보다 천천히 ---- */
  var img = document.querySelector(".hero__img");
  var hero = document.querySelector(".hero");
  if (img && hero && !reduce) {
    var ticking = false;
    function move() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var h = hero.offsetHeight;
      if (y <= h) img.style.transform = "translate3d(0," + (y * 0.18).toFixed(1) + "px,0) scale(1.12)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
    // 인트로 줌 애니메이션이 끝난 뒤(약 1.7s) 패럴럭스 시작값 적용
    setTimeout(move, 1700);
  }

  /* ---- 부위 갤러리: 데스크톱 마우스 드래그 스크롤 (터치는 네이티브) ---- */
  var cuts = document.querySelector(".cuts");
  if (cuts) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    cuts.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return; // 터치는 기본 스크롤
      down = true; moved = false; startX = e.clientX; startLeft = cuts.scrollLeft;
      cuts.classList.add("is-grabbing");
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      cuts.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () { down = false; cuts.classList.remove("is-grabbing"); });
    // 드래그 직후 링크/클릭 오발 방지
    cuts.addEventListener("click", function (e) { if (moved) { e.preventDefault(); } }, true);
  }
})();
