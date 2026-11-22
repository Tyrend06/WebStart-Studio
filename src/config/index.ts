import 'dotenv/config';
import path from 'node:path';

/**
 * Alle instellingen van de website op één plek.
 * Waarden komen uit het .env-bestand (zie .env.example).
 * De server moet gestart worden vanuit de hoofdmap van het project.
 */
const ROOT = process.cwd();
const env = (key: string, fallback = ''): string => process.env[key] ?? fallback;

const ownerEmail = env('OWNER_EMAIL', 'marentleynunez@gmail.com');
const smtpUser = env('SMTP_USER');

export const config = {
  root: ROOT,
  viewsDir: path.join(ROOT, 'src', 'views'),
  publicDir: path.join(ROOT, 'public'),
  dataDir: path.join(ROOT, 'data'),
  port: Number(env('PORT', '3000')),
  isProd: env('NODE_ENV') === 'production',

  site: {
    name: 'Webstart Studio',
    tagline: 'Professionele websites voor dienstverlenende bedrijven',
    baseUrl: env('BASE_URL', 'http://localhost:3000'),
    ownerEmail,
  },

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Afspraak', href: '/afspraak' },
    { label: 'Contact', href: '/contact' },
  ],

  social: {
    instagram: env('SOCIAL_INSTAGRAM', 'https://www.instagram.com/'),
    facebook: env('SOCIAL_FACEBOOK', 'https://www.facebook.com/'),
    linkedin: env('SOCIAL_LINKEDIN', 'https://www.linkedin.com/'),
    tiktok: env('SOCIAL_TIKTOK', 'https://www.tiktok.com/'),
  },

  smtp: {
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: Number(env('SMTP_PORT', '465')),
    user: smtpUser,
    pass: env('SMTP_PASS'),
    from: env('MAIL_FROM') || `Webstart Studio <${smtpUser || ownerEmail}>`,
  },

  google: {
    clientId: env('GOOGLE_CLIENT_ID'),
    clientSecret: env('GOOGLE_CLIENT_SECRET'),
    refreshToken: env('GOOGLE_REFRESH_TOKEN'),
    calendarId: env('GOOGLE_CALENDAR_ID', 'primary'),
  },

  booking: {
    timezone: 'Europe/Amsterdam',
    startHour: 9, // eerste afspraak 09:00
    endHour: 17, // laatste afspraak eindigt om 17:00
    slotMinutes: 30, // lengte van een gesprek
    maxDaysAhead: 60, // hoe ver vooruit je kunt boeken
    workDays: [1, 2, 3, 4, 5], // 0 = zondag, 1 = maandag ... 6 = zaterdag
  },

  businessTypes: [
    'Kapper / barbershop',
    'Nailsalon',
    'Rijschool',
    'Schoonheidssalon',
    'Sportschool / personal trainer',
    'Anders',
  ] as string[],
};
