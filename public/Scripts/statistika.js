
const listaNekretnina = [{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2023.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 32000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2009.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},{
    id: 1,
    tip_nekretnine: "Stan",
    naziv: "Useljiv stan Sarajevo",
    kvadratura: 58,
    cijena: 232000,
    tip_grijanja: "plin",
    lokacija: "Novo Sarajevo",
    godina_izgradnje: 2019,
    datum_objave: "01.10.2003.",
    opis: "Sociis natoque penatibus.",
    upiti: [{
        korisnik_id: 1,
        tekst_upita: "Nullam eu pede mollis pretium."
    },
    {
        korisnik_id: 2,
        tekst_upita: "Phasellus viverra nulla."
    }]
},
{
    id: 2,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 3,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
},
{
    id: 4,
    tip_nekretnine: "Kuća",
    naziv: "Mali poslovni prostor",
    kvadratura: 20,
    cijena: 70000,
    tip_grijanja: "struja",
    lokacija: "Centar",
    godina_izgradnje: 2005,
    datum_objave: "20.08.2023.",
    opis: "Magnis dis parturient montes.",
    upiti: [{
        korisnik_id: 2,
        tekst_upita: "Integer tincidunt."
    }
    ]
}]

const listaKorisnika = [{
    id: 1,
    ime: "Neko",
    prezime: "Nekic",
    username: "username1",
},
{
    id: 2,
    ime: "Neko2",
    prezime: "Nekic2",
    username: "username2",
}]


