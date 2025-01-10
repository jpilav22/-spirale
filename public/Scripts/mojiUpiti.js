window.onload = function () {
    // Funkcija za prikazivanje upita korisnika
    function displayUserQueries(queries) {
        const container = document.getElementById("mojiUpitiContainer");

        // Ako nema upita
        if (queries.length === 0) {
            container.innerHTML = "<p>Nemate nijedan upit.</p>";
        } else {
            let htmlContent = "<ul>";
            queries.forEach(query => {
                htmlContent += `<li><strong>Nekretnina ID:</strong> ${query.id_nekretnine} <br><strong>Upit:</strong> ${query.tekst_upita}</li>`;
            });
            htmlContent += "</ul>";
            container.innerHTML = htmlContent;
        }
    }

    // Funkcija za prikazivanje poruke o neautorizovanom pristupu
    function displayErrorMessage() {
        const errorMessageDiv = document.getElementById("errorMessage");
        errorMessageDiv.style.display = "block";
    }

    // Provjerite da li je korisnik prijavljen i pozovite odgovarajuću funkciju
    PoziviAjax.getKorisnik(function (err, data) {
        if (err || !data || !data.username) {
            // Ako korisnik nije prijavljen, prikaži poruku o grešci
            displayErrorMessage();
        } else {
            // Ako je korisnik prijavljen, dohvati njegove upite
            PoziviAjax.getMojiUpiti(function (error, queries) {
                if (error) {
                    // Ako postoji greška prilikom dobavljanja upita, obavijestite korisnika
                    displayErrorMessage();
                } else {
                    // Prikazivanje upita
                    displayUserQueries(queries);
                }
            });
        }
    });
};
