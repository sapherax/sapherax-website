/* Schrittweiser Fragenkatalog auf der Terminseite (kostenlose Machbarkeitsanalyse).
   Ohne JavaScript bleibt das Formular vollständig sichtbar und absendbar. */
(function () {
  var form = document.getElementById("quizForm");
  if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll(".quiz-step"));
  var lastStep = steps[steps.length - 1];
  var bar = form.querySelector(".quiz-progress-bar");
  var countNow = form.querySelector(".quiz-count-now");
  var fragenField = form.querySelector('input[name="Fragen"]');
  var current = 0;
  var branchePreset = false;
  form.classList.add("quiz-js");

  var MAP = { reinigung: "Reinigungsfirma oder Gebäudedienstleister", pflege: "Pflegeheim oder betreutes Wohnen",
    hotel: "Hotel", gastronomie: "Restaurant oder Café", handel: "Einzelhandel", logistik: "Logistik oder Lager" };

  function show(i) {
    current = Math.max(0, Math.min(i, steps.length - 1));
    steps.forEach(function (s, k) { s.hidden = k !== current; });
    if (bar) bar.style.width = Math.round(((current + 1) / steps.length) * 100) + "%";
    if (countNow) countNow.textContent = (branchePreset && current > 1) ? current : current + 1;
    if (steps[current] === lastStep) applyMode();
    var top = form.getBoundingClientRect().top + window.pageYOffset - 100;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  function stepHasAnswer(step) {
    var type = step.getAttribute("data-type");
    if (type === "radio") return !!step.querySelector("input:checked");
    if (type === "checkbox") {
      var txt = step.querySelector("textarea");
      return !!step.querySelector("input:checked") || !!(txt && txt.value.trim());
    }
    return true;
  }

  function nextIndex(idx) {
    var n = idx + 1;
    while (n < steps.length && branchePreset && steps[n].getAttribute("data-name") === "Branche") n++;
    return n;
  }

  // Hinweise bei Mehrfachauswahl: alle Hinweise der angekreuzten Antworten zeigen
  function checkboxHints(step, hintBox) {
    if (!hintBox) return;
    hintBox.innerHTML = "";
    Array.prototype.forEach.call(step.querySelectorAll("input:checked[data-hint]"), function (c) {
      var p = document.createElement("p");
      p.textContent = c.getAttribute("data-hint");
      hintBox.appendChild(p);
    });
    hintBox.hidden = !hintBox.firstChild;
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
      show(nextIndex(idx));
    });
    if (type !== "radio" && type !== "checkbox") return;
    Array.prototype.forEach.call(step.querySelectorAll("input"), function (inp) {
      inp.addEventListener("change", function () {
        step.classList.remove("quiz-missing");
        fragenField.value = "beantwortet";
        if (type === "checkbox") {
          if (inp.checked && inp.hasAttribute("data-exclusive")) {
            Array.prototype.forEach.call(step.querySelectorAll('input[type="checkbox"]'), function (o) { if (o !== inp) o.checked = false; });
          } else if (inp.checked) {
            Array.prototype.forEach.call(step.querySelectorAll("input[data-exclusive]"), function (o) { o.checked = false; });
          }
          checkboxHints(step, hintBox);
          return;
        }
        var hint = inp.getAttribute("data-hint");
        var stop = inp.getAttribute("data-stop");
        if (hint) {
          hintBox.textContent = hint;
          hintBox.hidden = false;
          next.hidden = !!stop;
        } else {
          hintBox.hidden = true;
          next.hidden = true;
          setTimeout(function () { show(nextIndex(idx)); }, 250);
        }
      });
    });
  });

  // Kontaktschritt: Pflichtfelder je nach Weg (Rückruf oder Termin) und ob Fragen übersprungen wurden
  var submitBtn = lastStep.querySelector(".quiz-submit");
  var msg = lastStep.querySelector('textarea[name="Nachricht"]');
  var msgLabel = lastStep.querySelector(".quiz-msg-label");
  function mode() {
    var r = lastStep.querySelector('input[name="Wunsch"]:checked');
    return r && r.value.indexOf("Termin") === 0 ? "termin" : "rueckruf";
  }
  function applyMode() {
    var m = mode();
    var skipped = fragenField.value === "übersprungen";
    Array.prototype.forEach.call(lastStep.querySelectorAll('input[data-req="rueckruf"]'), function (el) { el.required = m === "rueckruf"; });
    Array.prototype.forEach.call(lastStep.querySelectorAll('.req[data-req="rueckruf"]'), function (el) { el.hidden = m !== "rueckruf"; });
    Array.prototype.forEach.call(lastStep.querySelectorAll(".quiz-only-rueckruf"), function (el) { el.hidden = m !== "rueckruf"; });
    Array.prototype.forEach.call(lastStep.querySelectorAll(".quiz-only-termin"), function (el) { el.hidden = m !== "termin"; });
    msg.required = skipped;
    lastStep.querySelector('.req[data-req="skip"]').hidden = !skipped;
    msgLabel.textContent = skipped ? "Worum geht es? (ein Satz reicht)" : "Ihre Mitteilung an uns";
    msg.placeholder = skipped ? "z. B. Wir suchen einen Reinigungsroboter für 800 m² Bürofläche" : "Optional: Was sollen wir noch wissen?";
    submitBtn.textContent = m === "termin" ? "Senden und Termin buchen" : "Rückruf anfordern";
  }
  Array.prototype.forEach.call(lastStep.querySelectorAll('input[name="Wunsch"]'), function (r) {
    r.addEventListener("change", applyMode);
  });

  // Einstieg von anderen Seiten: ?branche=reinigung setzt die Branche und überspringt die Frage
  var params = new URLSearchParams(window.location.search);
  var quelle = params.get("quelle") || (document.referrer ? document.referrer.replace(/^https?:\/\/[^/]+/, "") : "");
  if (quelle) form.querySelector('input[name="Quelle"]').value = "Terminseite, von " + quelle;
  var b = params.get("branche");
  if (b && MAP[b]) {
    var r = form.querySelector('input[name="Branche"][value="' + MAP[b] + '"]');
    if (r) { r.checked = true; branchePreset = true; }
  }
  var countAll = form.querySelector(".quiz-count-all");
  if (countAll) countAll.textContent = branchePreset ? steps.length - 1 : steps.length;
  show(0);

  // Abkürzung: ohne Fragen direkt zum Kontaktschritt
  var skip = form.querySelector(".quiz-skip");
  if (skip) skip.addEventListener("click", function () {
    fragenField.value = "übersprungen";
    show(steps.length - 1);
  });

  function showDone(termin) {
    steps.forEach(function (s) { s.hidden = true; });
    form.querySelector(".quiz-progress").hidden = true;
    form.querySelector(".quiz-top").hidden = true;
    var done = form.querySelector(".quiz-done");
    done.hidden = false;
    if (termin) {
      done.querySelector(".quiz-done-callback").hidden = true;
      done.querySelector(".quiz-done-booking").hidden = false;
    }
  }

  // Rückkehr nach normalem Versand (Ausweichweg ohne JavaScript Antwort)
  if (window.location.hash === "#danke") showDone(false);
  if (window.location.hash === "#termin") showDone(true);

  var errorEl = form.querySelector(".quiz-error");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    applyMode();
    var missing = Array.prototype.filter.call(lastStep.querySelectorAll("[required]"), function (el) { return !el.value.trim(); });
    var mail = lastStep.querySelector('input[type="email"]');
    if (missing.length || (mail && mail.value && !mail.checkValidity())) {
      errorEl.textContent = "Bitte füllen Sie die Pflichtfelder aus (mit * markiert).";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    var termin = mode() === "termin";
    // Mehrfachauswahl als ein Textfeld senden (eine Zeile je Frage in der E-Mail)
    var fd = new FormData(form);
    Array.prototype.forEach.call(form.querySelectorAll('.quiz-step[data-type="checkbox"]'), function (st) {
      var name = st.getAttribute("data-name");
      var vals = Array.prototype.map.call(st.querySelectorAll('input[type="checkbox"]:checked'), function (c) { return c.value; });
      fd.delete(name);
      fd.set(name, vals.join(", "));
    });
    submitBtn.disabled = true;
    // formsubmit.co nimmt Anfragen per JavaScript nur über den ajax Pfad an
    var url = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
    fetch(url, { method: "POST", headers: { Accept: "application/json" }, body: fd })
      .then(function (res) {
        if (!res.ok) throw new Error("send failed");
        return res.json();
      })
      .then(function (data) {
        if (data && String(data.success) === "false") throw new Error(data.message || "send failed");
        showDone(termin);
        if (window.dataLayer) window.dataLayer.push({ event: "anfrage_gesendet", wunsch: termin ? "Termin" : "Rückruf" });
      })
      .catch(function (err) {
        var m = err && err.message ? err.message : "";
        submitBtn.disabled = false;
        if (/activat/i.test(m)) {
          errorEl.textContent = "Das Formular ist beim Versanddienst noch nicht freigeschaltet. Bitte schreiben Sie uns vorerst an info@sapherax.com.";
          errorEl.hidden = false;
          if (window.console) console.warn("FormSubmit:", m);
          return;
        }
        if (window.location.protocol === "file:") {
          errorEl.textContent = "Test aus einer lokalen Datei: Der Versanddienst nimmt nur Anfragen von einer Webadresse an. Bitte über die Vorschau im Internet testen.";
          errorEl.hidden = false;
          return;
        }
        // Ausweichweg: normaler Formularversand, danach zurück auf diese Seite
        var nxt = document.createElement("input");
        nxt.type = "hidden"; nxt.name = "_next";
        nxt.value = window.location.href.split("#")[0].split("?")[0] + (termin ? "#termin" : "#danke");
        form.appendChild(nxt);
        form.submit();
      });
  });
})();
