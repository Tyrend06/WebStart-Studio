/**
 * contact.ts: verstuurt het contactformulier naar de server (POST /contact)
 * zonder dat de pagina opnieuw laadt, en toont een succes- of foutmelding.
 */

interface ContactResponse {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

const form = document.querySelector<HTMLFormElement>('#contact-form');
const status = document.querySelector<HTMLElement>('#contact-status');
const submit = document.querySelector<HTMLButtonElement>('#contact-submit');

function showErrors(errors: Record<string, string>): void {
  form?.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    const field = el.dataset.errorFor ?? '';
    const message = errors[field] ?? '';
    el.textContent = message;
    form?.querySelector(`[name="${field}"]`)?.setAttribute('aria-invalid', message ? 'true' : 'false');
  });
}

form?.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();
  if (!form || !status || !submit) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const errors: Record<string, string> = {};
  if (String(data.name ?? '').trim().length < 2) errors.name = 'Vul je naam in.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email ?? '').trim())) errors.email = 'Vul een geldig e-mailadres in.';
  if (String(data.message ?? '').trim().length < 5) errors.message = 'Typ een bericht (minimaal 5 tekens).';
  showErrors(errors);
  if (Object.keys(errors).length > 0) {
    status.textContent = 'Controleer de gemarkeerde velden.';
    return;
  }

  submit.disabled = true;
  status.textContent = 'Bezig met versturen...';

  try {
    const response = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = (await response.json()) as ContactResponse;

    if (response.ok && result.ok) {
      status.textContent = result.message ?? 'Bedankt! Je bericht is verstuurd.';
      form.reset();
      showErrors({});
    } else {
      showErrors(result.errors ?? {});
      status.textContent = result.message ?? 'Versturen is mislukt. Probeer het opnieuw.';
    }
  } catch {
    status.textContent = 'Geen verbinding. Controleer je internet en probeer het opnieuw.';
  } finally {
    submit.disabled = false;
  }
});

export {}; // maakt van dit bestand een module (eigen scope)
