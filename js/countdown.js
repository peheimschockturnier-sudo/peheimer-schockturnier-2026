const zielDatum = new Date('2026-10-10T14:00:00').getTime();
function countdown(){
  const jetzt = Date.now();
  const differenz = zielDatum - jetzt;
  if(differenz <= 0){ document.getElementById('countdown').innerHTML='🎉 Das Turnier läuft!'; return; }
  document.getElementById('tage').textContent = Math.floor(differenz/(1000*60*60*24));
  document.getElementById('stunden').textContent = Math.floor((differenz/(1000*60*60))%24);
  document.getElementById('minuten').textContent = Math.floor((differenz/(1000*60))%60);
  document.getElementById('sekunden').textContent = Math.floor((differenz/1000)%60);
}
countdown(); setInterval(countdown,1000);
