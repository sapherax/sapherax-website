(function () {
  "use strict";
  var KEY = "sx_consent_external";

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(KEY, val); } catch (e) {}
  }

  function loadGoogleFonts() {
    if (document.getElementById("sx-gfonts")) return;
    var pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.googleapis.com";
    var css = document.createElement("link");
    css.id = "sx-gfonts";
    css.rel = "stylesheet";
    css.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap";
    document.head.appendChild(pre);
    document.head.appendChild(css);
  }

  function activateVideo(el) {
    if (!el || el.dataset.activated) return;
    el.dataset.activated = "1";
    var id = el.getAttribute("data-yt-id");
    var title = el.getAttribute("data-yt-title") || "YouTube-Video";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1";
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.style.position = "absolute";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "0";
    el.innerHTML = "";
    el.appendChild(iframe);
  }

  function activateAllVideos() {
    var facades = document.querySelectorAll(".yt-facade");
    for (var i = 0; i < facades.length; i++) activateVideo(facades[i]);
  }

  function hideBanner() {
    var b = document.getElementById("sx-consent-banner");
    if (b) b.style.display = "none";
  }
  function showBanner() {
    var b = document.getElementById("sx-consent-banner");
    if (b) b.style.display = "flex";
  }

  function accept() {
    setConsent("granted");
    hideBanner();
    loadGoogleFonts();
    activateAllVideos();
  }
  function decline() {
    setConsent("denied");
    hideBanner();
  }

  function init() {
    var state = getConsent();
    if (state === "granted") {
      loadGoogleFonts();
      activateAllVideos();
    } else if (state !== "denied") {
      showBanner();
    }

    var a = document.getElementById("sx-consent-accept");
    var d = document.getElementById("sx-consent-decline");
    if (a) a.addEventListener("click", accept);
    if (d) d.addEventListener("click", decline);

    var facades = document.querySelectorAll(".yt-facade .yt-facade-inner");
    for (var i = 0; i < facades.length; i++) {
      facades[i].addEventListener("click", function () {
        activateVideo(this.closest(".yt-facade"));
      });
    }

    var manageLinks = document.querySelectorAll(".sx-consent-manage");
    for (var j = 0; j < manageLinks.length; j++) {
      manageLinks[j].addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
