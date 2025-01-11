window.onload = function() {
    // Pozivamo funkciju za učitavanje upita
    PoziviAjax.getMojiUpiti(function(err, data) {
      if (err) {
        // Ako dođe do greške, obavještavamo korisnika
        alert("Greška pri učitavanju upita: " + err);
      } else {
        // Ako uspješno dobijemo podatke, prikazujemo ih na stranici
        let upitiList = document.getElementById("upiti-lista");
        if (data.length === 0) {
          upitiList.innerHTML = "<p>Nema vaših upita.</p>";
        } else {
          let htmlContent = "<ul>";
          data.forEach(query => {
            htmlContent += `<li>Nekretnina ID: ${query.id_nekretnine}, Upit: ${query.tekst_upita}</li>`;
          });
          htmlContent += "</ul>";
          upitiList.innerHTML = htmlContent;
        }
      }
    });
  };
  