import { config } from './config';
import { createApp } from './app';
import { isCalendarConfigured } from './services/calendarService';
import { isMailConfigured } from './services/mailService';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Webstart Studio draait op http://localhost:${config.port}`);
  if (!isMailConfigured()) console.warn('Let op: e-mail is nog niet ingesteld (SMTP_USER / SMTP_PASS in .env).');
  if (!isCalendarConfigured()) console.warn('Let op: Google Meet is nog niet gekoppeld (GOOGLE_* in .env).');
});
