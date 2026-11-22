/** Kleine hulpfuncties om invoer van bezoekers te controleren en op te schonen. */

/** Maakt van onbekende invoer een nette tekst met een maximale lengte. */
export function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

/** Zoals clean(), maar zonder regeleindes (voor onderwerpregels en namen). */
export function cleanLine(value: unknown, max: number): string {
  return clean(value, max).replace(/[\r\n]+/g, ' ');
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isPhone(value: string): boolean {
  return /^[+()\d][\d\s().-]{6,19}$/.test(value);
}
