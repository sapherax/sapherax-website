(function () {
  "use strict";

  function initGalleries() {
    var galleries = document.querySelectorAll(".product-gallery");
    for (var g = 0; g < galleries.length; g++) {
      (function (gallery) {
        var mainImg = gallery.querySelector(".gallery-main img");
        var thumbs = gallery.querySelectorAll(".gallery-thumbs img");
        if (!mainImg || thumbs.length === 0) return;
        var idx = 0;
        var timer = null;

        function show(i) {
          idx = i;
          var full = thumbs[i].getAttribute("data-full");
          mainImg.src = full;
          mainImg.alt = thumbs[i].alt;
          for (var t = 0; t < thumbs.length; t++) {
            thumbs[t].classList.toggle("active", t === i);
          }
        }

        function next() {
          show((idx + 1) % thumbs.length);
        }

        function resetTimer() {
          if (timer) clearInterval(timer);
          if (thumbs.length > 1) timer = setInterval(next, 4500);
        }

        for (var i = 0; i < thumbs.length; i++) {
          (function (index) {
            thumbs[index].addEventListener("click", function () {
              show(index);
              resetTimer();
            });
          })(i);
        }

        // Swipe support for touch devices: a quick left/right swipe on the
        // large image jumps straight to the next/previous picture instead of
        // waiting for the auto-rotate timer.
        var mainWrap = gallery.querySelector(".gallery-main");
        if (mainWrap) {
          var touchStartX = 0;
          var touchStartY = 0;
          var touching = false;

          mainWrap.addEventListener("touchstart", function (e) {
            if (e.touches.length !== 1) return;
            touching = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }, { passive: true });

          mainWrap.addEventListener("touchend", function (e) {
            if (!touching) return;
            touching = false;
            var touch = e.changedTouches[0];
            var dx = touch.clientX - touchStartX;
            var dy = touch.clientY - touchStartY;
            var THRESHOLD = 30;
            if (Math.abs(dx) > THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
              if (dx < 0) {
                show((idx + 1) % thumbs.length);
              } else {
                show((idx - 1 + thumbs.length) % thumbs.length);
              }
              resetTimer();
            }
          }, { passive: true });
        }

        resetTimer();
      })(galleries[g]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalleries);
  } else {
    initGalleries();
  }
})();
