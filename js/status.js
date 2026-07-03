const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxhsbkkfUKRYlbd_00HIegKbEhPUTy14Pl_Zv10hFXEHd0HV_sMMLdd4GkXt0EbKXqWGQ/exec";

const maxGruppen = 30;
const spielerProGruppe = 4;

fetch(WEBAPP_URL)
  .then(response => response.json())
  .then(data => {
    const gruppen = Number(data.gruppen || data.teilnehmer || 0);
    const freieGruppen = Math.max(0, maxGruppen - gruppen);
    const spieler = gruppen * spielerProGruppe;
    const maxSpieler = maxGruppen * spielerProGruppe;
    const prozent = Math.min(100, (gruppen / maxGruppen) * 100);

    document.getElementById("teilnehmerzahl").textContent = gruppen;
    document.getElementById("progressBar").style.width = prozent + "%";

    const circle = document.getElementById("progressCircle");
    if (circle) {
      const umfang = 471;
      circle.style.strokeDashoffset = umfang - (umfang * prozent / 100);
    }

    if (gruppen >= maxGruppen) {
      document.getElementById("statusText").innerHTML =
        "🔴 Das Turnier ist ausgebucht!";
      document.getElementById("spielerText").innerHTML =
        `${maxGruppen} Gruppen · ${maxSpieler} Spieler`;
    } else {
      document.getElementById("statusText").innerHTML =
        `${gruppen} von ${maxGruppen} Gruppen angemeldet<br>Noch ${freieGruppen} Gruppen frei`;

      document.getElementById("spielerText").innerHTML =
        `Aktuell ca. ${spieler} von ${maxSpieler} Spielern`;
    }
  })
  .catch(() => {
    document.getElementById("statusText").innerHTML =
      "❌ Anmeldestatus konnte nicht geladen werden.";
  });
