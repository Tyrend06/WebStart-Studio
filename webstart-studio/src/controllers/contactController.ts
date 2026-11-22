import type { Request, Response } from 'express';
import { config } from '../config';
import { clean, cleanLine, isEmail } from '../middleware/validation';
import { isMailConfigured, sendContactMessage } from '../services/mailService';

/** POST /contact: controleert het formulier en mailt het bericht naar de eigenaar. */
export async function submit(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;

  // Verborgen "lokveld": echte bezoekers laten dit leeg, spam-bots vullen het in.
  if (clean(body.bot_field, 200)) {
    res.json({ ok: true });
    return;
  }

  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254);
  const message = clean(body.message, 3000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Vul je naam in.';
  if (!isEmail(email)) errors.email = 'Vul een geldig e-mailadres in.';
  if (message.length < 5) errors.message = 'Typ een bericht (minimaal 5 tekens).';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, message: 'Controleer de gemarkeerde velden.', errors });
    return;
  }

  if (!isMailConfigured()) {
    console.warn(`[contact] Bericht van ${name} <${email}> (e-mail niet ingesteld):\n${message}`);
    if (config.isProd) {
      res.status(503).json({ ok: false, message: 'Het formulier is tijdelijk niet beschikbaar. Mail ons gerust direct.' });
      return;
    }
    res.json({ ok: true, message: 'Dev-modus: e-mail is niet ingesteld, het bericht staat in de serverlog.' });
    return;
  }

  try {
    await sendContactMessage({ name, email, message });
    res.json({ ok: true, message: 'Bedankt! Je bericht is verstuurd. We reageren zo snel mogelijk.' });
  } catch (error) {
    console.error('[contact] Versturen mislukt:', error);
    res.status(502).json({ ok: false, message: 'Versturen is mislukt. Probeer het later opnieuw of mail ons direct.' });
  }
}
