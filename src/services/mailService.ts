import ejs from 'ejs';
import nodemailer, { type Transporter } from 'nodemailer';
import path from 'node:path';
import { config } from '../config';
import type { Appointment } from '../models/appointmentModel';

let transporter: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(config.smtp.user && config.smtp.pass);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

async function render(template: string, data: Record<string, unknown>): Promise<string> {
  return ejs.renderFile(path.join(config.viewsDir, 'emails', `${template}.ejs`), data);
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Verstuurt een e-mail. Geeft false terug als e-mail nog niet is ingesteld (.env). */
async function send(options: MailOptions): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn(`[mail] SMTP niet ingesteld: e-mail "${options.subject}" is niet verstuurd.`);
    return false;
  }
  await getTransporter().sendMail({ from: config.smtp.from, ...options });
  return true;
}

/** "2026-11-23" -> "maandag 23 november 2026" */
export function formatDateNl(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** Contactformulier: bericht van een bezoeker naar de eigenaar. */
export async function sendContactMessage(input: { name: string; email: string; message: string }): Promise<boolean> {
  const html = await render('contact', input);
  return send({
    to: config.site.ownerEmail,
    replyTo: input.email,
    subject: `Nieuw bericht via de website van ${input.name}`,
    html,
    text: `Van: ${input.name} <${input.email}>\n\n${input.message}`,
  });
}

/** Afspraak: bevestiging naar de klant + melding naar de eigenaar. */
export async function sendAppointmentMails(appointment: Appointment): Promise<boolean> {
  const data = { a: appointment, dateNl: formatDateNl(appointment.date), site: config.site };

  const [customerHtml, ownerHtml] = await Promise.all([
    render('appointment-customer', data),
    render('appointment-owner', data),
  ]);

  const when = `${data.dateNl} om ${appointment.time}`;
  const meet = appointment.meetLink ? `\nGoogle Meet: ${appointment.meetLink}` : '';

  const customerSent = await send({
    to: appointment.email,
    replyTo: config.site.ownerEmail,
    subject: `Bevestiging: kennismaking met ${config.site.name} op ${data.dateNl} om ${appointment.time}`,
    html: customerHtml,
    text: `Hoi ${appointment.name},\n\nJe afspraak staat gepland op ${when}.${meet}\n\nTot dan!\n${config.site.name}`,
  });

  await send({
    to: config.site.ownerEmail,
    replyTo: appointment.email,
    subject: `Nieuwe afspraak: ${appointment.name} (${appointment.company}) op ${data.dateNl} om ${appointment.time}`,
    html: ownerHtml,
    text: `Nieuwe afspraak van ${appointment.name} <${appointment.email}>, tel. ${appointment.phone}, op ${when}.${meet}`,
  });

  return customerSent;
}
