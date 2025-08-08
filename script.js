document.addEventListener('DOMContentLoaded', () => {
    // --- Elementi del DOM ---
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const editorScreen = document.getElementById('editor-screen');
    
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    const calendarView = document.getElementById('calendar-view');
    const listView = document.getElementById('list-view');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const toggleViewBtnList = document.getElementById('toggle-view-btn-list');

    const currentMonthYear = document.getElementById('current-month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const editorDate = document.getElementById('editor-date');
    const thoughtTextarea = document.getElementById('thought-textarea');
    const saveThoughtBtn = document.getElementById('save-thought-btn');
    const backToCalendarBtn = document.getElementById('back-to-calendar-btn');
    const deleteThoughtBtn = document.getElementById('delete-thought-btn');

    const thoughtsList = document.getElementById('thoughts-list');

    // --- Stato dell'applicazione ---
    let currentDate = new Date();
    let selectedDateKey = null;
    let thoughts = JSON.parse(localStorage.getItem('diaryThoughts')) || {};

    // --- Logica di Login ---
    loginButton.addEventListener('click', () => {
        if (passwordInput.value === 'polpetta') {
            loginScreen.classList.remove('active');
            appScreen.classList.add('active');
            renderCalendar();
        } else {
            errorMessage.classList.remove('hidden');
            loginScreen.querySelector('.login-container').style.animation = 'shake 0.5s';
            setTimeout(() => {
                errorMessage.classList.add('hidden');
                loginScreen.querySelector('.login-container').style.animation = '';
            }, 1000);
        }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginButton.click();
    });

    // --- Navigazione Viste (Calendario/Lista) ---
    toggleViewBtn.addEventListener('click', showListView);
    toggleViewBtnList.addEventListener('click', showCalendarView);

    function showListView() {
        renderThoughtsList();
        calendarView.classList.remove('active');
        listView.classList.add('active');
    }

    function showCalendarView() {
        listView.classList.remove('active');
        calendarView.classList.add('active');
    }

    // --- Logica Calendario ---
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        currentMonthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < dayOffset; i++) {
            calendarGrid.appendChild(document.createElement('div')).classList.add('calendar-day', 'empty');
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            
            // --- MODIFICA CHIAVE QUI ---
            // Il numero viene inserito in uno <span> per poterlo centrare con precisione via CSS
            dayCell.innerHTML = `<span>${day}</span>`;
            
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (thoughts[dateKey]) { dayCell.classList.add('has-thought'); }
            dayCell.addEventListener('click', () => openEditor(year, month, day));
            calendarGrid.appendChild(dayCell);
        }
    }
    
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- Logica Editor ---
    function openEditor(year, month, day) {
        selectedDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(year, month, day);
        editorDate.textContent = dateObj.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
        thoughtTextarea.value = thoughts[selectedDateKey] || '';
        
        deleteThoughtBtn.style.display = thoughts[selectedDateKey] ? 'inline-flex' : 'none';

        appScreen.classList.remove('active');
        editorScreen.classList.add('active');
        thoughtTextarea.focus();
    }

    function closeEditor() {
        editorScreen.classList.remove('active');
        appScreen.classList.add('active');
        showCalendarView();
    }

    function saveThought() {
        const thoughtText = thoughtTextarea.value.trim();
        if (thoughtText) {
            thoughts[selectedDateKey] = thoughtText;
        } else {
            delete thoughts[selectedDateKey];
        }
        updateAndRender();
        closeEditor();
    }
    
    function deleteThought(key) {
        if (confirm("Sei sicuro di voler cancellare questo pensiero? L'azione è irreversibile.")) {
            delete thoughts[key];
            updateAndRender();
            if(editorScreen.classList.contains('active')) {
                closeEditor();
            } else {
                showListView();
            }
        }
    }

    function updateAndRender() {
        localStorage.setItem('diaryThoughts', JSON.stringify(thoughts));
        renderCalendar();
        if(listView.classList.contains('active')) {
            renderThoughtsList();
        }
    }

    backToCalendarBtn.addEventListener('click', closeEditor);
    saveThoughtBtn.addEventListener('click', saveThought);
    deleteThoughtBtn.addEventListener('click', () => deleteThought(selectedDateKey));

    // --- Logica Lista Pensieri ---
    function renderThoughtsList() {
        thoughtsList.innerHTML = '';
        const sortedKeys = Object.keys(thoughts).sort().reverse();

        if (sortedKeys.length === 0) {
            thoughtsList.innerHTML = '<p style="text-align: center; color: var(--text-color-muted);">Nessun pensiero ancora salvato.</p>';
            return;
        }

        sortedKeys.forEach((key, index) => {
            const [year, month, day] = key.split('-');
            const dateObj = new Date(year, month - 1, day);
            const formattedDate = dateObj.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
            
            const thoughtItem = document.createElement('div');
            thoughtItem.classList.add('thought-item', 'glass-effect');
            thoughtItem.style.animationDelay = `${index * 100}ms`;
            
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('thought-item-content');
            contentDiv.innerHTML = `<h3>${formattedDate}</h3><p>${thoughts[key]}</p>`;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('icon-btn', 'danger');
            deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            deleteBtn.onclick = () => deleteThought(key);
            
            thoughtItem.appendChild(contentDiv);
            thoughtItem.appendChild(deleteBtn);
            thoughtsList.appendChild(thoughtItem);
        });
    }
});
