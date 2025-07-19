document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos DOM ---
    const guestCountSpan = document.getElementById('guest-count');
    const minusGuestBtn = document.getElementById('minus-guest');
    const plusGuestBtn = document.getElementById('plus-guest');
    const bookingCalendarContainer = document.getElementById('booking-calendar-container');
    const selectedStartDateSpan = document.getElementById('selected-start-date');
    const selectedEndDateSpan = document.getElementById('selected-end-date');
    const stayDurationSpan = document.getElementById('stay-duration');
    const dailyPricesDisplay = document.getElementById('daily-prices-display');
    const totalPriceValueSpan = document.getElementById('total-price-value');

    const proceedToDetailsBtn = document.getElementById('proceed-to-details-btn');
    const personalDetailsFormDiv = document.getElementById('personal-details-form');
    const bookingForm = document.getElementById('booking-form');
    const submitBookingBtn = document.getElementById('submit-booking-btn');
    const backToSummaryBtn = document.getElementById('back-to-summary-btn');

    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const countryInput = document.getElementById('country');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // --- Estado Global ---
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

    // --- CADENAS DE IDIOMA ---
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // --- Funciones del Selector de Personas ---
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

    // --- Funciones del Calendario ---
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
                alert("El período seleccionado incluye días no disponibles o pasados. Por favor, seleccione otro período.");
                selectedDates = { start: null, end: null };
            }
        }
        renderCalendar(currentMonth, currentYear);
    }

    function isValidDateRange(startDate, endDate) {
        let currentDate = new Date(startDate);
        currentDate.setHours(0,0,0,0);

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
            selectedStartDateSpan.textContent = selectedDates.start.toLocaleDateString('es-ES'); // Use es-ES for Spanish date format
            if (selectedDates.end) {
                selectedEndDateSpan.textContent = selectedDates.end.toLocaleDateString('es-ES');
                const diffTime = Math.abs(selectedDates.end.getTime() - selectedDates.start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                stayDurationSpan.textContent = `${diffDays} noches`;
                calculateTotalPrice();
                proceedToDetailsBtn.disabled = false;
            } else {
                selectedEndDateSpan.textContent = '--';
                stayDurationSpan.textContent = '-- noches';
                totalPriceValueSpan.textContent = '0';
                dailyPricesDisplay.innerHTML = '';
                proceedToDetailsBtn.disabled = true;
            }
        } else {
            selectedStartDateSpan.textContent = '--';
            selectedEndDateSpan.textContent = '--';
            stayDurationSpan.textContent = '-- noches';
            totalPriceValueSpan.textContent = '0';
            dailyPricesDisplay.innerHTML = '';
            proceedToDetailsBtn.disabled = true;
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
                pricesHtml += `<div>${currentDate.toLocaleDateString('es-ES')}: <span>${adjustedPrice} €</span></div>`;
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        dailyPricesDisplay.innerHTML = pricesHtml;
        totalPriceValueSpan.textContent = total;
    }

    // --- Manejar Continuar al Formulario de Datos Personales ---
    proceedToDetailsBtn.addEventListener('click', () => {
        if (selectedDates.start && selectedDates.end && guestCount >= minGuests) {
            document.querySelector('.guests-selector').classList.add('hidden');
            document.querySelector('.calendar-section').classList.add('hidden');
            document.querySelector('.price-summary').classList.add('hidden');
            proceedToDetailsBtn.classList.add('hidden');

            personalDetailsFormDiv.classList.remove('hidden');
        } else {
            alert("Por favor, seleccione un período de estancia válido y el número de personas antes de continuar.");
        }
    });

    // --- Manejar Botón Atrás ---
    backToSummaryBtn.addEventListener('click', () => {
        document.querySelector('.guests-selector').classList.remove('hidden');
        document.querySelector('.calendar-section').classList.remove('hidden');
        document.querySelector('.price-summary').classList.remove('hidden');
        proceedToDetailsBtn.classList.remove('hidden');

        personalDetailsFormDiv.classList.add('hidden');
    });

    // --- Manejar Envío Final del Formulario de Reserva ---
    bookingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const bookingDetails = {
            guests: guestCount,
            startDate: selectedDates.start.toISOString().split('T')[0],
            endDate: selectedDates.end.toISOString().split('T')[0],
            durationNights: Math.ceil(Math.abs(selectedDates.end.getTime() - selectedDates.start.getTime()) / (1000 * 60 * 60 * 24)),
            totalPrice: totalPriceValueSpan.textContent,
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            country: countryInput.value,
            email: emailInput.value,
            phone: phoneInput.value
        };

        const confirmationMessage = `Confirmación Final de Solicitud de Reserva:\n\n` +
                                    `Personas: ${bookingDetails.guests}\n` +
                                    `Desde: ${new Date(bookingDetails.startDate).toLocaleDateString('es-ES')}\n` +
                                    `Hasta: ${new Date(bookingDetails.endDate).toLocaleDateString('es-ES')}\n` +
                                    `Duración: ${bookingDetails.durationNights} noches\n` +
                                    `Precio Total: ${bookingDetails.totalPrice} €\n\n` +
                                    `Tus datos:\n` +
                                    `Nombre: ${bookingDetails.firstName} ${bookingDetails.lastName}\n` +
                                    `País: ${bookingDetails.country}\n` +
                                    `Correo: ${bookingDetails.email}\n` +
                                    `Teléfono: ${bookingDetails.phone}\n\n` +
                                    `Haz clic en Aceptar para enviar la solicitud final.`;

        if (confirm(confirmationMessage)) {
            console.log("Detalles de reserva para enviar:", bookingDetails);
            alert("¡Solicitud de reserva enviada con éxito! Nos pondremos en contacto contigo por correo electrónico para la confirmación.");

            bookingForm.reset();
            guestCount = 1;
            selectedDates = { start: null, end: null };
            currentMonth = new Date().getMonth();
            currentYear = new Date().getFullYear();
            
            personalDetailsFormDiv.classList.add('hidden');
            document.querySelector('.guests-selector').classList.remove('hidden');
            document.querySelector('.calendar-section').classList.remove('hidden');
            document.querySelector('.price-summary').classList.remove('hidden');
            proceedToDetailsBtn.classList.remove('hidden');

            updateGuestCount();
            renderCalendar(currentMonth, currentYear);
        }
    });

    // --- Inicialización ---
    updateGuestCount();
    renderCalendar(currentMonth, currentYear);
});