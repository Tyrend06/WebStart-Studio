import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';

/** Een geboekte afspraak (kennismakingsgesprek). */
export interface Appointment {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  businessType: string;
  hasWebsite: 'ja' | 'nee';
  goal: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  meetLink: string | null;
  eventId: string | null;
}

/**
 * Opslag in een JSON-bestand (data/appointments.json): simpel en zonder database.
 * Let op: op hosting met een tijdelijke schijf (bijv. Render gratis, Cloud Run) verdwijnt dit
 * bestand bij een herstart. Zie docs/HOSTING.md voor een database-alternatief.
 */
const file = path.join(config.dataDir, 'appointments.json');

function readAll(): Appointment[] {
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(raw) ? (raw as Appointment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: Appointment[]): void {
  fs.mkdirSync(config.dataDir, { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, file);
}

export function takenTimes(date: string): string[] {
  return readAll()
    .filter((a) => a.date === date)
    .map((a) => a.time);
}

export function add(appointment: Appointment): void {
  const list = readAll();
  list.push(appointment);
  writeAll(list);
}

export function update(id: string, patch: Partial<Appointment>): void {
  const list = readAll().map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeAll(list);
}
