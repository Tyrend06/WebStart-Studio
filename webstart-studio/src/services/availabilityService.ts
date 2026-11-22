import { config } from '../config';
import * as appointmentModel from '../models/appointmentModel';

/** Regels voor welke datums en tijden geboekt kunnen worden. Alle datums zijn "YYYY-MM-DD", tijden "HH:MM". */

const { timezone, startHour, endHour, slotMinutes, maxDaysAhead, workDays } = config.booking;

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Vandaag volgens de tijd in Nederland. */
export function todayIso(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: timezone });
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function weekday(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function bookableRange(): { min: string; max: string } {
  const today = todayIso();
  return { min: addDays(today, 1), max: addDays(today, maxDaysAhead) };
}

export function isBookableDate(iso: string): boolean {
  if (!isIsoDate(iso)) return false;
  const { min, max } = bookableRange();
  return iso >= min && iso <= max && workDays.includes(weekday(iso));
}

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Alle tijden van een dag: 09:00, 09:30 ... 16:30. */
export function allSlots(): string[] {
  const slots: string[] = [];
  for (let minutes = startHour * 60; minutes + slotMinutes <= endHour * 60; minutes += slotMinutes) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

/** Nog vrije tijden op een datum. */
export function freeSlots(iso: string): string[] {
  if (!isBookableDate(iso)) return [];
  const taken = new Set(appointmentModel.takenTimes(iso));
  return allSlots().filter((slot) => !taken.has(slot));
}
