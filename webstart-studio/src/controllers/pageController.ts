import type { Request, Response } from 'express';
import { config } from '../config';
import * as portfolioModel from '../models/portfolioModel';
import { bookableRange } from '../services/availabilityService';

/** Controllers voor de gewone pagina's: haalt data op (model) en kiest de view. */

export function home(_req: Request, res: Response): void {
  res.render('pages/home', {
    title: '',
    description: 'Webstart Studio maakt professionele websites voor kappers, nailsalons, rijscholen en andere dienstverleners.',
  });
}

export function portfolio(_req: Request, res: Response): void {
  res.render('pages/portfolio', {
    title: 'Portfolio',
    description: 'Bekijk de websites die Webstart Studio voor klanten heeft gemaakt.',
    items: portfolioModel.getAll(),
  });
}

export function contact(_req: Request, res: Response): void {
  res.render('pages/contact', {
    title: 'Contact',
    description: 'Neem contact op met Webstart Studio.',
    script: '/js/contact.js',
  });
}

export function appointment(_req: Request, res: Response): void {
  const { min, max } = bookableRange();
  res.render('pages/appointment', {
    title: 'Afspraak maken',
    description: 'Plan een gratis online kennismaking met Webstart Studio.',
    script: '/js/appointment.js',
    businessTypes: config.businessTypes,
    range: { min, max, workDays: config.booking.workDays.join(',') },
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).render('pages/404', { title: 'Pagina niet gevonden', description: '' });
}
