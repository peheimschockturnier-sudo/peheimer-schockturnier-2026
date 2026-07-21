const SPIELPLAN_URL ="https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec?action=spielplan";
console.log("spielplan.js wurde erfolgreich geladen");
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
          <td>${spiel.Teamname || ""}</td>
          <td>${spiel.Spieler 1 || ""}</td>
          <td>${spiel.Spieler 2 || ""}</td>
          <td>${spiel.Spieler 3 || ""}</td>
          <td>${spiel.Spieler 4 || ""}</td>
          <td>${spiel.Spieler 5 || ""}</td>                
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
