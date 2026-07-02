// Hier später die Google Apps Script Web-App-URL einfügen:
const WEBAPP_URL = '';
const maxTeilnehmer = 120;
async function ladeStatus(){
  let angemeldet = 0;
  try{
    if(WEBAPP_URL){
      const res = await fetch(WEBAPP_URL);
      const data = await res.json();
      angemeldet = Number(data.teilnehmer || 0);
    }
  }catch(e){ console.warn('Teilnehmerzahl konnte nicht geladen werden', e); }
  const frei = Math.max(0, maxTeilnehmer - angemeldet);
  const prozent = Math.min(100, angemeldet / maxTeilnehmer * 100);
  document.getElementById('teilnehmerzahl').textContent = angemeldet;
  document.getElementById('progressBar').style.width = prozent + '%';
  document.getElementById('progressCircle').style.strokeDashoffset = 471 - (471 * prozent / 100);
  document.getElementById('statusText').innerHTML = angemeldet >= maxTeilnehmer ? '🔴 Das Turnier ist ausgebucht!' : `${angemeldet} von ${maxTeilnehmer} Plätzen vergeben<br>Noch ${frei} Plätze frei`;
}
ladeStatus();
