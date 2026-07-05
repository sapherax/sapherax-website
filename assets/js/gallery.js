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
