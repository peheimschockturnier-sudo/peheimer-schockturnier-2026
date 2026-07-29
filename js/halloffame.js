console.log("halloffame.js wurde erfolgreich geladen");

function hallSichererText(wert) {
  return String(wert ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ermittleMedaille(platz) {
  const nummer = Number(platz);

  if (nummer === 1) {
    return {
      symbol: "🥇",
      bezeichnung: "1. Platz",
      klasse: "hall-gold"
    };
  }

  if (nummer === 2) {
    return {
      symbol: "🥈",
      bezeichnung: "2. Platz",
      klasse: "hall-silber"
    };
  }

  if (nummer === 3) {
    return {
      symbol: "🥉",
      bezeichnung: "3. Platz",
      klasse: "hall-bronze"
    };
  }

  return {
    symbol: "🏅",
    bezeichnung: nummer + ". Platz",
    klasse: "hall-weiterer-platz"
  };
}

function gruppiereGewinnerNachJahr(gewinner) {
  return gewinner.reduce(function (gruppen, eintrag) {
    const jahr = String(eintrag.jahr || "Unbekannt");

    if (!gruppen[jahr]) {
      gruppen[jahr] = [];
    }

    gruppen[jahr].push(eintrag);
    return gruppen;
  }, {});
}

function erstelleGewinnerEintrag(eintrag) {
  const medaille = ermittleMedaille(eintrag.platz);

  let spielerHtml = "";

  if (eintrag.spieler) {
    spielerHtml = `
      <p class="hall-spieler">
        ${hallSichererText(eintrag.spieler)}
      </p>
    `;
  }

  return `
    <article class="hall-platz ${medaille.klasse}">
      <div class="hall-medaille">
        ${medaille.symbol}
      </div>

      <div class="hall-platz-inhalt">
        <span class="hall-platz-bezeichnung">
          ${medaille.bezeichnung}
        </span>

        <h4>
          ${hallSichererText(
            eintrag.teamname || "Noch nicht eingetragen"
          )}
        </h4>

        ${spielerHtml}
      </div>
    </article>
  `;
}

function erstelleJahreskarte(jahr, eintraege) {
  const sortierteEintraege = [...eintraege].sort(function (a, b) {
    return Number(a.platz) - Number(b.platz);
  });

  const sieger = sortierteEintraege.find(function (eintrag) {
    return Number(eintrag.platz) === 1;
  });

  let bildHtml = "";

  if (sieger && sieger.bild) {
    bildHtml = `
      <div class="hall-bild">
        <img
          src="${hallSichererText(sieger.bild)}"
          alt="Gewinner des Turniers ${hallSichererText(jahr)}"
          loading="lazy"
        >
      </div>
    `;
  }

  return `
    <article class="hall-jahreskarte">
      <div class="hall-jahreskopf">
        <span class="hall-pokal">🏆</span>
        <h3>${hallSichererText(jahr)}</h3>
      </div>

      ${bildHtml}

      <div class="hall-platzierungen">
        ${sortierteEintraege
          .map(erstelleGewinnerEintrag)
          .join("")}
      </div>
    </article>
  `;
}

async function ladeHallOfFame() {
  const container =
    document.getElementById("hallOfFameContainer");

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
      "?action=halloffame&t=" +
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

    console.log("Hall-of-Fame-Daten:", data);

    if (data.erfolg === false) {
      throw new Error(
        data.fehler ||
        "Die Hall of Fame konnte nicht geladen werden."
      );
    }

    if (!Array.isArray(data.gewinner)) {
      throw new Error(
        "Ungültige Antwort: 'gewinner' fehlt."
      );
    }

    if (data.gewinner.length === 0) {
      container.innerHTML = `
        <div class="hall-leer">
          <span>🏆</span>

          <h3>Die Hall of Fame entsteht</h3>

          <p>
            Die Gewinner werden nach dem Turnier
            hier veröffentlicht.
          </p>
        </div>
      `;
      return;
    }

    const gruppen =
      gruppiereGewinnerNachJahr(data.gewinner);

    const jahre = Object.keys(gruppen).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    container.innerHTML = `
      <div class="hall-grid">
        ${jahre
          .map(function (jahr) {
            return erstelleJahreskarte(
              jahr,
              gruppen[jahr]
            );
          })
          .join("")}
      </div>
    `;

  } catch (error) {
    console.error("Hall-of-Fame-Fehler:", error);

    container.innerHTML = `
      <div class="hall-fehler">
        <span>❌</span>

        <h3>
          Hall of Fame konnte nicht geladen werden
        </h3>

        <p>
          ${hallSichererText(error.message)}
        </p>
      </div>
    `;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  ladeHallOfFame
);
