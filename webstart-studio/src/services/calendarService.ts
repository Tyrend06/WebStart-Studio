import { google } from 'googleapis';
import { config } from '../config';
import type { Appointment } from '../models/appointmentModel';
import { addMinutes } from './availabilityService';

export interface MeetResult {
  meetLink: string | null;
  eventId: string | null;
}

export function isCalendarConfigured(): boolean {
  const { clientId, clientSecret, refreshToken } = config.google;
  return Boolean(clientId && clientSecret && refreshToken);
}

/**
 * Maakt een Google Agenda-afspraak met een Google Meet-link aan.
 * Geeft null terug als Google nog niet is gekoppeld (zie README, "Google Meet koppelen").
 */
export async function createMeetEvent(appointment: Appointment): Promise<MeetResult | null> {
  if (!isCalendarConfigured()) {
    console.warn('[calendar] Google niet gekoppeld: er is geen Meet-link aangemaakt.');
    return null;
  }

  const auth = new google.auth.OAuth2(config.google.clientId, config.google.clientSecret);
  auth.setCredentials({ refresh_token: config.google.refreshToken });
  const calendar = google.calendar({ version: 'v3', auth });

  const { timezone, slotMinutes } = config.booking;
  const end = addMinutes(appointment.time, slotMinutes);

  const response = await calendar.events.insert({
    calendarId: config.google.calendarId,
    conferenceDataVersion: 1,
    sendUpdates: 'none', // de bevestigingsmail sturen wij zelf
    requestBody: {
      summary: `Kennismaking ${config.site.name} – ${appointment.name}`,
      description: [
        `Bedrijf: ${appointment.company} (${appointment.businessType})`,
        `Telefoon: ${appointment.phone}`,
        `Heeft al een website: ${appointment.hasWebsite}`,
        appointment.goal ? `Doel: ${appointment.goal}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: `${appointment.date}T${appointment.time}:00`, timeZone: timezone },
      end: { dateTime: `${appointment.date}T${end}:00`, timeZone: timezone },
      attendees: [{ email: appointment.email, displayName: appointment.name }],
      conferenceData: {
        createRequest: {
          requestId: appointment.id,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  const videoEntry = response.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video');
  return {
    meetLink: response.data.hangoutLink ?? videoEntry?.uri ?? null,
    eventId: response.data.id ?? null,
  };
}
