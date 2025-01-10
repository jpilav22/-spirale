document.addEventListener("DOMContentLoaded", () => {
    
    const glavniElement = document.querySelector("#upiti");

   
    const sviElementi = Array.from(document.querySelectorAll("#upiti .upit"));

    
    const carousel = postaviCarousel(glavniElement, sviElementi);

    if (carousel) {
       
        document.querySelector(".prev").addEventListener("click", carousel.fnLijevo);
        document.querySelector(".next").addEventListener("click", carousel.fnDesno);
    }
});
