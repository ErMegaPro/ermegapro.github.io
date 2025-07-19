
    document.addEventListener('DOMContentLoaded', function() {
        const slides = document.querySelectorAll('.background-slideshow .slide');
        let currentSlide = 0;
        const slideInterval = 5000; // Tempo in millisecondi (5 secondi) per ogni slide

        function nextSlide() {
            slides[currentSlide].classList.remove('active-slide');
            currentSlide = (currentSlide + 1) % slides.length; // Passa alla prossima slide, torna alla prima se finisce
            slides[currentSlide].classList.add('active-slide');
        }

        // Inizia lo slideshow
        setInterval(nextSlide, slideInterval);

        // Assicurati che la prima slide sia attiva all'inizio (potrebbe esserlo già dall'HTML)
        if (!slides[0].classList.contains('active-slide')) {
            slides[0].classList.add('active-slide');
        }
    });
