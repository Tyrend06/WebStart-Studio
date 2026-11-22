# Webstart Studio: bedrijfswebsite

De website van **Webstart Studio**, een bedrijf dat websites maakt voor dienstverleners (kappers, nailsalons, rijscholen enz.).

- Kleuren: **jet black** (`#000000`) en wit
- Pagina's: **Home**, **Portfolio**, **Afspraak**, **Contact**
- Gebouwd met **HTML, CSS en TypeScript** in een **MVC-structuur** (Model-View-Controller)

> Meer lezen: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (opbouw van de code) en [docs/HOSTING.md](docs/HOSTING.md) (online zetten bij verschillende cloudproviders).

---

## Wat doet de website?

| Pagina | Wat zie je? |
|---|---|
| **Home** (`/`) | Zwarte banner bovenaan met welkomsttekst, een **CTA-knop** ("Plan een gratis kennismaking" → afspraak) en een **Discover us**-knop (→ portfolio). Scroll voor uitleg over wat het bedrijf doet, voor wie, de werkwijze en nog een CTA. |
| **Portfolio** (`/portfolio`) | Alle klanten als klikbare kaarten (klik = de live website van de klant). Zijn er nog geen klanten (zoals nu), dan staat er een duidelijke melding. |
| **Afspraak** (`/afspraak`) | Formulier in 4 stappen: 1) jouw gegevens, 2) je bedrijf, 3) **visuele kalender** met datum en tijd, 4) bevestigen. Daarna wordt een **Google Meet-link** gemaakt en volgt een **bevestigingsmail**. |
| **Contact** (`/contact`) | Eenvoudig formulier. Het bericht komt per e-mail binnen op `marentleynunez@gmail.com`. |

De **navigatiebalk** (boven) en de **footer** (onder, met social media) staan op elke pagina en linken naar alle pagina's.

---

## Aan de slag in VS Code

