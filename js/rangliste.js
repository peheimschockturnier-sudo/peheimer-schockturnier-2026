const RANGLISTE_AKTUALISIERUNG_MS = 60000;

console.log("rangliste.js wurde erfolgreich geladen");

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

  if (nummer === 1) {
    return "🥇";
  }

  if (nummer === 2) {
    return "🥈";
  }

  if (nummer === 3) {
    return "🥉";
  }

  return "🎲";
}

function ermittleRangKlasse(platz) {
  const nummer = rangZahl(platz);

  if (nummer === 1) {
    return "rang-gold";
  }

  if (nummer === 2) {
    return "rang-silber";
  }

  if (nummer === 3) {
    return "rang-bronze";
  }

  return "";
}

function sortiereRangliste(rangliste) {
  return [...rangliste].sort(function (a, b) {
    const platzA = rangZahl(a.platz);
    const platzB = rangZahl(b.platz);

    if (platzA !== platzB) {
      return platzA - platzB;
    }

    return rangZahl(b.punkte) - rangZahl(a.punkte);
  });
}

function erstelleRangzeile(eintrag) {
  const platz = rangZahl(eintrag.platz);
  const klasse = ermittleRangKlasse(platz);
  const symbol = ermittleRangSymbol(platz);

  return `
    <tr class="${klasse}">
      <td class="rang-platz">
        <span class="rang-symbol">
          ${symbol}
        </span>

        <strong>
          ${rangSichererText(
            platz || "-"
          )}
        </strong>
      </td>

      <td class="rang-spieler">
        ${rangSichererText(
          eintrag.spieler || "Unbekannt"
        )}
      </td>

      <td>
        ${rangSichererText(
          eintrag.punkte || "0"
        )}
      </td>

      <td>
        ${rangSichererText(
          eintrag.schockOuts || "0"
        )}
      </td>

      <td>
        ${rangSichererText(
          eintrag.siege || "0"
        )}
      </td>

      <td>
        ${rangSichererText(
          eintrag.niederlagen || "0"
        )}
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
  const container =
    document.getElementById("ranglisteContainer");

  if (!container) {
    return;
  }

  try {
    if (!window.WEBAPP_URL) {
      throw new Error(
        "Die Web-App-URL wurde nicht geladen."
      );
    }

    const url =
      window.WEBAPP_URL +
      "?action=rangliste&t=" +
      Date.now();

    const response = await fetch(url, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "HTTP-Fehler: " + response.status
      );
    }

    const data = await response.json();

    console.log("Ranglisten-Daten:", data);

    if (data.erfolg === false) {
      throw new Error(
        data.fehler ||
        "Die Rangliste konnte nicht geladen werden."
      );
    }

    if (!Array.isArray(data.rangliste)) {
      throw new Error(
        "Ungültige Antwort: 'rangliste' fehlt."
      );
    }

    if (data.rangliste.length === 0) {
      container.innerHTML = `
        <div class="rangliste-leer">
          <span>🏅</span>

          <h3>
            Die Rangliste ist noch leer
          </h3>

          <p>
            Sobald das Turnier gestartet ist,
            erscheinen hier die aktuellen Platzierungen.
          </p>
        </div>
      `;

      return;
    }

    const rangliste =
      sortiereRangliste(data.rangliste);

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
                <th>Punkte</th>
                <th>Schock-Outs</th>
                <th>Siege</th>
                <th>Niederlagen</th>
              </tr>
            </thead>

            <tbody>
              ${rangliste
                .map(erstelleRangzeile)
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="rangliste-fuss">
          Zuletzt aktualisiert:
          <strong>
            ${formatiereRanglistenUhrzeit()} Uhr
          </strong>
        </div>
      </div>
    `;

  } catch (error) {
    console.error(
      "Ranglisten-Fehler:",
      error
    );

    container.innerHTML = `
      <div class="rangliste-fehler">
        <span>❌</span>

        <h3>
          Rangliste konnte nicht geladen werden
        </h3>

        <p>
          ${rangSichererText(error.message)}
        </p>
      </div>
    `;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    ladeRangliste();

    setInterval(
      ladeRangliste,
      RANGLISTE_AKTUALISIERUNG_MS
    );
  }
);
