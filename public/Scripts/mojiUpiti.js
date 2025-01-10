document.addEventListener("DOMContentLoaded", function() {
    // Poziv funkcije koja povlači upite korisnika
    PoziviAjax.getMojiUpiti((error, data) => {
        if (error) {
            console.error("Greška pri dohvatu upita:", error);
            return;
        }

        const upiti = JSON.parse(data); // pretvori JSON u JavaScript objekat
        const container = document.getElementById('upiti-container');
        
        // Ako nema upita
        if (upiti.length === 0) {
            container.innerHTML = '<p>Nemate upita.</p>';
            return;
        }

        // Kreiraj HTML elemente za svaki upit
        upiti.forEach(upit => {
            const upitElement = document.createElement('div');
            upitElement.classList.add('upit-item');
            upitElement.innerHTML = `
                <p><strong>ID Nekretnine:</strong> ${upit.id_nekretnine}</p>
                <p><strong>Upit:</strong> ${upit.tekst_upita}</p>
            `;
            container.appendChild(upitElement);
        });
    });
});