### Wat heb je nodig?
1. [Node.js](https://nodejs.org) versie **20 of nieuwer** (kies "LTS")
2. [Visual Studio Code](https://code.visualstudio.com)
3. [Git](https://git-scm.com) (voor GitHub)

Controleer in een terminal: `node --version` (moet 20 of hoger zijn).

### Stappen
1. Open VS Code → **File → Open Folder…** → kies de map `webstart-studio`.
2. Open de terminal in VS Code: **Terminal → New Terminal**.
3. Installeer de onderdelen (eenmalig):
   ```bash
   npm install
   ```
4. Maak je instellingen-bestand:
   ```bash
   cp .env.example .env
   ```
   (Windows PowerShell: `copy .env.example .env`). Open `.env` en vul in wat je wilt, zie [E-mail instellen](#e-mail-instellen) en [Google Meet koppelen](#google-meet-koppelen). Zonder deze stappen werkt de website al: alleen e-mails en Meet-links worden dan nog niet verstuurd.
5. Start de website:
   ```bash
   npm run dev
   ```
6. Open **http://localhost:3000** in je browser. Wijzig je een TypeScript-bestand in `src/`, dan herstart de server automatisch. Wijzig je iets in `public/ts/`, draai dan in een tweede terminal `npm run dev:client` (of herstart `npm run dev`) zodat de browser-TypeScript opnieuw wordt gecompileerd.

### Handige commando's
| Commando | Wat het doet |
|---|---|
| `npm run dev` | Start de website lokaal (met automatisch herstarten) |
| `npm run dev:client` | Compileert de browser-TypeScript continu terwijl je werkt |
| `npm run typecheck` | Controleert alle TypeScript op fouten, zonder iets te bouwen |
| `npm run build` | Zet alle TypeScript om naar JavaScript (nodig voor online zetten) |
| `npm start` | Start de gebouwde versie (zoals op een server) |
| `npm run google-token` | Eenmalig: Google Meet koppelen |

### Aanrader: VS Code-extensies
*EJS language support* (voor de `.ejs`-pagina's), *ESLint* en *Prettier*.

---

## Aanpassen: de meest gebruikte dingen

| Wat | Waar |
|---|---|
| Teksten van de homepage | `src/views/pages/home.ejs` |
| Klanten toevoegen aan het portfolio | `data/portfolio.json` (uitleg: [data/README.md](data/README.md)) |
| Menu-items | `src/config/index.ts` → `nav` |
| Social media-links | `.env` → `SOCIAL_INSTAGRAM`, `SOCIAL_FACEBOOK`, `SOCIAL_LINKEDIN`, `SOCIAL_TIKTOK` (**nu staan hier algemene links; vervang ze door jouw accounts**) |
| Beschikbare dagen/tijden voor afspraken | `src/config/index.ts` → `booking` (standaard ma-vr, 09:00-17:00, 30 min) |
| Keuzelijst "Soort bedrijf" | `src/config/index.ts` → `businessTypes` |
| Kleuren en lettertypen | `public/css/styles.css` (bovenaan, `:root`) |
| Inhoud van de e-mails | `src/views/emails/` |

> De teksten op de homepage (diensten, werkwijze) zijn voorbeeldteksten. Pas ze aan zodat ze precies kloppen met wat jij aanbiedt.

---

## E-mail instellen

Contactberichten en afspraakbevestigingen worden verstuurd via Gmail (SMTP).

1. Zet in je Google-account **verificatie in twee stappen** aan.
2. Maak een **app-wachtwoord**: Google-account → Beveiliging → *Verificatie in twee stappen* → *App-wachtwoorden*.
3. Vul in `.env` in:
   ```
   SMTP_USER=marentleynunez@gmail.com
   SMTP_PASS=<het app-wachtwoord van 16 tekens>
   ```
4. Herstart de server en verstuur een testbericht via de contactpagina.

Contactberichten komen binnen op `OWNER_EMAIL` (staat al op `marentleynunez@gmail.com`). Je kunt gewoon op zo'n e-mail antwoorden: het antwoord gaat naar de bezoeker.

---

## Google Meet koppelen

De website maakt bij elke boeking een afspraak in **jouw Google Agenda** met een **Google Meet-link**. Daarvoor heeft de site eenmalig toestemming nodig:

1. Ga naar [Google Cloud Console](https://console.cloud.google.com) en maak een **nieuw project**.
2. Zoek **Google Calendar API** en klik **Inschakelen**.
3. **OAuth-toestemmingsscherm**: kies *Extern*, vul een app-naam en je e-mail in, en voeg jezelf toe als *testgebruiker*.
4. **Inloggegevens → Inloggegevens maken → OAuth-client-ID**:
   - Type: **Webtoepassing**
   - Geautoriseerde omleidings-URI: `http://localhost:3001/oauth2callback`
5. Kopieer de **client-ID** en het **clientgeheim** naar `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
6. Draai in de terminal `npm run google-token`, open de link, log in met je Google-account en geef toestemming.
7. Kopieer de getoonde regel `GOOGLE_REFRESH_TOKEN=...` naar `.env` en herstart de server.

> **Let op:** zolang het toestemmingsscherm de status *Testen* heeft, verloopt de token na ongeveer 7 dagen. Zet de app voor permanent gebruik op **"In productie publiceren"** (voor eigen gebruik hoef je niet door een volledige Google-controle).

Zonder deze koppeling wordt de afspraak wel opgeslagen en gemaild, maar zonder Meet-link.

---

## Op GitHub zetten

1. Maak op [github.com](https://github.com) een nieuwe, lege repository (bijv. `webstart-studio`).
2. Voer in de projectmap uit:
   ```bash
   git init
   git add .
   git commit -m "Eerste versie Webstart Studio"
   git branch -M main
   git remote add origin https://github.com/<jouw-gebruikersnaam>/webstart-studio.git
   git push -u origin main
   ```
3. Controleer dat **`.env` niet** op GitHub staat. Dat bestand bevat je wachtwoorden en wordt door `.gitignore` buiten GitHub gehouden. Zet geheimen nooit in de code zelf.

Klanten- en afsprakengegevens (`data/appointments.json`) worden ook niet geüpload.

---

## Talen in dit project

Je vroeg om HTML, CSS en TypeScript. Daarnaast zijn er een paar kleine "hulptalen" nodig. Hieronder staat waar welke taal voor dient.

| Taal / bestandstype | Waar | Waarvoor |
|---|---|---|
| **TypeScript** (`.ts`) | `src/` (server) en `public/ts/` (browser) | Alle logica: pagina's serveren, formulieren controleren, e-mail, Google Meet, kalender in de browser |
| **HTML** (via **EJS**, `.ejs`) | `src/views/` | De structuur van de pagina's. EJS is HTML met invulplekken, zie [src/views/README.md](src/views/README.md) |
| **CSS** | `public/css/styles.css` | Het uiterlijk: zwart-wit, lettertypen, indeling |
| **JSON** (`.json`) | `data/`, `package.json`, `tsconfig*.json` | Gegevens en instellingen, zie [data/README.md](data/README.md) |
| **Markdown** (`.md`) | README-bestanden | Documentatie (dit bestand) |
| **Dockerfile** | `Dockerfile` | Recept om de site in een container te draaien (voor cloudproviders die dat gebruiken) |
| **JavaScript** (`.js`) | `dist/` en `public/js/` | **Wordt automatisch gemaakt** uit TypeScript door `npm run build`. Je bewerkt deze bestanden nooit zelf. |

---

## Naar productie

```bash
npm install --include=dev
npm run build
NODE_ENV=production npm start
```

Zie [docs/HOSTING.md](docs/HOSTING.md) voor stap-voor-stap uitleg per cloudprovider.

## Beperkingen en tips

- **Afspraken staan in een JSON-bestand.** Op hosting met een tijdelijke schijf verdwijnt dat bij een herstart. Gebruik een persistente schijf of een database (zie HOSTING.md). Elke boeking staat ook in je Google Agenda en in je mailbox.
- De afsprakenkalender controleert alleen dubbele boekingen binnen deze website, niet je andere Google Agenda-afspraken.
- Beveiliging: formulieren hebben spam-bescherming (verborgen veld + limiet per IP) en invoercontrole. Voeg bij groei een cookie-/privacyverklaring toe (AVG).
- Dit project is bedoeld voor één server. Draai je meerdere servers tegelijk, gebruik dan een database en een gedeelde rate limiter.
