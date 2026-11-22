import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';

/** Eén klant in het portfolio. */
export interface PortfolioItem {
  name: string; // naam van het bedrijf
  url: string; // link naar de live website van de klant
  category: string; // bijv. "Kapper"
  description: string; // korte omschrijving
  image?: string; // optioneel: pad of URL naar een screenshot
}

const file = path.join(config.dataDir, 'portfolio.json');

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Leest alle klanten uit data/portfolio.json. Geen bestand of lege lijst = geen klanten. */
export function getAll(): PortfolioItem[] {
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter((item) => typeof item.name === 'string' && isValidUrl(item.url))
    .map((item) => ({
      name: String(item.name),
      url: String(item.url),
      category: typeof item.category === 'string' ? item.category : '',
      description: typeof item.description === 'string' ? item.description : '',
      image: typeof item.image === 'string' ? item.image : undefined,
    }));
}
