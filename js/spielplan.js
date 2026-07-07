const SPIELPLAN_URL = "const SPIELPLAN_URL = "https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec?action=spielplan";";

async function ladeSpielplan() {
  const container = document.getElementById("spielplanTabelle");

  try {
    const response = await fetch(SPIELPLAN_URL);
    const data = await response.json();

    if (!data.spiele || data.spiele.length === 0) {
      container.innerHTML = "<p>Der Spielplan wird bald veröffentlicht.</p>";
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

    data.spiele.forEach(spiel => {
      let badgeClass = "badge geplant";

      if (spiel.status === "Läuft") badgeClass = "badge laeuft";
      if (spiel.status === "Beendet") badgeClass = "badge beendet";

      html += `
        <tr>
          <td>${spiel.runde}</td>
          <td>${spiel.tisch}</td>
          <td>${spiel.uhrzeit}</td>
          <td>${spiel.teamA}</td>
          <td>${spiel.teamB}</td>
          <td><span class="${badgeClass}">${spiel.status || "Geplant"}</span></td>
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
    console.error(error);
    container.innerHTML = "<p>❌ Spielplan konnte nicht geladen werden.</p>";
  }
}

ladeSpielplan();
setInterval(ladeSpielplan, 60000);