document.addEventListener("DOMContentLoaded", () => {

    const statistika = StatistikaNekretnina();
    statistika.init(listaNekretnina, listaKorisnika);

    function parseKriterij(kriterijInput) {
        const kriterij = {};


        const regex = /^(tip_nekretnine|max_kvadratura|min_kvadratura|max_cijena|min_cijena):(.+)$/;
        const match = kriterijInput.trim().match(regex);

        if (match) {
            const svojstvo = match[1];
            const vrijednost = match[2].trim();


            if (svojstvo === "tip_nekretnine") {
                kriterij.tip_nekretnine = vrijednost;
            } else if (svojstvo === "tip_nekretnine" || svojstvo === "min_kvadratura" || svojstvo === "max_kvadratura" || svojstvo === "min_cijena" || svojstvo === "max_cijena") {
                kriterij[svojstvo.toLowerCase()] = parseFloat(vrijednost);
            } else {
                return null;  
            }

            return kriterij;
        }

        return null;  
    }

    document.getElementById("filterForm").addEventListener("submit", (e) => {
        e.preventDefault();

        const kriterijInput = document.getElementById("kriterijInput").value;
        const kriterij = parseKriterij(kriterijInput);

        if (kriterij) {
            const prosjek = statistika.prosjecnaKvadratura(kriterij);
            document.getElementById("filterResult").textContent = `Prosječna kvadratura za vaš kriterij je ${prosjek.toFixed(2)} m².`;
        } else {
            document.getElementById("filterResult").textContent = "Unijeli ste neispravan kriterij.";
        }
    });


   
    document.getElementById("addPeriodBtn").addEventListener("click", () => {
        const periodsContainer = document.getElementById("periodsContainer");
        const newPeriodHTML = document.createElement('div');
        newPeriodHTML.classList.add('periodFields');
        newPeriodHTML.innerHTML = `
            <input type="text" class="startDate" placeholder="01.01.2000." required>
            <input type="text" class="endDate" placeholder="31.12.2024." required>
        `;
        periodsContainer.appendChild(newPeriodHTML);  
    });

    
    document.getElementById("addPriceRangeBtn").addEventListener("click", () => {
        const priceRangesContainer = document.getElementById("priceRangesContainer");
        const newPriceRangeHTML = document.createElement('div');
        newPriceRangeHTML.classList.add('priceRangeFields');
        newPriceRangeHTML.innerHTML = `
            <input type="number" class="minPrice" placeholder="0" required>
            <input type="number" class="maxPrice" placeholder="300000" required>
        `;
        priceRangesContainer.appendChild(newPriceRangeHTML);  
    });

    
    document.getElementById("histogramForm").addEventListener("submit", (e) => {
        e.preventDefault();

        
        const periods = [];
        const startDates = document.querySelectorAll(".startDate");
        const endDates = document.querySelectorAll(".endDate");
        startDates.forEach((start, idx) => {
            periods.push({ od: start.value, do: endDates[idx].value });
        });

        
        const priceRanges = [];
        const minPrices = document.querySelectorAll(".minPrice");
        const maxPrices = document.querySelectorAll(".maxPrice");
        minPrices.forEach((min, idx) => {
            priceRanges.push({ od: parseInt(min.value, 10), do: parseInt(maxPrices[idx].value, 10) });
        });

       
        const histogramData = statistika.histogramCijena(periods, priceRanges);
        console.log("Histogram Data: ", histogramData);

        
        const labels = priceRanges.map(range => `${range.od} - ${range.do}`);

        
        const datasets = [];
        const colors = ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)", "rgb(75, 192, 192)"];
        periods.forEach((period, index) => {
            const data = priceRanges.map(range => {
                return histogramData.filter(d => d.indeksPerioda === index && d.indeksRasponaCijena === priceRanges.indexOf(range))
                    .reduce((sum, d) => sum + d.brojNekretnina, 0);
            });

            const labelPeriod = `${period.od} - ${period.do}`;
            datasets.push({
                label: labelPeriod,
                data: data,
                backgroundColor: colors[index % colors.length],
                borderColor: colors[index % colors.length].replace('0.6', '1'),
                borderWidth: 1
            });
        });

        
        const ctx = document.getElementById("histogramChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: { display: true, text: "Rasponi cijena" }
                    },
                    y: {
                        title: { display: true, text: "Broj nekretnina" },
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            boxWidth: 20,
                            padding: 15
                        }
                    }
                },
                elements: {
                    bar: {
                        borderWidth: 2
                    }
                },
                stacked: true
            }
        });
    });




    
   

   
    document.getElementById('ispisiMojeneKretnine').addEventListener('click', function () {
        let korisnickoIme = document.getElementById('username').value;
    
        if (korisnickoIme.trim() === "") {
            alert("Unesite korisničko ime.");
            return;
        }
    
        let nekretnine = statistika.mojeNekretnine(korisnickoIme);
        
        console.log("Nekretnine korisnika:", nekretnine);  
        let resultDiv = document.getElementById('nekretnineResult');
        resultDiv.innerHTML = "";  
    
        if (nekretnine.length === 0) {
            resultDiv.innerHTML = "Nema nekretnina za korisnika " + korisnickoIme;
        } else {
            let html = "<h2>Nekretnine korisnika " + korisnickoIme + ":</h2><ul>";
            nekretnine.forEach(function (nekretnina) {
                html += `<li><strong>${nekretnina.naziv}</strong> - ${nekretnina.lokacija} (Cijena: ${nekretnina.cijena} KM)</li>`;
            });
            html += "</ul>";
            resultDiv.innerHTML = html;
        }
    });

    const validnaSvojstva = ["cijena", "kvadratura", "godina_izgradnje"];
    document.getElementById("checkKriterijBtnOutlier").addEventListener("click", () => {
        const kriterijInput = document.getElementById("kriterijInputOutlier").value;
        const kriterij = parseKriterij(kriterijInput);

        if (!kriterij) {
            document.getElementById("filterResultOutlier").textContent = "Kriterij je neispravan.";
            document.getElementById("svojstvoInputOutlier").disabled = true;
            document.getElementById("checkSvojstvoBtnOutlier").disabled = true;
            document.getElementById("findOutlierBtnOutlier").disabled = true;
        } else {
            document.getElementById("filterResultOutlier").textContent = `Kriterij je ispravan: ${JSON.stringify(kriterij)}`;
            document.getElementById("svojstvoInputOutlier").disabled = false;
            document.getElementById("checkSvojstvoBtnOutlier").disabled = false;
        }
    });

    
    document.getElementById("checkSvojstvoBtnOutlier").addEventListener("click", () => {
        const svojstvoInput = document.getElementById("svojstvoInputOutlier").value.trim().toLowerCase();

        if (validnaSvojstva.includes(svojstvoInput)) {
            document.getElementById("filterResultOutlier").textContent = `Svojstvo je ispravno: ${svojstvoInput}`;
            document.getElementById("findOutlierBtnOutlier").disabled = false;
        } else {
            document.getElementById("filterResultOutlier").textContent = `Svojstvo je neispravno: ${svojstvoInput}`;
            document.getElementById("findOutlierBtnOutlier").disabled = true;
        }
    });

    
    document.getElementById("filterFormOutlier").addEventListener("submit", (e) => {
        e.preventDefault();

        const kriterijInput = document.getElementById("kriterijInputOutlier").value;
        const kriterij = parseKriterij(kriterijInput);
        const svojstvoInput = document.getElementById("svojstvoInputOutlier").value.trim().toLowerCase();

        if (kriterij && validnaSvojstva.includes(svojstvoInput)) {
            
            const outlierNekretnina = statistika.outlier(kriterij, svojstvoInput);

            if (outlierNekretnina) {
                document.getElementById("filterResultOutlier").textContent = `Outlier nekretnina: ${outlierNekretnina.naziv}, ${svojstvoInput.charAt(0).toUpperCase() + svojstvoInput.slice(1)}: ${outlierNekretnina[svojstvoInput]} KM`;
            } else {
                document.getElementById("filterResultOutlier").textContent = "Nema outliera za vaš kriterij.";
            }
        } else {
            document.getElementById("filterResultOutlier").textContent = "Unijeli ste neispravan kriterij ili svojstvo.";
        }
    });
           
            
});

