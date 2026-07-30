console.log("halloffame.js wurde erfolgreich geladen");

function hallSichererText(wert) {
  return String(wert ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalisiereKategorie(kategorie) {
  return String(kategorie || "")
    .trim()
    .toLowerCase()
    .replaceAll("ö", "oe")
    .replaceAll("ä", "ae")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}

function istTeamEintrag(eintrag) {
  return normalisiereKategorie(
    eintrag.kategorie
  ) === "team";
}

function istSchockTitel(eintrag) {
  const kategorie =
    normalisiereKategorie(
      eintrag.kategorie
    );

  return (
    kategorie === "schockkoenig" ||
    kategorie === "schockkoenigin" ||
    kategorie === "schockkonig"
  );
}

function ermittleSchockTitel(eintrag) {
  const kategorie =
    normalisiereKategorie(
      eintrag.kategorie
    );

  if (kategorie === "schockkoenigin") {
    return "Schock-Königin";
  }

  return "Schock-König";
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

function gruppiereNachJahr(eintraege) {
  return eintraege.reduce(function (
    gruppen,
    eintrag
  ) {
    const jahr =
      String(eintrag.jahr || "Unbekannt");

    if (!gruppen[jahr]) {
      gruppen[jahr] = [];
    }

    gruppen[jahr].push(eintrag);

    return gruppen;
  }, {});
}

function erstelleSchockTitel(eintrag) {
  if (!eintrag) {
    return `
      <div class="hall-schocktitel hall-schocktitel-offen">
        <div class="hall-krone">👑</div>

        <div>
          <span class="hall-schock-label">
            Schock-König oder Schock-Königin
          </span>

          <h4>Noch nicht vergeben</h4>
        </div>
      </div>
    `;
  }

  const titel =
    ermittleSchockTitel(eintrag);

  const schockHtml =
    Number(eintrag.schocks) > 0
      ? `
        <span class="hall-schockanzahl">
          🎲 ${hallSichererText(
            eintrag.schocks
          )} Schocks
        </span>
      `
      : "";

  return `
    <div class="hall-schocktitel">
      <div class="hall-krone">👑</div>

      <div class="hall-schock-inhalt">
        <span class="hall-schock-label">
          ${hallSichererText(titel)}
        </span>

        <h4>
          ${hallSichererText(
            eintrag.spieler ||
            eintrag.teamname ||
            "Noch offen"
          )}
        </h4>

        ${schockHtml}
      </div>
    </div>
  `;
}

function erstelleTeamPlatz(eintrag) {
  const medaille =
    ermittleMedaille(eintrag.platz);

  const spielerHtml =
    eintrag.spieler
      ? `
        <p class="hall-spieler">
          ${hallSichererText(
            eintrag.spieler
          )}
        </p>
      `
      : "";

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
            eintrag.teamname ||
            "Noch nicht eingetragen"
          )}
        </h4>

        ${spielerHtml}
      </div>
    </article>
  `;
}

function erstelleJahreskarte(jahr, eintraege) {
  const teams = eintraege
    .filter(istTeamEintrag)
    .sort(function (a, b) {
      return Number(a.platz) -
        Number(b.platz);
    });

  const schockTitel =
    eintraege.find(istSchockTitel);

  const sieger =
    teams.find(function (eintrag) {
      return Number(eintrag.platz) === 1;
    });

  const bild =
    (sieger && sieger.bild) ||
    (schockTitel && schockTitel.bild) ||
    "";

  const bildHtml = bild
    ? `
      <div class="hall-bild">
        <img
          src="${hallSichererText(bild)}"
          alt="Gewinner des Peheimer Schock Turniers ${hallSichererText(jahr)}"
          loading="lazy"
        >
      </div>
    `
    : "";

  const teamsHtml =
    teams.length > 0
      ? teams
          .map(erstelleTeamPlatz)
          .join("")
      : `
        <div class="hall-keine-platzierung">
          Die Platzierungen stehen noch nicht fest.
        </div>
      `;

  return `
    <article class="hall-jahreskarte">
      <div class="hall-jahreskopf">
        <span class="hall-pokal">🏆</span>

        <div>
          <span class="hall-turniername">
            Peheimer Schock Turnier
          </span>

          <h3>${hallSichererText(jahr)}</h3>
        </div>
      </div>

      ${bildHtml}

      ${erstelleSchockTitel(schockTitel)}

      <div class="hall-trennlinie"></div>

      <div class="hall-platzierungen">
        ${teamsHtml}
      </div>
    </article>
  `;
}

async function ladeHallOfFame() {
  const container =
    document.getElementById(
      "hallOfFameContainer"
    );

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
        "HTTP-Fehler: " +
        response.status
      );
    }

    const data =
      await response.json();

    console.log(
      "Hall-of-Fame-Daten:",
      data
    );

    if (data.erfolg === false) {
      throw new Error(
        data.fehler ||
        "Hall of Fame konnte nicht geladen werden."
      );
    }

    if (!Array.isArray(data.eintraege)) {
      throw new Error(
        "Ungültige Antwort: 'eintraege' fehlt."
      );
    }

    if (data.eintraege.length === 0) {
      container.innerHTML = `
        <div class="hall-leer">
          <span>🏆</span>

          <h3>
            Die Hall of Fame entsteht
          </h3>

          <p>
            Die Gewinner und der Schock-König
            oder die Schock-Königin werden hier
            veröffentlicht.
          </p>
        </div>
      `;

      return;
    }

    const gruppen =
      gruppiereNachJahr(
        data.eintraege
      );

    const jahre =
      Object.keys(gruppen).sort(
        function (a, b) {
          return Number(b) -
            Number(a);
        }
      );

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
    console.error(
      "Hall-of-Fame-Fehler:",
      error
    );

    container.innerHTML = `
      <div class="hall-fehler">
        <span>❌</span>

        <h3>
          Hall of Fame konnte nicht geladen werden
        </h3>

        <p>
          ${hallSichererText(
            error.message
          )}
        </p>
      </div>
    `;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  ladeHallOfFame
);
