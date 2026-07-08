(function () {
  "use strict";

  function initGalleries() {
    var galleries = document.querySelectorAll(".product-gallery");
    for (var g = 0; g < galleries.length; g++) {
      (function (gallery) {
        var mainWrap = gallery.querySelector(".gallery-main");
        var mainImg = gallery.querySelector(".gallery-main img");
        var thumbs = gallery.querySelectorAll(".gallery-thumbs img");
        if (!mainImg || !mainWrap || thumbs.length === 0) return;
        var idx = 0;
        var timer = null;

        // dir: 1 = new image slides in from the right, old exits to the left.
        //     -1 = new image slides in from the left, old exits to the right.
        //      0 (or omitted) = no animation, just swap.
        function show(i, dir) {
          if (i === idx && dir) return;
          var full = thumbs[i].getAttribute("data-full");
          var alt = thumbs[i].alt;

          if (dir) {
            var oldClone = mainWrap.querySelector(".slide-clone");
            if (oldClone && oldClone.parentNode) oldClone.parentNode.removeChild(oldClone);

            var clone = mainImg.cloneNode(true);
            clone.classList.add("slide-clone");
            mainWrap.appendChild(clone);

            mainImg.style.transition = "none";
            mainImg.style.transform = "translateX(" + (dir * 100) + "%)";
            // eslint-disable-next-line no-unused-expressions
            mainImg.offsetWidth; // force reflow before src/transition changes

            mainImg.src = full;
            mainImg.alt = alt;

            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                mainImg.style.transition = "";
                mainImg.style.transform = "translateX(0)";
                clone.style.transform = "translateX(" + (-dir * 100) + "%)";
              });
            });

            setTimeout(function () {
              if (clone.parentNode) clone.parentNode.removeChild(clone);
            }, 440);
          } else if (!dir) {
            mainImg.src = full;
            mainImg.alt = alt;
          }

          idx = i;
          for (var t = 0; t < thumbs.length; t++) {
            thumbs[t].classList.toggle("active", t === i);
          }
        }

        function next() {
          show((idx + 1) % thumbs.length, 1);
        }

        function resetTimer() {
          if (timer) clearInterval(timer);
          if (thumbs.length > 1) timer = setInterval(next, 4500);
        }

        for (var i = 0; i < thumbs.length; i++) {
          (function (index) {
            thumbs[index].addEventListener("click", function () {
              if (index === idx) return;
              show(index, index > idx ? 1 : -1);
              resetTimer();
            });
          })(i);
        }

        // Swipe support for touch devices: a quick left/right swipe on the
        // large image jumps straight to the next/previous picture instead of
        // waiting for the auto-rotate timer.
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
              show((idx + 1) % thumbs.length, 1);
            } else {
              show((idx - 1 + thumbs.length) % thumbs.length, -1);
            }
            resetTimer();
          }
        }, { passive: true });

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
