console.log("rangliste.js Version 31 wurde geladen");

const RANGLISTE_AKTUALISIERUNG_MS = 60000;

function rangSichererText(wert) {
  return String(wert ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function rangZahl(wert) {
  const zahl = Number(
    String(wert ?? "")
      .replace(",", ".")
      .trim()
  );

  return Number.isFinite(zahl) ? zahl : 0;
}

function ermittleRangSymbol(platz) {
  const nummer = rangZahl(platz);

  if (nummer === 1) return "🥇";
  if (nummer === 2) return "🥈";
  if (nummer === 3) return "🥉";

  return "🎲";
}

function ermittleRangKlasse(platz) {
  const nummer = rangZahl(platz);

  if (nummer === 1) return "rang-gold";
  if (nummer === 2) return "rang-silber";
  if (nummer === 3) return "rang-bronze";

  return "";
}

function sortiereRangliste(rangliste) {
  return [...rangliste].sort(function (a, b) {
    return rangZahl(a.platz) - rangZahl(b.platz);
  });
}

function erstelleRangzeile(eintrag) {
  const platz = rangZahl(eintrag.platz);
  const klasse = ermittleRangKlasse(platz);
  const symbol = ermittleRangSymbol(platz);

  return `
    <tr class="${klasse}">
      <td class="rang-platz">
        <span class="rang-symbol">${symbol}</span>
        <strong>${rangSichererText(platz || "-")}</strong>
      </td>

      <td class="rang-spieler">
        ${rangSichererText(eintrag.spieler || "Unbekannt")}
      </td>

      <td class="rang-team">
        ${rangSichererText(eintrag.teamname || "-")}
      </td>

      <td>
        ${rangSichererText(eintrag.punkte || "0")}
      </td>

      <td>
        ${rangSichererText(eintrag.schockOuts || "0")}
      </td>
    </tr>
  `;
}

function formatiereRanglistenUhrzeit() {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

async function ladeRangliste() {
  const container = document.getElementById("ranglisteContainer");

  if (!container) {
    console.error("ranglisteContainer wurde nicht gefunden.");
    return;
  }

  try {
    console.log("WEBAPP_URL:", window.WEBAPP_URL);

    if (!window.WEBAPP_URL) {
      throw new Error("WEBAPP_URL fehlt. config.js prüfen.");
    }

    const url =
      window.WEBAPP_URL +
      "?action=rangliste&t=" +
      Date.now();

    console.log("Rangliste wird abgerufen:", url);

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("HTTP-Fehler: " + response.status);
    }

    const data = await response.json();

    console.log("Ranglisten-Antwort:", data);

    if (data.erfolg === false) {
      throw new Error(
        data.fehler || "Rangliste konnte nicht geladen werden."
      );
    }

    if (!Array.isArray(data.rangliste)) {
      throw new Error(
        "Die Antwort enthält kein gültiges Feld 'rangliste'."
      );
    }

    if (data.rangliste.length === 0) {
      container.innerHTML = `
        <div class="rangliste-leer">
          <span>🏅</span>
          <h3>Die Rangliste ist noch leer</h3>
          <p>
            Sobald Ergebnisse vorhanden sind,
            werden sie hier angezeigt.
          </p>
        </div>
      `;
      return;
    }

    const rangliste = sortiereRangliste(data.rangliste);

    container.innerHTML = `
      <div class="rangliste-rahmen">
        <div class="rangliste-kopf">
          <div>
            <span class="rangliste-livepunkt"></span>
            Live-Rangliste
          </div>

          <small>
            Aktualisierung alle 60 Sekunden
          </small>
        </div>

        <div class="rangliste-scroll">
          <table class="rangliste-tabelle">
            <thead>
              <tr>
                <th>Platz</th>
                <th>Spieler</th>
                <th>Teamname</th>
                <th>Punkte</th>
                <th>Schock-Outs</th>
              </tr>
            </thead>

            <tbody>
              ${rangliste.map(erstelleRangzeile).join("")}
            </tbody>
          </table>
        </div>

        <div class="rangliste-fuss">
          Zuletzt aktualisiert:
          <strong>${formatiereRanglistenUhrzeit()} Uhr</strong>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("Ranglisten-Fehler:", error);

    container.innerHTML = `
      <div class="rangliste-fehler">
        <span>❌</span>
        <h3>Rangliste konnte nicht geladen werden</h3>
        <p>${rangSichererText(error.message)}</p>
      </div>
    `;
  }
}

function starteRangliste() {
  console.log("Rangliste wird gestartet");

  ladeRangliste();

  window.setInterval(
    ladeRangliste,
    RANGLISTE_AKTUALISIERUNG_MS
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    starteRangliste
  );
} else {
  starteRangliste();
}
