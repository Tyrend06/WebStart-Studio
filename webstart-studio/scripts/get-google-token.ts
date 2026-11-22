/**
 * Eenmalig hulpscript: haalt een "refresh token" op zodat de website namens jou
 * Google Meet-afspraken in jouw Google Agenda kan aanmaken.
 *
 * Gebruik (zie README, "Google Meet koppelen"):
 *   1. Zet GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET in .env
 *   2. Run:  npm run google-token
 *   3. Open de link in je browser, log in met je Google-account en geef toestemming
 *   4. Kopieer de getoonde refresh token naar GOOGLE_REFRESH_TOKEN in .env
 */
import 'dotenv/config';
import http from 'node:http';
import { google } from 'googleapis';

const PORT = 3001;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Vul eerst GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET in je .env-bestand in.');
  process.exit(1);
}

const oauth = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/oauth2callback') {
    res.writeHead(404).end();
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Geen code ontvangen.');
    return;
  }

  try {
    const { tokens } = await oauth.getToken(code);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Gelukt! Je kunt dit venster sluiten en terug naar de terminal gaan.');

    console.log('\nKlaar. Zet deze regel in je .env-bestand:\n');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token ?? '(geen token ontvangen, probeer opnieuw)'}\n`);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Er ging iets mis, kijk in de terminal.');
    console.error(error);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Open deze link in je browser en geef toestemming:\n');
  console.log(authUrl + '\n');
  console.log(`(Wachten op Google... het script luistert op ${REDIRECT_URI})`);
});
