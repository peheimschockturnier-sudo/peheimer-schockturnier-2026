const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwu4sHhqYM3Q3BYzdVaC5HfrpzCsssnX1_CAmwh23-Fla8z2E6YxvrxqyRva8fmEGIe/exec";

const formular = document.getElementById("anmeldungForm");
const meldung = document.getElementById("meldung");

formular.addEventListener("submit", async function (e) {
  e.preventDefault();

  meldung.innerHTML = "⏳ Anmeldung wird gespeichert...";

  const daten = {
    vorname: formular.vorname.value.trim(),
    nachname: formular.nachname.value.trim(),
    telefon: formular.telefon.value.trim(),
    email: formular.email.value.trim(),
    teamname: formular.teamname.value.trim(),
    spieler1: formular.spieler1.value.trim(),
    spieler2: formular.spieler2.value.trim(),
    spieler3: formular.spieler3.value.trim(),
    spieler4: formular.spieler4.value.trim()
  };

  try {
    const response = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify(daten)
    });

    const result = await response.json();

    if (result.success) {
      meldung.innerHTML =
        "✅ Vielen Dank! Eure Anmeldung wurde erfolgreich gespeichert.";

      formular.reset();
    } else {
      meldung.innerHTML =
        "❌ " + (result.message || "Die Anmeldung konnte nicht gespeichert werden.");
    }

  } catch (error) {
    console.error(error);

    meldung.innerHTML =
      "❌ Fehler beim Speichern. Bitte versuche es später erneut.";
  }
});
