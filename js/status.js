const WEBAPP_URL ="https://script.google.com/macros/s/AKfycbyC8HVOroZPdbWHKviQmz-lieJTwoJYAyyUZWCq_Ew4qC72XInFMHO1SQBpHdl1agMqrA/exec";
 
async function ladeAnmeldestatus() {
  const statusText = document.getElementById("statusText");
  const teilnehmerzahl = document.getElementById("teilnehmerzahl");
  const progressBar = document.getElementById("progressBar");
  const progressCircle = document.getElementById("progressCircle");
  const spielerText = document.getElementById("spielerText");

  try {
    const response = await fetch(
      WEBAPP_URL + "?action=status&t=" + Date.now(),
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        "HTTP-Fehler: " + response.status
      );
    }

    const data = await response.json();

    if (data.erfolg === false) {
      throw new Error(
        data.fehler || "Anmeldestatus konnte nicht geladen werden."
      );
    }

    const gruppen = Number(data.gruppen || 0);
    const maxGruppen = Number(data.maxGruppen || 24);
    const warteliste = Number(data.warteliste || 0);

    const freieGruppen = Number(
      data.freieGruppen !== undefined
        ? data.freieGruppen
        : Math.max(0, maxGruppen - gruppen)
    );

    const ausgebucht =
      data.ausgebucht === true ||
      gruppen >= maxGruppen;

    const anmeldungOffen =
      data.anmeldungOffen !== false;

    const prozent =
      maxGruppen > 0
        ? Math.min(100, (gruppen / maxGruppen) * 100)
        : 0;

    if (teilnehmerzahl) {
      teilnehmerzahl.textContent = gruppen;
    }

    if (progressBar) {
      progressBar.style.width = prozent + "%";
      progressBar.setAttribute(
        "aria-valuenow",
        Math.round(prozent)
      );
    }

    if (progressCircle) {
      const umfang = 471;

      progressCircle.style.strokeDashoffset =
        umfang - (umfang * prozent / 100);
    }

    if (spielerText) {
      const angemeldeteSpieler = gruppen * 4;
      const maximaleSpieler = maxGruppen * 4;

      spielerText.innerHTML =
        `Aktuell ${angemeldeteSpieler} von ` +
        `${maximaleSpieler} Startplätzen für Spieler belegt`;

      if (warteliste > 0) {
        spielerText.innerHTML +=
          `<br>${warteliste * 4} Spieler auf der Warteliste`;
      }
    }

    if (!statusText) {
      return;
    }

    if (!anmeldungOffen) {
      statusText.innerHTML =
        "🔒 Die Anmeldung ist derzeit geschlossen.";

      return;
    }

    if (ausgebucht) {
      let meldung =
        `🔴 ${gruppen} von ${maxGruppen} Teams angemeldet.<br>` +
        `Alle festen Startplätze sind vergeben.<br>` +
        `Weitere Teams können sich für die Warteliste anmelden.`;

      if (warteliste > 0) {
        meldung +=
          `<br><strong>${warteliste} ` +
          `${warteliste === 1 ? "Team steht" : "Teams stehen"} ` +
          `bereits auf der Warteliste.</strong>`;
      }

      statusText.innerHTML = meldung;

    } else {
      statusText.innerHTML =
        `🟢 ${gruppen} von ${maxGruppen} Teams angemeldet.<br>` +
        `Noch ${freieGruppen} ` +
        `${freieGruppen === 1 ? "Startplatz" : "Startplätze"} frei.`;

      if (warteliste > 0) {
        statusText.innerHTML +=
          `<br>${warteliste} ` +
          `${warteliste === 1 ? "Team steht" : "Teams stehen"} ` +
          `auf der Warteliste.`;
      }
    }

  } catch (error) {
    console.error(
      "Fehler beim Laden des Anmeldestatus:",
      error
    );

    if (statusText) {
      statusText.innerHTML =
        "❌ Der Anmeldestatus konnte derzeit nicht geladen werden.";
    }
  }
}

ladeAnmeldestatus();

/*
  Status automatisch alle 60 Sekunden aktualisieren.
*/
setInterval(ladeAnmeldestatus, 60000);
