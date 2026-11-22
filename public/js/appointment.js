/**
 * appointment.ts: de afspraak-wizard.
 * Stap 1 en 2: gegevens invullen. Stap 3: visuele kalender met datum en tijd.
 * Stap 4: controleren en bevestigen (POST /afspraak/boeken).
 */
const TOTAL_STEPS = 4;
const root = document.querySelector('#wizard');
const form = document.querySelector('#appointment-form');
if (root && form) {
    const minDate = root.dataset.min ?? '';
    const maxDate = root.dataset.max ?? '';
    const workDays = (root.dataset.workdays ?? '1,2,3,4,5').split(',').map(Number);
    const steps = Array.from(form.querySelectorAll('fieldset.step'));
    const progressItems = Array.from(document.querySelectorAll('.progress-item'));
    const btnBack = document.querySelector('#btn-back');
    const btnNext = document.querySelector('#btn-next');
    const btnSubmit = document.querySelector('#btn-submit');
    const statusEl = document.querySelector('#wizard-status');
    const calTitle = document.querySelector('#cal-title');
    const calGrid = document.querySelector('#cal-grid');
    const calPrev = document.querySelector('#cal-prev');
    const calNext = document.querySelector('#cal-next');
    const timesTitle = document.querySelector('#times-title');
    const timesGrid = document.querySelector('#times-grid');
    const summary = document.querySelector('#summary');
    const success = document.querySelector('#success');
    let currentStep = 1;
    let selectedDate = '';
    let selectedTime = '';
    const [minY, minM] = minDate.split('-').map(Number);
    const [maxY, maxM] = maxDate.split('-').map(Number);
    let viewYear = minY;
    let viewMonth = minM - 1; // 0 = januari
    /* ---------- Hulpfuncties ---------- */
    const pad = (n) => String(n).padStart(2, '0');
    const toIso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
    function formatDateNl(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Intl.DateTimeFormat('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(new Date(Date.UTC(y, m - 1, d, 12)));
    }
    function setError(field, message) {
        const el = form.querySelector(`[data-error-for="${field}"]`);
        if (el)
            el.textContent = message;
        form.querySelector(`[name="${field}"]`)?.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
    function clearErrors() {
        form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));
        form.querySelectorAll('[aria-invalid="true"]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
        statusEl.textContent = '';
    }
    function formValue(name) {
        const value = new FormData(form).get(name);
        return typeof value === 'string' ? value.trim() : '';
    }
    /* ---------- Stappen ---------- */
    function showStep(step, scroll = true) {
        currentStep = step;
        steps.forEach((el) => (el.hidden = Number(el.dataset.step) !== step));
        progressItems.forEach((el) => {
            const n = Number(el.dataset.step);
            el.classList.toggle('is-current', n === step);
            el.classList.toggle('is-done', n < step);
            if (n === step)
                el.setAttribute('aria-current', 'step');
            else
                el.removeAttribute('aria-current');
        });
        btnBack.hidden = step === 1;
        btnNext.hidden = step === TOTAL_STEPS;
        btnSubmit.hidden = step !== TOTAL_STEPS;
        if (step === 3)
            renderCalendar();
        if (step === 4)
            renderSummary();
        clearErrors();
        if (scroll)
            root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    /** Controleert de velden van de huidige stap. Geeft true als alles klopt. */
    function validateStep(step) {
        clearErrors();
        const stepEl = steps[step - 1];
        let valid = true;
        if (step === 3) {
            if (!selectedDate || !selectedTime) {
                setError('date', 'Kies een datum en een tijd.');
                valid = false;
            }
            return valid;
        }
        const messages = {
            name: 'Vul je naam in.',
            email: 'Vul een geldig e-mailadres in.',
            phone: 'Vul een geldig telefoonnummer in.',
            company: 'Vul de naam van je bedrijf in.',
            businessType: 'Kies een branche.',
            hasWebsite: 'Maak een keuze.',
        };
        stepEl.querySelectorAll('input[required], select[required]').forEach((input) => {
            const isRadio = input instanceof HTMLInputElement && input.type === 'radio';
            if (isRadio) {
                const checked = form.querySelector(`input[name="${input.name}"]:checked`);
                if (!checked) {
                    setError(input.name, messages[input.name] ?? 'Dit veld is verplicht.');
                    valid = false;
                }
                return;
            }
            if (!input.checkValidity()) {
                setError(input.name, messages[input.name] ?? 'Dit veld is verplicht.');
                valid = false;
            }
        });
        if (!valid) {
            statusEl.textContent = 'Controleer de gemarkeerde velden.';
            stepEl.querySelector('[aria-invalid="true"]')?.focus();
        }
        return valid;
    }
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep))
            showStep(currentStep + 1);
    });
    btnBack.addEventListener('click', () => showStep(currentStep - 1));
    // Enter in een invoerveld = volgende stap (en pas op de laatste stap versturen)
    form.addEventListener('keydown', (event) => {
        const target = event.target;
        if (event.key === 'Enter' && currentStep < TOTAL_STEPS && target.tagName !== 'TEXTAREA') {
            event.preventDefault();
            btnNext.click();
        }
    });
    /* ---------- Kalender ---------- */
    function renderCalendar() {
        const monthName = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(new Date(viewYear, viewMonth, 1));
        calTitle.textContent = monthName;
        calPrev.disabled = viewYear === minY && viewMonth === minM - 1;
        calNext.disabled = viewYear === maxY && viewMonth === maxM - 1;
        calGrid.replaceChildren();
        const firstWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // maandag = 0
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        for (let i = 0; i < firstWeekday; i++) {
            const spacer = document.createElement('span');
            spacer.className = 'cal-empty';
            calGrid.append(spacer);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const iso = toIso(viewYear, viewMonth, day);
            const weekday = new Date(viewYear, viewMonth, day).getDay();
            const available = iso >= minDate && iso <= maxDate && workDays.includes(weekday);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'cal-day';
            button.textContent = String(day);
            button.disabled = !available;
            button.setAttribute('aria-label', formatDateNl(iso));
            if (iso === selectedDate) {
                button.classList.add('is-selected');
                button.setAttribute('aria-pressed', 'true');
            }
            button.addEventListener('click', () => selectDate(iso));
            calGrid.append(button);
        }
    }
    function changeMonth(delta) {
        const date = new Date(viewYear, viewMonth + delta, 1);
        viewYear = date.getFullYear();
        viewMonth = date.getMonth();
        renderCalendar();
    }
    calPrev.addEventListener('click', () => changeMonth(-1));
    calNext.addEventListener('click', () => changeMonth(1));
    async function selectDate(iso) {
        selectedDate = iso;
        selectedTime = '';
        setError('date', '');
        renderCalendar();
        timesTitle.textContent = formatDateNl(iso);
        timesGrid.replaceChildren(textNote('Tijden laden...'));
        try {
            const response = await fetch(`/afspraak/slots?date=${encodeURIComponent(iso)}`);
            const data = (await response.json());
            if (selectedDate !== iso)
                return; // gebruiker heeft intussen een andere dag gekozen
            renderTimes(data.slots ?? []);
        }
        catch {
            timesGrid.replaceChildren(textNote('Tijden laden is mislukt. Probeer het opnieuw.'));
        }
    }
    function textNote(text) {
        const p = document.createElement('p');
        p.className = 'times-note';
        p.textContent = text;
        return p;
    }
    function renderTimes(slots) {
        timesGrid.replaceChildren();
        if (slots.length === 0) {
            timesGrid.append(textNote('Geen tijden meer beschikbaar op deze dag. Kies een andere dag.'));
            return;
        }
        for (const slot of slots) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'time-btn';
            button.textContent = slot;
            button.addEventListener('click', () => {
                selectedTime = slot;
                setError('date', '');
                timesGrid.querySelectorAll('.time-btn').forEach((b) => {
                    b.classList.remove('is-selected');
                    b.removeAttribute('aria-pressed');
                });
                button.classList.add('is-selected');
                button.setAttribute('aria-pressed', 'true');
            });
            timesGrid.append(button);
        }
    }
    /* ---------- Samenvatting en versturen ---------- */
    function renderSummary() {
        const rows = [
            ['Naam', formValue('name')],
            ['E-mail', formValue('email')],
            ['Telefoon', formValue('phone')],
            ['Bedrijf', formValue('company')],
            ['Soort bedrijf', formValue('businessType')],
            ['Heeft al een website', formValue('hasWebsite') === 'ja' ? 'Ja' : 'Nee'],
            ['Doel', formValue('goal') || '-'],
            ['Datum', formatDateNl(selectedDate)],
            ['Tijd', `${selectedTime} (30 minuten, Google Meet)`],
        ];
        summary.replaceChildren();
        for (const [label, value] of rows) {
            const row = document.createElement('div');
            const dt = document.createElement('dt');
            const dd = document.createElement('dd');
            dt.textContent = label;
            dd.textContent = value;
            row.append(dt, dd);
            summary.append(row);
        }
    }
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (currentStep !== TOTAL_STEPS)
            return;
        btnSubmit.disabled = true;
        statusEl.textContent = 'Je afspraak wordt ingepland...';
        const payload = {
            name: formValue('name'),
            email: formValue('email'),
            phone: formValue('phone'),
            company: formValue('company'),
            businessType: formValue('businessType'),
            hasWebsite: formValue('hasWebsite'),
            goal: formValue('goal'),
            date: selectedDate,
            time: selectedTime,
        };
        try {
            const response = await fetch('/afspraak/boeken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = (await response.json());
            if (response.ok && result.ok) {
                showSuccess(result);
                return;
            }
            statusEl.textContent = result.message ?? 'Boeken is niet gelukt. Probeer het opnieuw.';
            if (response.status === 409) {
                // Tijdstip net bezet: terug naar de kalender met ververste tijden
                const date = selectedDate;
                showStep(3);
                statusEl.textContent = result.message ?? '';
                await selectDate(date);
            }
            else if (result.errors) {
                const firstField = Object.keys(result.errors)[0];
                const stepOfField = firstField === 'date' ? 3 : ['company', 'businessType', 'hasWebsite'].includes(firstField) ? 2 : 1;
                showStep(stepOfField);
                for (const [field, message] of Object.entries(result.errors))
                    setError(field, message);
            }
        }
        catch {
            statusEl.textContent = 'Geen verbinding. Controleer je internet en probeer het opnieuw.';
        }
        finally {
            btnSubmit.disabled = false;
        }
    });
    function showSuccess(result) {
        form.hidden = true;
        document.querySelector('#progress').hidden = true;
        success.hidden = false;
        const when = document.querySelector('#success-when');
        when.textContent = `${formatDateNl(result.date ?? selectedDate)} om ${result.time ?? selectedTime} (Nederlandse tijd).`;
        const mail = document.querySelector('#success-mail');
        mail.textContent = result.emailSent
            ? `We hebben een bevestiging gestuurd naar ${formValue('email')}.`
            : 'Je afspraak is opgeslagen. De bevestiging per e-mail volgt zo snel mogelijk.';
        const meetWrap = document.querySelector('#success-meet');
        const meetLink = document.querySelector('#success-meet-link');
        if (result.meetLink) {
            meetLink.href = result.meetLink;
            meetWrap.hidden = false;
        }
        success.focus();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showStep(1, false);
}
export {};
