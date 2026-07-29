const TESTMODUS = true;
const FREIGABE_DATUM = new Date("2026-09-01T00:00:00");

const WEBAPP_URL="https://script.google.com/macros/s/AKfycbyC8HVOroZPdbWHKviQmz-lieJTwoJYAyyUZWCq_Ew4qC72XInFMHO1SQBpHdl1agMqrA/exec";

const anmeldungGesperrt =
  document.getElementById("anmeldungGesperrt");

const formularBereich =
  document.getElementById("formularBereich");

const countdownFreigabe =
  document.getElementById("countdownFreigabe");


function zeigeFormular() {
  if (anmeldungGesperrt) {
    anmeldungGesperrt.style.display = "none";
  }

  if (formularBereich) {
    formularBereich.style.display = "block";
  }
}


function zeigeSperrseite(text) {
  if (anmeldungGesperrt) {
    anmeldungGesperrt.style.display = "block";

    const beschreibung =
      anmeldungGesperrt.querySelector("p");

    if (beschreibung && text) {
      beschreibung.textContent = text;
    }
  }

  if (formularBereich) {
    formularBereich.style.display = "none";
  }
}


function formatiereCountdown(diff) {
  const tage = Math.max(
    0,
    Math.floor(diff / 1000 / 60 / 60 / 24)
  );

  const stunden = Math.max(
    0,
    Math.floor(diff / 1000 / 60 / 60) % 24
  );

  const minuten = Math.max(
    0,
    Math.floor(diff / 1000 / 60) % 60
  );

  return (
    `${tage} Tage · ` +
    `${stunden} Std. · ` +
    `${minuten} Min. bis zum Anmeldestart`
  );
}


function updateFreigabeCountdown() {
  if (!countdownFreigabe) {
    return;
  }

  const diff =
    FREIGABE_DATUM.getTime() -
    new Date().getTime();

  if (diff <= 0) {
    countdownFreigabe.innerHTML = "";
    pruefeFreigabe();
    return;
  }

  countdownFreigabe.innerHTML =
    formatiereCountdown(diff);
}


async function ladeEinstellungen() {
  const response = await fetch(
    WEBAPP_URL +
    "?action=einstellungen&t=" +
    Date.now(),
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      "HTTP-Fehler: " + response.status
    );
  }

  const data = await response.json();

  if (data.erfolg === false) {
    throw new Error(
      data.fehler ||
      "Einstellungen konnten nicht geladen werden."
    );
  }

  return data;
}


async function pruefeFreigabe() {
  const jetzt = new Date();

  /*
    Im Testmodus wird das Formular unabhängig vom Datum
    und unabhängig von der Einstellung angezeigt.
  */
  if (TESTMODUS) {
    zeigeFormular();
    return;
  }

  /*
    Vor dem 01.09.2026 bleibt die Anmeldung gesperrt.
  */
  if (jetzt < FREIGABE_DATUM) {
    zeigeSperrseite(
      "Die Anmeldung zum 2. Peheimer Schock Turnier " +
      "ist derzeit noch nicht freigeschaltet."
    );

    updateFreigabeCountdown();
    return;
  }

  /*
    Nach dem Freigabedatum wird zusätzlich geprüft,
    ob die Anmeldung in Google Sheets geöffnet ist.
  */
  try {
    const einstellungen =
      await ladeEinstellungen();

    if (einstellungen.anmeldungOffen === false) {
      zeigeSperrseite(
        "Die Anmeldung zum 2. Peheimer Schock Turnier " +
        "ist derzeit geschlossen."
      );

      if (countdownFreigabe) {
        countdownFreigabe.innerHTML =
          "Eine Anmeldung ist momentan nicht möglich.";
      }

      return;
    }

    zeigeFormular();

  } catch (error) {
    console.error(
      "Fehler bei der Freigabeprüfung:",
      error
    );

    /*
      Sicherheitslösung:
      Wenn die Einstellungen nicht geladen werden können,
      wird das Formular nicht angezeigt.
    */
    zeigeSperrseite(
      "Die Anmeldung kann derzeit technisch nicht " +
      "freigeschaltet werden. Bitte versucht es später erneut."
    );

    if (countdownFreigabe) {
      countdownFreigabe.innerHTML =
        "Verbindung zur Turnierverwaltung fehlgeschlagen.";
    }
  }
}


pruefeFreigabe();

setInterval(function () {
  if (new Date() < FREIGABE_DATUM) {
    updateFreigabeCountdown();
  } else {
    pruefeFreigabe();
  }
}, 60000);
