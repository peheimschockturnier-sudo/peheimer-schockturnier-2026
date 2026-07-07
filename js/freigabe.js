}
const freigabe = new Date("2026-09-01T00:00:00");
const jetzt = new Date();

if (jetzt >= freigabe) {

    document.getElementById("anmeldungGesperrt").style.display = "none";
    document.getElementById("formularBereich").style.display = "block";

} else {

    function updateCountdown(){

        const diff = freigabe - new Date();

        const tage = Math.floor(diff/1000/60/60/24);
        const stunden = Math.floor(diff/1000/60/60)%24;
        const minuten = Math.floor(diff/1000/60)%60;

        document.getElementById("countdownFreigabe").innerHTML =

        `<h2>${tage} Tage ${stunden} Std. ${minuten} Min.</h2>
        <p>bis zum Anmeldestart</p>`;

    }

    updateCountdown();

    setInterval(updateCountdown,60000);

}
