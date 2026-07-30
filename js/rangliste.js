function erstelleRangzeile(eintrag) {
  const platz = rangZahl(eintrag.platz);
  const klasse = ermittleRangKlasse(platz);
  const symbol = ermittleRangSymbol(platz);

  return `
    <tr class="${klasse}">
      <td class="rang-platz">
        <span class="rang-symbol">${symbol}</span>
        <strong>${rangSichererText(platz || "-")}</strong>
      </td>

      <td class="rang-spieler">
        ${rangSichererText(eintrag.spieler || "Unbekannt")}
      </td>

      <td class="rang-team">
        ${rangSichererText(eintrag.teamname || "-")}
      </td>

      <td>
        ${rangSichererText(eintrag.punkte || "0")}
      </td>

      <td>
        ${rangSichererText(eintrag.schockOuts || "0")}
      </td>
    </tr>
  `;
}
