const SPIELPLAN_URL="https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec?action=spielplan";

const AKTUALISIERUNG_MS = 60000;

console.log("spielplan.js wurde erfolgreich geladen");

function sichererText(wert) {
  return String(wert ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function istStatus(status, suchwerte) {
  const normalisiert = String(status || "")
    .trim()
    .toLowerCase();

  return suchwerte.includes(normalisiert);
}

function ermittleStatusklasse(status) {
  if (istStatus(status, ["läuft", "laeuft", "laufend"])) {
    return "status-aktiv";
  }

  if (
    istStatus(status, [
      "beendet",
      "fertig",
      "abgeschlossen"
    ])
  ) {
    return "status-beendet";
  }

  if (istStatus(status, ["pausiert", "verschoben"])) {
    return "status-pausiert";
  }

  return "status-geplant";
}

function ermittleStatussymbol(status) {
  if (istStatus(status, ["läuft", "laeuft", "laufend"])) {
    return "●";
  }

  if (
    istStatus(status, [
      "beendet",
      "fertig",
      "abgeschlossen"
    ])
  ) {
    return "✓";
  }

  if (istStatus(status, ["pausiert", "verschoben"])) {
    return "‖";
  }

  return "○";
}

function leseSpielwert(
  spiel,
  varianten,
  standardwert = ""
) {
  for (const variante of varianten) {
    const wert = spiel[variante];

    if (
      wert !== undefined &&
      wert !== null &&
      String(wert).trim() !== ""
    ) {
      return wert;
    }
  }

  return standardwert;
}

function holeSpieler(spiel) {
  return [
    leseSpielwert(
      spiel,
      ["spieler1", "Spieler1", "Spieler 1"]
    ),
    leseSpielwert(
      spiel,
      ["spieler2", "Spieler2", "Spieler 2"]
    ),
    leseSpielwert(
      spiel,
      ["spieler3", "Spieler3", "Spieler 3"]
    ),
    leseSpielwert(
      spiel,
      ["spieler4", "Spieler4", "Spieler 4"]
    ),
    leseSpielwert(
      spiel,
      ["spieler5", "Spieler5", "Spieler 5"]
    )
  ].filter(
    (spieler) => String(spieler).trim() !== ""
  );
}

function erstelleSpielerliste(spiel) {
  const spieler = holeSpieler(spiel);

  if (spieler.length === 0) {
    return `
      <span class="live-keine-spieler">
        Spieler noch nicht eingetragen
      </span>
    `;
  }

  return spieler
    .map(
      (name) => `
        <span class="live-spieler-name">
          ${sichererText(name)}
        </span>
      `
    )
    .join("");
}

function erstelleSpielkarte(spiel) {
  const runde = leseSpielwert(
    spiel,
    ["runde", "Runde"],
    "Turnierspiel"
  );

  const tisch = leseSpielwert(
    spiel,
    ["tisch", "Tisch"],
    "-"
  );

  const status = leseSpielwert(
    spiel,
    ["status", "Status"],
    "Geplant"
  );

  const statusklasse =
    ermittleStatusklasse(status);

  const statussymbol =
    ermittleStatussymbol(status);

  const istLive = istStatus(
    status,
    ["läuft", "laeuft", "laufend"]
  );

  return `
    <article class="live-spielkarte ${
      istLive ? "ist-live" : ""
    }">
      <div class="live-spielkopf">
        <div class="live-runde">
          ${sichererText(runde)}
        </div>

        <div class="live-status ${statusklasse}">
          <span class="live-status-symbol">
            ${statussymbol}
          </span>

          <span>
            ${sichererText(status)}
          </span>
        </div>
      </div>

      <div class="live-spielinhalt">
        <div class="live-tisch">
          <span class="live-tisch-icon">🎲</span>

          <div>
            <span class="live-tisch-label">
              Tisch
            </span>

            <strong class="live-tisch-nummer">
              ${sichererText(tisch)}
            </strong>
          </div>
        </div>

        <div class="live-team">
          <div class="live-spieler">
            ${erstelleSpielerliste(spiel)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function sortiereSpiele(spiele) {
  const reihenfolge = {
    läuft: 1,
    laeuft: 1,
    laufend: 1,
    geplant: 2,
    offen: 2,
    pausiert: 3,
    verschoben: 3,
    beendet: 4,
    fertig: 4,
    abgeschlossen: 4
  };

  return [...spiele].sort((a, b) => {
    const statusA = String(
      leseSpielwert(
        a,
        ["status", "Status"],
        "geplant"
      )
    )
      .trim()
      .toLowerCase();

    const statusB = String(
      leseSpielwert(
        b,
        ["status", "Status"],
        "geplant"
      )
    )
      .trim()
      .toLowerCase();

    return (
      (reihenfolge[statusA] || 2) -
      (reihenfolge[statusB] || 2)
    );
  });
}

function formatiereUhrzeit() {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

async function ladeSpielplan() {
  const container =
    document.getElementById("spielplanTabelle");

  if (!container) {
    console.error(
      "Element #spielplanTabelle wurde nicht gefunden."
    );
    return;
  }

  container.innerHTML = `
    <div class="live-ladeanzeige">
      <div class="live-loader"></div>
      <p>Live-Spielplan wird geladen …</p>
    </div>
  `;

  try {
    const response = await fetch(SPIELPLAN_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "HTTP-Fehler: " + response.status
      );
    }

    const data = await response.json();

    console.log("Spielplan-Daten:", data);

    if (!Array.isArray(data.spiele)) {
      throw new Error(
        "Ungültige Antwort: 'spiele' fehlt."
      );
    }

    if (data.spiele.length === 0) {
      container.innerHTML = `
        <div class="live-leer">
          <span class="live-leer-symbol">🎲</span>

          <h3>
            Der Spielplan wird bald veröffentlicht.
          </h3>

          <p>
            Sobald die Begegnungen feststehen,
            werden sie hier angezeigt.
          </p>
        </div>
      `;
      return;
    }

    const spiele =
      sortiereSpiele(data.spiele);

    const laufendeSpiele =
      spiele.filter((spiel) => {
        const status = leseSpielwert(
          spiel,
          ["status", "Status"],
          "Geplant"
        );

        return istStatus(
          status,
          ["läuft", "laeuft", "laufend"]
        );
      });

    const weitereSpiele =
      spiele.filter((spiel) => {
        const status = leseSpielwert(
          spiel,
          ["status", "Status"],
          "Geplant"
        );

        return !istStatus(
          status,
          ["läuft", "laeuft", "laufend"]
        );
      });

    let html = `
      <div class="live-tafel">
        <div class="live-tafel-kopf">
          <div class="live-tafel-titel">
            <span class="live-punkt"></span>
            Live-Turnierübersicht
          </div>

          <div class="live-aktualisierung">
            Automatische Aktualisierung
            alle 60 Sekunden
          </div>
        </div>
    `;

    if (laufendeSpiele.length > 0) {
      html += `
        <section class="live-gruppe">
          <h3 class="live-gruppen-titel">
            <span class="live-punkt"></span>
            Aktuell laufende Spiele
          </h3>

          <div class="live-karten-grid">
      `;

      laufendeSpiele.forEach((spiel) => {
        html += erstelleSpielkarte(spiel);
      });

      html += `
          </div>
        </section>
      `;
    }

    if (weitereSpiele.length > 0) {
      html += `
        <section class="live-gruppe">
          <h3 class="live-gruppen-titel">
            Weitere Begegnungen
          </h3>

          <div class="live-karten-grid">
      `;

      weitereSpiele.forEach((spiel) => {
        html += erstelleSpielkarte(spiel);
      });

      html += `
          </div>
        </section>
      `;
    }

    html += `
        <div class="live-fuss">
          Zuletzt aktualisiert:
          <strong>
            ${formatiereUhrzeit()} Uhr
          </strong>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    console.error(
      "Spielplan-Fehler:",
      error
    );

    container.innerHTML = `
      <div class="live-fehler">
        <span class="live-fehler-symbol">❌</span>

        <h3>
          Spielplan konnte nicht geladen werden
        </h3>

        <p>
          Bitte lade die Seite in einigen
          Sekunden erneut.
        </p>
      </div>
    `;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  ladeSpielplan
);

setInterval(
  ladeSpielplan,
  AKTUALISIERUNG_MS
);
