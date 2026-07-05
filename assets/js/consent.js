(function () {
  "use strict";
  var KEY = "sx_consent_external";

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(val) {
    try { localStorage.setItem(KEY, val); } catch (e) {}
  }

  // Videos never start on their own. They only load and play once the
  // visitor explicitly clicks the preview/play button for that specific
  // video. Since there is no German audio track yet, playback then starts
  // muted by default so nothing suddenly plays with sound; the visitor can
  // unmute via the YouTube player controls.
  function activateVideo(el) {
    if (!el || el.dataset.activated) return;
    el.dataset.activated = "1";
    var id = el.getAttribute("data-yt-id");
    var title = el.getAttribute("data-yt-title") || "YouTube-Video";
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&mute=1";
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

  function hideBanner() {
    var b = document.getElementById("sx-consent-banner");
    if (b) b.style.display = "none";
  }
  function showBanner() {
    var b = document.getElementById("sx-consent-banner");
    if (b) b.style.display = "flex";
  }

  // Accepting only marks external content (YouTube) as generally allowed.
  // It must NOT start any video playback by itself - videos are always
  // started individually, by clicking their own preview.
  function accept() {
    setConsent("granted");
    hideBanner();
  }
  function decline() {
    setConsent("denied");
    hideBanner();
  }

  function init() {
    var state = getConsent();
    if (state !== "granted" && state !== "denied") {
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

  // Mobile nav: submenus (Einsatzbereiche, Systeme & Lösungen) are collapsed
  // by default on small screens and opened via a small toggle button, so the
  // parent link still navigates normally while the submenu stays tucked away
  // until the visitor asks for it.
  function initMobileSubmenus() {
    var groups = document.querySelectorAll("nav.main .has-submenu");
    for (var i = 0; i < groups.length; i++) {
      (function (group) {
        var submenu = group.querySelector(".submenu");
        if (!submenu || group.querySelector(".submenu-toggle")) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "submenu-toggle";
        btn.setAttribute("aria-label", "Untermenü ein-/ausklappen");
        submenu.insertAdjacentElement("beforebegin", btn);
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          group.classList.toggle("open");
        });
      })(groups[i]);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    document.addEventListener("DOMContentLoaded", initMobileSubmenus);
  } else {
    init();
    initMobileSubmenus();
  }
})();
