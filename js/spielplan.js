const SPIELPLAN_URL ="https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec?action=spielplan";
 
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
              <th>Uhrzeit</th>
              <th>Team A</th>
              <th>Team B</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.spiele.forEach((spiel) => {
      const status = String(spiel.status || "Geplant").trim();

      let badgeClass = "badge geplant";

      if (status.toLowerCase() === "läuft") {
        badgeClass = "badge laeuft";
      }

      if (status.toLowerCase() === "beendet") {
        badgeClass = "badge beendet";
      }

      html += `
        <tr>
          <td>${spiel.runde || ""}</td>
          <td>${spiel.tisch || ""}</td>
          <td>${spiel.uhrzeit || ""}</td>
          <td>${spiel.teamA || ""}</td>
          <td>${spiel.teamB || ""}</td>
          <td>
            <span class="${badgeClass}">
              ${status}
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
