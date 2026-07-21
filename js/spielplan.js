const SPIELPLAN_URL="https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec?action=spielplan";
console.log("spielplan.js wurde erfolgreich geladen");
function sichererText(wert) {
  return String(wert ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function ladeSpielplan() {
  const container = document.getElementById("spielplanTabelle");

  if (!container) {
    console.error("Element #spielplanTabelle wurde nicht gefunden.");
    return;
  }

  container.innerHTML = "<p>Spielplan wird geladen ...</p>";

  try {
    const response = await fetch(SPIELPLAN_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("HTTP-Fehler: " + response.status);
    }

    const data = await response.json();

    console.log("Spielplan-Daten:", data);
    console.log("Erstes Spiel:", data.spiele?.[0]);

    if (!Array.isArray(data.spiele)) {
      throw new Error("Ungültige Antwort: 'spiele' fehlt.");
    }

    if (data.spiele.length === 0) {
      container.innerHTML =
        "<p>Der Spielplan wird bald veröffentlicht.</p>";
      return;
    }

    let html = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Runde</th>
              <th>Tisch</th>
              <th>Teamname</th>
              <th>Spieler 1</th>
              <th>Spieler 2</th>
              <th>Spieler 3</th>
              <th>Spieler 4</th>
              <th>Spieler 5</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.spiele.forEach((spiel) => {
      const status = String(
        spiel.status ??
        spiel.Status ??
        "Geplant"
      ).trim();

      let badgeClass = "badge geplant";

      if (status.toLowerCase() === "läuft") {
        badgeClass = "badge laeuft";
      } else if (status.toLowerCase() === "beendet") {
        badgeClass = "badge beendet";
      }

      const runde = spiel.runde ?? spiel.Runde ?? "";
      const tisch = spiel.tisch ?? spiel.Tisch ?? "";
      const teamname =
        spiel.teamname ??
        spiel.Teamname ??
        spiel["Teamname"] ??
        "";

      const spieler1 =
        spiel.spieler1 ??
        spiel.Spieler1 ??
        spiel["Spieler 1"] ??
        "";

      const spieler2 =
        spiel.spieler2 ??
        spiel.Spieler2 ??
        spiel["Spieler 2"] ??
        "";

      const spieler3 =
        spiel.spieler3 ??
        spiel.Spieler3 ??
        spiel["Spieler 3"] ??
        "";

      const spieler4 =
        spiel.spieler4 ??
        spiel.Spieler4 ??
        spiel["Spieler 4"] ??
        "";

      const spieler5 =
        spiel.spieler5 ??
        spiel.Spieler5 ??
        spiel["Spieler 5"] ??
        "";

      html += `
        <tr>
          <td>${sichererText(runde)}</td>
          <td>${sichererText(tisch)}</td>
          <td>${sichererText(teamname)}</td>
          <td>${sichererText(spieler1)}</td>
          <td>${sichererText(spieler2)}</td>
          <td>${sichererText(spieler3)}</td>
          <td>${sichererText(spieler4)}</td>
          <td>${sichererText(spieler5)}</td>
          <td>
            <span class="${badgeClass}">
              ${sichererText(status)}
            </span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

  } catch (error) {
    console.error("Spielplan-Fehler:", error);

    container.innerHTML =
      "<p>❌ Spielplan konnte nicht geladen werden.</p>";
  }
}

document.addEventListener("DOMContentLoaded", ladeSpielplan);

setInterval(ladeSpielplan, 60000);
