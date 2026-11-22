# Architectuur: zo zit de code in elkaar

De website volgt het **MVC-patroon**:

- **Model**: de gegevens en regels erover (klanten, afspraken)
- **View**: wat de bezoeker ziet (HTML-pagina's)
- **Controller**: de "regisseur": ontvangt een verzoek, vraagt data aan het model en kiest de view

## Mapstructuur

```
webstart-studio/
├── README.md                    Instructies (start hier)
├── package.json                 Projectinfo, commando's en onderdelen (dependencies)
├── tsconfig.json                TypeScript-instellingen voor de server
├── tsconfig.client.json         TypeScript-instellingen voor de browser-code
├── Dockerfile                   Container-recept voor cloud hosting
├── .env.example                 Voorbeeld van instellingen (kopieer naar .env)
├── .gitignore                   Wat NIET naar GitHub gaat (o.a. .env)
│
├── src/                         ── SERVER (TypeScript) ──
│   ├── server.ts                Startpunt: start de server
│   ├── app.ts                   Zet Express op: beveiliging, views, routes, foutpagina's
│   ├── config/
│   │   └── index.ts             Alle instellingen op één plek (leest .env)
│   ├── routes/
│   │   └── index.ts             Koppelt elke URL aan een controller
│   ├── controllers/             C: de regisseurs
│   │   ├── pageController.ts        Home, Portfolio, Contact, Afspraak, 404
│   │   ├── contactController.ts     Contactformulier verwerken
│   │   └── appointmentController.ts Vrije tijden geven + afspraak boeken
│   ├── models/                  M: gegevens
│   │   ├── portfolioModel.ts        Leest klanten uit data/portfolio.json
│   │   └── appointmentModel.ts      Slaat afspraken op in data/appointments.json
│   ├── services/                Hulpdiensten voor de controllers
│   │   ├── availabilityService.ts   Regels: welke dagen/tijden zijn boekbaar
│   │   ├── mailService.ts           E-mail versturen (Nodemailer)
│   │   └── calendarService.ts       Google Agenda + Google Meet-link
│   ├── middleware/              Controles die vóór de controllers draaien
│   │   ├── security.ts              Veiligheids-headers
│   │   ├── rateLimit.ts             Anti-spam: maximaal aantal verzoeken per IP
│   │   └── validation.ts            Invoer controleren en opschonen
│   └── views/                   V: pagina's (HTML via EJS)
│       ├── partials/                head, header (navbar), footer (social media)
│       ├── pages/                   home, portfolio, contact, appointment, 404, error
│       └── emails/                  contactbericht + afspraakbevestigingen
│
├── public/                      ── BROWSER (wat de bezoeker downloadt) ──
│   ├── css/styles.css           Alle styling (zwart/wit)
│   ├── ts/                      Browser-TypeScript (bron, hier werk je in)
│   │   ├── main.ts                  Mobiel menu + scroll-animaties
│   │   ├── contact.ts               Contactformulier versturen
│   │   └── appointment.ts           Stappenformulier + kalender
│   ├── js/                      Automatisch gemaakt uit ts/ (niet bewerken, niet op GitHub)
│   └── favicon.svg
│
├── data/                        ── GEGEVENS (JSON) ──
│   ├── portfolio.json               Jouw klanten (nu leeg: [])
│   └── appointments.json            Wordt automatisch aangemaakt
│
├── scripts/
│   └── get-google-token.ts      Eenmalig: Google Meet koppelen
│
├── docs/
│   ├── ARCHITECTURE.md          Dit bestand
│   └── HOSTING.md               Cloud hosting-opties
│
└── dist/                        Automatisch gemaakt uit src/ door `npm run build`
```

## Wat gebeurt er als iemand een pagina opent?

```
Browser                Server (Express)
   │  GET /portfolio        │
   │ ─────────────────────► │  1. middleware: veiligheids-headers
   │                        │  2. routes/index.ts: "/portfolio" → pageController.portfolio
   │                        │  3. controller vraagt data aan het MODEL:
   │                        │        portfolioModel.getAll()  → leest data/portfolio.json
   │                        │  4. controller kiest de VIEW:
   │                        │        pages/portfolio.ejs (met partials header/footer)
   │  ◄──────────────────── │  5. server stuurt de afgemaakte HTML terug
   │  + styles.css + main.js (in de browser)
```

## Wat gebeurt er bij het boeken van een afspraak?

```
Browser (appointment.ts)                    Server
 Stap 1-2: gegevens invullen (alleen in de browser gecontroleerd)
 Stap 3:   kalender → GET /afspraak/slots?date=2026-12-01
                                      ──►   availabilityService.freeSlots(date)
                                      ◄──   ["09:00","09:30", ...]
 Stap 4:   bevestigen → POST /afspraak/boeken (JSON)
                                      ──►   1. invoer opnieuw controleren (validation.ts)
                                            2. tijdstip nog vrij? (availabilityService)
                                            3. opslaan (appointmentModel)
                                            4. Google Meet maken (calendarService)
                                            5. mails sturen (mailService):
                                               klant: bevestiging + Meet-link
                                               jij:   melding met alle gegevens
                                      ◄──   { ok, date, time, meetLink }
 Succes-scherm met Meet-link
```

## Waarom deze keuzes?

- **Express + EJS**: simpel en bekend; de server maakt complete HTML-pagina's (goed voor Google en snel laden).
- **TypeScript**: vangt fouten al tijdens het typen op. `src/` wordt omgezet naar `dist/`, `public/ts/` naar `public/js/`.
- **Controllers dun, services dik**: controllers regelen alleen "wat gebeurt er"; de details (mail, agenda, tijden) zitten in services. Zo kun je onderdelen vervangen (bijv. een database in plaats van JSON) zonder de rest aan te passen.
- **Gegevens in JSON**: geen database nodig om te starten. Vervang `appointmentModel.ts` later door een database; de rest van de code verandert niet, omdat alleen het model weet hoe er wordt opgeslagen.
- **Geheimen in `.env`**: wachtwoorden staan nooit in de code of op GitHub.

## Een nieuwe pagina toevoegen (voorbeeld: "Prijzen")

1. View: maak `src/views/pages/prijzen.ejs` (kopieer de opbouw van `contact.ejs`).
2. Controller: voeg in `pageController.ts` een functie `prices` toe die `res.render('pages/prijzen', {...})` doet.
3. Route: voeg in `routes/index.ts` toe: `router.get('/prijzen', pageController.prices);`
4. Menu: voeg `{ label: 'Prijzen', href: '/prijzen' }` toe aan `nav` in `config/index.ts`. Navbar én footer passen zich automatisch aan.
