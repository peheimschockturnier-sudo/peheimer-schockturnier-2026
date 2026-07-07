const TESTMODUS = false;
const freigabe = new Date("2026-09-01T00:00:00");

const anmeldungGesperrt = document.getElementById("anmeldungGesperrt");
const formularBereich = document.getElementById("formularBereich");
const countdownFreigabe = document.getElementById("countdownFreigabe");

function zeigeFormular() {
  anmeldungGesperrt.style.display = "none";
  formularBereich.style.display = "block";
}

function zeigeSperrseite() {
  anmeldungGesperrt.style.display = "block";
  formularBereich.style.display = "none";
}

if (TESTMODUS || new Date() >= freigabe) {
  zeigeFormular();
} else {
  zeigeSperrseite();

  function updateFreigabeCountdown() {
    const diff = freigabe - new Date();

    const tage = Math.floor(diff / 1000 / 60 / 60 / 24);
    const stunden = Math.floor(diff / 1000 / 60 / 60) % 24;
    const minuten = Math.floor(diff / 1000 / 60) % 60;

    countdownFreigabe.innerHTML =
      `${tage} Tage · ${stunden} Std. · ${minuten} Min. bis zum Anmeldestart`;
  }

  updateFreigabeCountdown();
  setInterval(updateFreigabeCountdown, 60000);
}
