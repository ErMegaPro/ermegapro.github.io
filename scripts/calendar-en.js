
    document.addEventListener('DOMContentLoaded', function() {
    const calendarContainer = document.getElementById('calendar-container');

    // Mesi e giorni della settimana in inglese (o nella lingua della pagina)
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Assicurati che l'ordine sia corretto per la tua lingua

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    // Dati di esempio per i giorni occupati (QUI DOVRAI INTEGRARE LA TUA LOGICA REALISTICA)
    // Formato: 'YYYY-MM-DD'
    const occupiedDates = [
        '2025-07-27',
        '2025-07-28',
        '2025-07-29',
        '2025-08-10',
        '2025-08-11',
        '2025-08-12',
        '2025-08-13',
        '2025-09-01'
    ];

    function renderCalendar(month, year) {
        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get last day of month

        // Get the weekday of the first day (0=Sunday, 1=Monday, etc.)
        // Adjust for desired start of week (e.g., Monday = 0)
        let firstWeekday = firstDayOfMonth.getDay();
        if (firstWeekday === 0) firstWeekday = 7; // If Sunday, set to 7
        firstWeekday = firstWeekday - 1; // Adjust to make Monday (1) become 0, Tuesday (2) become 1, etc.

        const today = new Date();
        const currentDayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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

        // Empty cells for days before the 1st of the month
        for (let i = 0; i < firstWeekday; i++) {
            calendarHTML += '<div class="empty"></div>';
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let classList = '';

            if (occupiedDates.includes(fullDate)) {
                classList += ' occupied';
            }
            if (fullDate === currentDayFormatted) {
                classList += ' current-day';
            }

            calendarHTML += `<div class="${classList}">${day}</div>`;
        }

        calendarHTML += `
                </div>
            </div>
        `;

        calendarContainer.innerHTML = calendarHTML;

        // Add event listeners for month navigation
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
    }

    renderCalendar(currentMonth, currentYear);
});