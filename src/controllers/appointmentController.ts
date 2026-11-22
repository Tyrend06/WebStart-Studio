import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { config } from '../config';
import { clean, cleanLine, isEmail, isPhone } from '../middleware/validation';
import * as appointmentModel from '../models/appointmentModel';
import type { Appointment } from '../models/appointmentModel';
import { allSlots, freeSlots, isBookableDate, isIsoDate } from '../services/availabilityService';
import { createMeetEvent } from '../services/calendarService';
import { sendAppointmentMails } from '../services/mailService';

/** GET /afspraak/slots?date=YYYY-MM-DD: welke tijden zijn er nog vrij op die dag? */
export function slots(req: Request, res: Response): void {
  const date = typeof req.query.date === 'string' ? req.query.date : '';
  if (!isIsoDate(date)) {
    res.status(400).json({ ok: false, message: 'Ongeldige datum.' });
    return;
  }
  res.json({ ok: true, date, slots: freeSlots(date) });
}

/** POST /afspraak/boeken: controleert alles, reserveert de tijd, maakt Google Meet aan en mailt. */
export async function book(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const name = cleanLine(body.name, 100);
  const email = cleanLine(body.email, 254);
  const phone = cleanLine(body.phone, 20);
  const company = cleanLine(body.company, 120);
  const businessType = cleanLine(body.businessType, 60);
  const hasWebsite = body.hasWebsite === 'ja' ? 'ja' : body.hasWebsite === 'nee' ? 'nee' : '';
  const goal = clean(body.goal, 1000);
  const date = cleanLine(body.date, 10);
  const time = cleanLine(body.time, 5);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = 'Vul je naam in.';
  if (!isEmail(email)) errors.email = 'Vul een geldig e-mailadres in.';
  if (!isPhone(phone)) errors.phone = 'Vul een geldig telefoonnummer in.';
  if (company.length < 2) errors.company = 'Vul de naam van je bedrijf in.';
  if (!config.businessTypes.includes(businessType)) errors.businessType = 'Kies een branche.';
  if (!hasWebsite) errors.hasWebsite = 'Maak een keuze.';
  if (!isBookableDate(date) || !allSlots().includes(time)) errors.date = 'Kies een geldige datum en tijd.';

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ ok: false, message: 'Controleer je gegevens.', errors });
    return;
  }

  // Is het tijdstip nog vrij? (controle en opslaan gebeuren direct na elkaar, zodat niemand dubbel boekt)
  if (!freeSlots(date).includes(time)) {
    res.status(409).json({ ok: false, message: 'Dit tijdstip is net door iemand anders gekozen. Kies een ander tijdstip.' });
    return;
  }

  const appointment: Appointment = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    company,
    businessType,
    hasWebsite: hasWebsite === 'ja' ? 'ja' : 'nee',
    goal,
    date,
    time,
    meetLink: null,
    eventId: null,
  };
  appointmentModel.add(appointment);

  // Google Meet-link aanmaken. Lukt dit niet, dan blijft de afspraak wel staan.
  try {
    const meet = await createMeetEvent(appointment);
    if (meet) {
      appointment.meetLink = meet.meetLink;
      appointment.eventId = meet.eventId;
      appointmentModel.update(appointment.id, meet);
    }
  } catch (error) {
    console.error('[calendar] Google Meet aanmaken mislukt:', error);
  }

  // Bevestigingsmail naar de klant + melding naar de eigenaar.
  let emailSent = false;
  try {
    emailSent = await sendAppointmentMails(appointment);
  } catch (error) {
    console.error('[mail] Afspraakmails versturen mislukt:', error);
  }

  res.json({
    ok: true,
    date: appointment.date,
    time: appointment.time,
    meetLink: appointment.meetLink,
    emailSent,
  });
}
