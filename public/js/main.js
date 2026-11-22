/**
 * main.ts: draait op elke pagina.
 * - klapt het menu open/dicht op mobiel
 * - laat blokken zacht verschijnen zodra je ze in beeld scrolt
 */
document.documentElement.classList.add('js');
function initNavToggle() {
    const toggle = document.querySelector('#nav-toggle');
    const nav = document.querySelector('#site-nav');
    if (!toggle || !nav)
        return;
    const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape')
            setOpen(false);
    });
    nav.addEventListener('click', (event) => {
        if (event.target.closest('a'))
            setOpen(false);
    });
}
function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }
    }, { threshold: 0.15 });
    items.forEach((el) => observer.observe(el));
}
initNavToggle();
initReveal();
export {};
