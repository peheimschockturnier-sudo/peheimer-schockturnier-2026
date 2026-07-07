const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec";

const maxGruppen = 30;

async function ladeAnmeldestatus() {
  const statusText = document.getElementById("statusText");
  const teilnehmerzahl = document.getElementById("teilnehmerzahl");
  const progressBar = document.getElementById("progressBar");
  const progressCircle = document.getElementById("progressCircle");
  const spielerText = document.getElementById("spielerText");

  try {
    const response = await fetch(WEBAPP_URL);
    const data = await response.json();

    const gruppen = Number(data.gruppen || 0);
    const freieGruppen = Number(data.freieGruppen || Math.max(0, maxGruppen - gruppen));
    const prozent = Math.min(100, (gruppen / maxGruppen) * 100);

    teilnehmerzahl.textContent = gruppen;
    progressBar.style.width = prozent + "%";

    if (progressCircle) {
      const umfang = 471;
      progressCircle.style.strokeDashoffset = umfang - (umfang * prozent / 100);
    }

    if (spielerText) {
      spielerText.innerHTML = `Aktuell ca. ${gruppen * 4} von ${maxGruppen * 4} Spielern`;
    }

    if (gruppen >= maxGruppen) {
      statusText.innerHTML = "🔴 Das Turnier ist ausgebucht!";
    } else {
      statusText.innerHTML =
        `${gruppen} von ${maxGruppen} Gruppen angemeldet<br>Noch ${freieGruppen} Gruppen frei`;
    }

  } catch (error) {
    console.error(error);
    statusText.innerHTML = "❌ Anmeldestatus konnte nicht geladen werden.";
  }
}

ladeAnmeldestatus();
