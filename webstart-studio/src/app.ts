import express, { type NextFunction, type Request, type Response } from 'express';
import { config } from './config';
import * as pageController from './controllers/pageController';
import { securityHeaders } from './middleware/security';
import { router } from './routes';

/** Bouwt de Express-applicatie (zonder hem te starten, zie server.ts). */
export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // achter een proxy van de hostingprovider klopt het IP-adres dan
  app.set('view engine', 'ejs');
  app.set('views', config.viewsDir);

  app.use(securityHeaders);
  app.use(express.json({ limit: '20kb' }));
  app.use(express.static(config.publicDir, { maxAge: config.isProd ? '7d' : 0 }));

  // Variabelen die elke view kan gebruiken
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.site = config.site;
    res.locals.nav = config.nav;
    res.locals.social = config.social;
    res.locals.currentPath = req.path;
    res.locals.year = new Date().getFullYear();
    res.locals.title = '';
    res.locals.description = config.site.tagline;
    res.locals.script = null;
    next();
  });

  app.use(router);
  app.use(pageController.notFound);

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    if (res.headersSent) return;
    res.status(500).render('pages/error', { title: 'Er ging iets mis', description: '' });
  });

  return app;
}
