/* Schrittweiser Fragenkatalog auf der Terminseite (kostenlose Machbarkeitsanalyse).
   Ohne JavaScript bleibt das Formular vollständig sichtbar und absendbar. */
(function () {
  var form = document.getElementById("quizForm");
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll(".quiz-step"));
  var bar = form.querySelector(".quiz-progress-bar");
  var countNow = form.querySelector(".quiz-count-now");
  var current = 0;
  form.classList.add("quiz-js");

  var MAP = { reinigung: "Reinigungsfirma oder Gebäudedienstleister", pflege: "Pflegeheim oder betreutes Wohnen",
    hotel: "Hotel", gastronomie: "Restaurant oder Café", handel: "Einzelhandel", logistik: "Logistik oder Lager" };

  function show(i) {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (s, k) { s.hidden = k !== current; });
    if (bar) bar.style.width = Math.round(((current + 1) / steps.length) * 100) + "%";
    if (countNow) countNow.textContent = current + 1;
    var top = form.getBoundingClientRect().top + window.pageYOffset - 100;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  function stepHasAnswer(step) {
    var type = step.getAttribute("data-type");
    if (type === "radio" || type === "checkbox") return !!step.querySelector("input:checked");
    return true;
  }

  steps.forEach(function (step, idx) {
    var type = step.getAttribute("data-type");
    var hintBox = step.querySelector(".quiz-hint");
    var next = step.querySelector(".quiz-next");
    var back = step.querySelector(".quiz-back");
    if (back) back.addEventListener("click", function () { show(idx - 1); });
    if (next) next.addEventListener("click", function () {
      if (!stepHasAnswer(step)) { step.classList.add("quiz-missing"); return; }
      step.classList.remove("quiz-missing");
      show(idx + 1);
    });
    Array.prototype.forEach.call(step.querySelectorAll("input"), function (inp) {
      inp.addEventListener("change", function () {
        step.classList.remove("quiz-missing");
        if (type === "checkbox") {
          var none = step.querySelector('input[value^="Noch offen"]');
          if (inp === none && inp.checked) {
            Array.prototype.forEach.call(step.querySelectorAll("input"), function (o) { if (o !== none) o.checked = false; });
          } else if (none && inp !== none && inp.checked) { none.checked = false; }
          return;
        }
        if (type !== "radio") return;
        var hint = inp.getAttribute("data-hint");
        if (hint) {
          hintBox.textContent = hint;
          hintBox.hidden = false;
          next.hidden = false;
        } else {
          hintBox.hidden = true;
          next.hidden = true;
          setTimeout(function () { show(idx + 1); }, 250);
        }
      });
    });
  });

  // Einstieg von anderen Seiten: ?branche=reinigung setzt die Branche und startet bei Frage 2
  var params = new URLSearchParams(window.location.search);
  var quelle = params.get("quelle") || (document.referrer ? document.referrer.replace(/^https?:\/\/[^/]+/, "") : "");
  if (quelle) form.querySelector('input[name="Quelle"]').value = "Terminseite, von " + quelle;
  var start = 0;
  var b = params.get("branche");
  if (b && MAP[b]) {
    var r = form.querySelector('input[name="Branche"][value="' + MAP[b] + '"]');
    if (r) { r.checked = true; start = 1; }
  }
  show(start);

  var wunschField = form.querySelector('input[name="Wunsch"]');
  Array.prototype.forEach.call(form.querySelectorAll("button[data-wunsch]"), function (btn) {
    btn.addEventListener("click", function () { wunschField.value = btn.getAttribute("data-wunsch"); });
  });

  var errorEl = form.querySelector(".quiz-error");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var last = steps[steps.length - 1];
    var missing = Array.prototype.filter.call(last.querySelectorAll("[required]"), function (el) { return !el.value.trim(); });
    var mail = last.querySelector('input[type="email"]');
    if (missing.length || (mail && mail.value && !mail.checkValidity())) {
      errorEl.textContent = "Bitte füllen Sie die Pflichtfelder aus (mit * markiert).";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    if (!wunschField.value) wunschField.value = "Rückruf";
    var buttons = last.querySelectorAll("button");
    Array.prototype.forEach.call(buttons, function (x) { x.disabled = true; });
    fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
      .then(function (res) {
        if (!res.ok) throw new Error("send failed");
        steps.forEach(function (s) { s.hidden = true; });
        form.querySelector(".quiz-progress").hidden = true;
        form.querySelector(".quiz-count").hidden = true;
        var done = form.querySelector(".quiz-done");
        done.hidden = false;
        if (wunschField.value.indexOf("Termin") === 0) {
          done.querySelector(".quiz-done-callback").hidden = true;
          done.querySelector(".quiz-done-booking").hidden = false;
        }
        if (window.dataLayer) window.dataLayer.push({ event: "anfrage_gesendet", wunsch: wunschField.value });
      })
      .catch(function () {
        errorEl.textContent = "Senden fehlgeschlagen. Bitte versuchen Sie es erneut oder schreiben Sie an info@sapherax.com.";
        errorEl.hidden = false;
        Array.prototype.forEach.call(buttons, function (x) { x.disabled = false; });
      });
  });
})();
