document.addEventListener('DOMContentLoaded', function() {
    // --- Elementi DOM ---
    const guestCountSpan = document.getElementById('guest-count');
    const minusGuestBtn = document.getElementById('minus-guest');
    const plusGuestBtn = document.getElementById('plus-guest');
    const bookingCalendarContainer = document.getElementById('booking-calendar-container');
    const selectedStartDateSpan = document.getElementById('selected-start-date');
    const selectedEndDateSpan = document.getElementById('selected-end-date');
    const stayDurationSpan = document.getElementById('stay-duration');
    const dailyPricesDisplay = document.getElementById('daily-prices-display');
    const totalPriceValueSpan = document.getElementById('total-price-value');

    // Nuovi elementi DOM per il form dei dettagli
    const proceedToDetailsBtn = document.getElementById('proceed-to-details-btn');
    const personalDetailsFormDiv = document.getElementById('personal-details-form');
    const bookingForm = document.getElementById('booking-form');
    const submitBookingBtn = document.getElementById('submit-booking-btn');
    const backToSummaryBtn = document.getElementById('back-to-summary-btn');

    // Campi del form
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const countryInput = document.getElementById('country');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');


    // --- Stato Globale ---
    let guestCount = 1;
    const minGuests = 1;
    const maxGuests = 4;

    let selectedDates = {
        start: null,
        end: null
    };
    let occupiedDates = [
        '2025-07-27', '2025-07-28', '2025-07-29',
        '2025-08-10', '2025-08-11', '2025-08-12', '2025-08-13',
        '2025-09-01', '2025-09-02'
    ];
    let dailyPrices = {};
    
    const generateExamplePrices = () => {
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const dateKey = `${yyyy}-${mm}-${dd}`;

            if (!occupiedDates.includes(dateKey)) {
                dailyPrices[dateKey] = (70 + Math.floor(Math.random() * 50));
            }
        }
    };
    generateExamplePrices();

    const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // --- Funzioni Selettore Persone ---
    function updateGuestCount() {
        guestCountSpan.textContent = guestCount;
        minusGuestBtn.disabled = guestCount === minGuests;
        plusGuestBtn.disabled = guestCount === maxGuests;
        calculateTotalPrice();
    }

    minusGuestBtn.addEventListener('click', () => {
        if (guestCount > minGuests) {
            guestCount--;
            updateGuestCount();
        }
    });

    plusGuestBtn.addEventListener('click', () => {
        if (guestCount < maxGuests) {
            guestCount++;
            updateGuestCount();
        }
    });

    // --- Funzioni Calendario ---
    function renderCalendar(month, year) {
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let firstWeekday = firstDayOfMonth.getDay();
        if (firstWeekday === 0) firstWeekday = 7;
        firstWeekday = firstWeekday - 1;

        let calendarHTML = `
            <div class="calendar">
                <div class="calendar-header">
                    <button id="prevMonth">&lt;</button>
                    <span>${monthNames[month]} ${year}</span>
                    <button id="nextMonth">&gt;</button>
                </div>
                <div class="calendar-weekdays">
                    ${dayNames.map(day => `<div>${day}</div>`).join('')}
                </div>
                <div class="calendar-days">
        `;

        for (let i = 0; i < firstWeekday; i++) {
            calendarHTML += '<div class="empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classList = '';
            let priceHTML = '';

            if (currentDate < today) {
                classList += ' past-day';
            }
            if (occupiedDates.includes(dateKey)) {
                classList += ' occupied';
            }
            if (currentDate.toDateString() === today.toDateString() && !classList.includes('past-day') && !classList.includes('occupied')) {
                classList += ' current-day';
            }

            if (dailyPrices[dateKey] && !classList.includes('occupied') && !classList.includes('past-day')) {
                priceHTML = `<span class="price">${dailyPrices[dateKey]}€</span>`;
            }

            const startTimestamp = selectedDates.start ? selectedDates.start.getTime() : null;
            const endTimestamp = selectedDates.end ? selectedDates.end.getTime() : null;
            const currentTimestamp = currentDate.getTime();

            if (selectedDates.start && selectedDates.end) {
                if (currentTimestamp === startTimestamp) {
                    classList += ' selected-start';
                } else if (currentTimestamp === endTimestamp) {
                    classList += ' selected-end';
                } else if (currentTimestamp > startTimestamp && currentTimestamp < endTimestamp) {
                    classList += ' selected-range';
                }
            } else if (selectedDates.start && currentTimestamp === startTimestamp) {
                 classList += ' selected-start';
            }

            calendarHTML += `<div class="day-cell ${classList}" data-date="${dateKey}">${day}${priceHTML}</div>`;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        bookingCalendarContainer.innerHTML = calendarHTML;

        document.getElementById('prevMonth').addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        });

        bookingCalendarContainer.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', handleDayClick);
        });

        updateBookingSummary();
    }

    function handleDayClick(event) {
        const clickedDateStr = event.currentTarget.dataset.date;
        const clickedDate = new Date(clickedDateStr);
        clickedDate.setHours(0, 0, 0, 0);

        if (event.currentTarget.classList.contains('past-day') || event.currentTarget.classList.contains('occupied')) {
            selectedDates = { start: null, end: null };
            renderCalendar(currentMonth, currentYear);
            return;
        }

        if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
            selectedDates.start = clickedDate;
            selectedDates.end = null;
        } else if (clickedDate < selectedDates.start) {
            selectedDates.start = clickedDate;
            selectedDates.end = null;
        } else if (clickedDate > selectedDates.start) {
            selectedDates.end = clickedDate;

            if (!isValidDateRange(selectedDates.start, selectedDates.end)) {
                alert("Il periodo selezionato include giorni non disponibili o già passati. Si prega di selezionare un altro periodo.");
                selectedDates = { start: null, end: null };
            }
        }
        renderCalendar(currentMonth, currentYear);
    }

    function isValidDateRange(startDate, endDate) {
        let currentDate = new Date(startDate);
        currentDate.setHours(0,0,0,0); // Normalizza per confronto

        const today = new Date();
        today.setHours(0,0,0,0);

        while (currentDate <= endDate) {
            const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
            
            if (occupiedDates.includes(dateKey) || currentDate < today) {
                return false;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return true;
    }

    function updateBookingSummary() {
        if (selectedDates.start) {
            selectedStartDateSpan.textContent = selectedDates.start.toLocaleDateString('it-IT');
            if (selectedDates.end) {
                selectedEndDateSpan.textContent = selectedDates.end.toLocaleDateString('it-IT');
                const diffTime = Math.abs(selectedDates.end.getTime() - selectedDates.start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                stayDurationSpan.textContent = `${diffDays} notti`;
                calculateTotalPrice();
                // Abilita il pulsante "Procedi con i Dati Personali" solo quando il range è valido
                proceedToDetailsBtn.disabled = false;
            } else {
                selectedEndDateSpan.textContent = '--';
                stayDurationSpan.textContent = '-- notti';
                totalPriceValueSpan.textContent = '0';
                dailyPricesDisplay.innerHTML = '';
                proceedToDetailsBtn.disabled = true; // Disabilita se solo data inizio selezionata
            }
        } else {
            selectedStartDateSpan.textContent = '--';
            selectedEndDateSpan.textContent = '--';
            stayDurationSpan.textContent = '-- notti';
            totalPriceValueSpan.textContent = '0';
            dailyPricesDisplay.innerHTML = '';
            proceedToDetailsBtn.disabled = true; // Disabilita se nessuna data selezionata
        }
    }

    function calculateTotalPrice() {
        let total = 0;
        let pricesHtml = '';

        if (selectedDates.start && selectedDates.end) {
            let currentDate = new Date(selectedDates.start);
            while (currentDate < selectedDates.end) {
                const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
                const pricePerNight = dailyPrices[dateKey] || 0;

                let adjustedPrice = pricePerNight;
                if (guestCount > 1) {
                    adjustedPrice = pricePerNight * (1 + (guestCount - 1) * 0.1);
                }
                adjustedPrice = Math.round(adjustedPrice);

                total += adjustedPrice;
                pricesHtml += `<div>${currentDate.toLocaleDateString('it-IT')}: <span>${adjustedPrice} €</span></div>`;
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        dailyPricesDisplay.innerHTML = pricesHtml;
        totalPriceValueSpan.textContent = total;
    }


    // --- Gestione Passaggio al Form Dati Personali ---
    proceedToDetailsBtn.addEventListener('click', () => {
        if (selectedDates.start && selectedDates.end && guestCount >= minGuests) {
            // Nascondi le sezioni precedenti e mostra il form
            document.querySelector('.guests-selector').classList.add('hidden');
            document.querySelector('.calendar-section').classList.add('hidden');
            document.querySelector('.price-summary').classList.add('hidden');
            proceedToDetailsBtn.classList.add('hidden'); // Nasconde anche questo pulsante

            personalDetailsFormDiv.classList.remove('hidden'); // Mostra il form
        } else {
            alert("Si prega di selezionare un periodo di soggiorno valido e il numero di persone prima di procedere.");
        }
    });

    // --- Gestione Pulsante Indietro ---
    backToSummaryBtn.addEventListener('click', () => {
        // Mostra le sezioni precedenti e nascondi il form
        document.querySelector('.guests-selector').classList.remove('hidden');
        document.querySelector('.calendar-section').classList.remove('hidden');
        document.querySelector('.price-summary').classList.remove('hidden');
        proceedToDetailsBtn.classList.remove('hidden'); // Mostra nuovamente il pulsante "Procedi"

        personalDetailsFormDiv.classList.add('hidden'); // Nasconde il form
    });

    // --- Gestione Invio del Form di Prenotazione Finale ---
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impedisce il ricaricamento della pagina

        // Raccogli i dati della prenotazione
        const bookingDetails = {
            guests: guestCount,
            startDate: selectedDates.start.toISOString().split('T')[0], // Formato YYYY-MM-DD
            endDate: selectedDates.end.toISOString().split('T')[0],
            durationNights: Math.ceil(Math.abs(selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24)),
            totalPrice: totalPriceValueSpan.textContent,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            country: countryInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };

        const confirmationMessage = `Conferma Finale della Richiesta di Prenotazione:\n\n` +
                                    `Persone: ${bookingDetails.guests}\n` +
                                    `Dal: ${new Date(bookingDetails.startDate).toLocaleDateString('it-IT')}\n` +
                                    `Al: ${new Date(bookingDetails.endDate).toLocaleDateString('it-IT')}\n` +
                                    `Durata: ${bookingDetails.durationNights} notti\n` +
                                    `Prezzo Totale: ${bookingDetails.totalPrice} €\n\n` +
                                    `I tuoi dati:\n` +
                                    `Nome: ${bookingDetails.firstName} ${bookingDetails.lastName}\n` +
                                    `Nazione: ${bookingDetails.country}\n` +
                                    `Email: ${bookingDetails.email}\n` +
                                    `Telefono: ${bookingDetails.phone}\n\n` +
                                    `Clicca OK per inviare la richiesta definitiva.`;

        if (confirm(confirmationMessage)) {
            // QUI DOVRESTI INVIARE I DATI A UN SERVIZIO EMAIL, UN API, O UN FORM PROCESSOR
            // Esempio (per scopi dimostrativi):
            console.log("Dati di prenotazione da inviare:", bookingDetails);
            alert("Richiesta di prenotazione inviata con successo! Sarai contattato via email per la conferma.");

            // Reset del form e dello stato dopo l'invio riuscito
            bookingForm.reset();
            guestCount = 1;
            selectedDates = { start: null, end: null };
            currentMonth = new Date().getMonth();
            currentYear = new Date().getFullYear();
            
            // Torna alla visualizzazione iniziale
            personalDetailsFormDiv.classList.add('hidden');
            document.querySelector('.guests-selector').classList.remove('hidden');
            document.querySelector('.calendar-section').classList.remove('hidden');
            document.querySelector('.price-summary').classList.remove('hidden');
            proceedToDetailsBtn.classList.remove('hidden');

            updateGuestCount();
            renderCalendar(currentMonth, currentYear);
        }
    });


    // --- Inizializzazione ---
    updateGuestCount();
    renderCalendar(currentMonth, currentYear);
});