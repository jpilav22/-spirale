let StatistikaNekretnina = function () {

    let spisak = SpisakNekretnina();


    let init = function (listaNekretnina, listaKorisnika) {
        spisak.init(listaNekretnina, listaKorisnika);
    };


    let prosjecnaKvadratura = function (kriterij) {
        let filtriraneNekretnine = spisak.filtrirajNekretnine(kriterij);
        if (filtriraneNekretnine.length === 0) return 0;
        let ukupnaKvadratura = filtriraneNekretnine.reduce((sum, nekretnina) => sum + nekretnina.kvadratura, 0);
        return ukupnaKvadratura / filtriraneNekretnine.length;
    };


    let outlier = function (kriterij, nazivSvojstva) {

        let filtriraneNekretnine = spisak.filtrirajNekretnine(kriterij);

        if (filtriraneNekretnine.length === 0) return null;

        let prosjecnaVrijednost = filtriraneNekretnine.reduce((sum, nekretnina) => sum + nekretnina[nazivSvojstva], 0) / filtriraneNekretnine.length;
        let najveceOdstupanje = filtriraneNekretnine.reduce((outlier, nekretnina) => {
            let odstupanje = Math.abs(nekretnina[nazivSvojstva] - prosjecnaVrijednost);
            return odstupanje > outlier.odstupanje ? { nekretnina, odstupanje } : outlier;
        }, { nekretnina: null, odstupanje: -Infinity });

        return najveceOdstupanje.nekretnina;
    };




    let mojeNekretnine = function (korisnickoIme) {

        let korisnik = spisak.listaKorisnika.find(k => k.username === korisnickoIme);


        if (!korisnik) {
            console.log("Korisnik sa korisničkim imenom " + korisnickoIme + " nije pronađen.");
            return [];
        }


        let korisnikoveNekretnine = spisak.listaNekretnina.filter(nekretnina => {
            return nekretnina.upiti && nekretnina.upiti.some(upit => upit.korisnik_id === korisnik.id);
        });


        return korisnikoveNekretnine.sort((a, b) => {
            let brojUpitaA = a.upiti.filter(upit => upit.korisnik_id === korisnik.id).length;
            let brojUpitaB = b.upiti.filter(upit => upit.korisnik_id === korisnik.id).length;
            return brojUpitaB - brojUpitaA;
        });
    };



    let histogramCijena = function (periodi, rasponiCijena) {
        let rezultat = [];
        periodi.forEach((period, indeksPerioda) => {
            let periodOd = new Date(period.od.split('.').reverse().join('-'));
            let periodDo = new Date(period.do.split('.').reverse().join('-'));

            let nekretnineUPeriodu = spisak.listaNekretnina.filter(nekretnina => {
                let datumObjave = new Date(nekretnina.datum_objave.split('.').reverse().join('-'));
                return datumObjave >= periodOd && datumObjave <= periodDo;
            });

            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
                let brojNekretnina = nekretnineUPeriodu.filter(nekretnina => {
                    return nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do;
                }).length;

                rezultat.push({
                    indeksPerioda,
                    indeksRasponaCijena,
                    brojNekretnina
                });
            });
        });

        return rezultat;
    };

    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    };
};