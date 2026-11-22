import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';
import * as contactController from '../controllers/contactController';
import * as pageController from '../controllers/pageController';
import { rateLimit } from '../middleware/rateLimit';

/** Koppelt elke URL aan de juiste controller. */
export const router = Router();

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Te veel verzoeken. Probeer het over een paar minuten opnieuw.',
});

// Pagina's
router.get('/', pageController.home);
router.get('/portfolio', pageController.portfolio);
router.get('/contact', pageController.contact);
router.get('/afspraak', pageController.appointment);

// Formulieren / API (de browser roept deze aan via TypeScript in public/ts)
router.post('/contact', formLimiter, contactController.submit);
router.get('/afspraak/slots', appointmentController.slots);
router.post('/afspraak/boeken', formLimiter, appointmentController.book);
