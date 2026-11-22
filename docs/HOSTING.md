# Cloud hosting: jouw website én die van je klanten

Dit document helpt je kiezen **waar** je websites online zet. Prijzen en gratis niveaus van providers veranderen regelmatig: controleer altijd de actuele voorwaarden op hun website voordat je kiest.

Er zijn twee verschillende situaties:

1. **De Webstart Studio-website zelf.** Een Node.js-applicatie (met afspraken, e-mail, Google Meet). Heeft een *server* nodig.
2. **Websites voor je klanten.** Meestal *statische* websites (HTML, CSS en JavaScript uit TypeScript). Die kunnen op veel goedkopere en simpelere hosting.

---

## Deel 1: Webstart Studio zelf online zetten

### Vooraf nodig
- De code op GitHub (zie README)
- Een domeinnaam (bij bijv. TransIP, Namecheap, Cloudflare of Hostnet)
- Je `.env`-waarden, die je **in het dashboard van de provider** invult als *Environment variables* (nooit op GitHub)
- Build-commando: `npm install --include=dev && npm run build`
- Start-commando: `npm start`
- Zet `NODE_ENV=production` en `BASE_URL=https://jouwdomein.nl`

### Belangrijk: afspraken bewaren
De afspraken staan in `data/appointments.json`. Veel clouddiensten hebben een **tijdelijke schijf**: bij elke herstart of nieuwe versie is die leeg. Kies dus:
- een provider met een **persistente schijf/volume** (hieronder aangegeven), of
- een **database** (bijv. PostgreSQL) en pas `appointmentModel.ts` aan. Dat is het enige bestand dat daarvoor hoeft te veranderen.

Tot die tijd staat elke afspraak ook in je **Google Agenda** en je **mailbox**, dus er gaat niets onherstelbaar verloren.

### Overzicht

| Provider | Type | Moeilijkheid | Persistente schijf? | Past goed bij |
|---|---|---|---|---|
| **Render** | PaaS (GitHub koppelen) | Makkelijk | Ja (betaalde schijf) | Beginners, snel live |
| **Railway** | PaaS | Makkelijk | Ja (volume) | Beginners, snel testen |
| **Fly.io** | Container (Docker) | Gemiddeld | Ja (volume) | Servers dicht bij NL/EU |
| **DigitalOcean App Platform** | PaaS | Makkelijk | Nee (tijdelijk), wel database erbij | Stabiel, duidelijke prijzen |
| **Google Cloud Run** | Container, serverless | Gemiddeld | Nee (tijdelijk) → gebruik database | Als je al Google Cloud gebruikt |
| **AWS** (App Runner / Elastic Beanstalk / Lightsail) | Cloud-platform | Moeilijker | Lightsail/EC2: ja | Grote schaal, veel opties |
| **Microsoft Azure App Service** | PaaS | Gemiddeld | Beperkt | Bedrijven met Microsoft-omgeving |
| **VPS** (Hetzner, DigitalOcean, TransIP, Vultr) | Eigen server | Moeilijker | Ja (gewone schijf) | Volledige controle, vaak voordeligste |

> **Mijn advies om te starten:** *Render* of *Railway* (simpelst) met een database of volume voor de afspraken. Wil je maximale controle voor weinig geld en vind je beheer niet erg: een *VPS* bij een EU-aanbieder.
> *Vercel* en *Netlify* zijn vooral gemaakt voor statische sites en serverless functies. Voor deze Express-app moet je de code eerst omzetten, daarom zijn ze hier minder geschikt.

### Stappen per provider

**Render**
1. Maak een account en kies *New → Web Service* → koppel je GitHub-repository.
2. Build command: `npm install --include=dev && npm run build`; Start command: `npm start`.
3. Voeg onder *Environment* alle variabelen uit `.env.example` toe.
4. Voor opslag van afspraken: voeg een *Disk* toe (mount op `/opt/render/project/src/data`) of gebruik een database.
5. Onder *Settings → Custom Domains* koppel je je domein; SSL (https) is automatisch.

**Railway**
1. *New Project → Deploy from GitHub repo*.
2. Zet bij *Variables* je `.env`-waarden en stel build/start in zoals hierboven.
3. Voeg een *Volume* toe op pad `/app/data` voor de afspraken, en koppel onder *Networking* je domein.

**Fly.io** (gebruikt het meegeleverde `Dockerfile`)
```bash
fly launch            # herkent het Dockerfile; kies een regio in Europa
fly secrets set SMTP_USER=... SMTP_PASS=... GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... GOOGLE_REFRESH_TOKEN=...
fly volumes create data --size 1
# voeg in fly.toml toe:  [mounts] source = "data"  destination = "/app/data"
fly deploy
```

**DigitalOcean App Platform**
1. *Create → App* → kies je GitHub-repository.
2. Zelfde build/start-commando's en variabelen als bij Render.
3. Voeg een beheerde database toe als je afspraken permanent wilt bewaren.

**Google Cloud Run**
```bash
gcloud run deploy webstart-studio --source . --region europe-west4 --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,BASE_URL=https://jouwdomein.nl
```
Cloud Run bouwt met het `Dockerfile`. Zet geheime waarden bij voorkeur in *Secret Manager*. De schijf is tijdelijk, dus gebruik een database (bijv. Firestore of Cloud SQL) voor afspraken.

**AWS**
- *App Runner*: *Create service* → bron: GitHub (build `npm install --include=dev && npm run build`, start `npm start`, poort 3000) of een container-image.
- *Lightsail*: een vaste, voorspelbare maandprijs; werkt als een kleine VPS (zie hieronder).
- *Elastic Beanstalk*: Node.js-platform; upload de gebouwde map.

**Azure App Service**
```bash
az webapp up --name webstart-studio --runtime "NODE:20-lts" --location westeurope
```
Zet daarna build-instellingen en *Application settings* (= je `.env`) in de Azure-portal.

**VPS (Ubuntu) met Nginx**
```bash
# eenmalig op de server
sudo apt update && sudo apt install -y nginx git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pm2

git clone https://github.com/<jij>/webstart-studio.git && cd webstart-studio
cp .env.example .env && nano .env          # vul je waarden in, NODE_ENV=production
npm install --include=dev && npm run build
pm2 start dist/server.js --name webstart && pm2 save && pm2 startup
```
Nginx als "voordeur" (bestand `/etc/nginx/sites-available/webstart`):
```nginx
server {
  server_name jouwdomein.nl www.jouwdomein.nl;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/webstart /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d jouwdomein.nl -d www.jouwdomein.nl   # gratis https
```
Een update uitrollen: `git pull && npm install --include=dev && npm run build && pm2 restart webstart`.

---

## Deel 2: Websites van klanten hosten

Websites voor kappers, nailsalons en rijscholen zijn meestal **statisch**: HTML, CSS en (gecompileerde) TypeScript, zonder eigen server. Dat is goedkoop, snel en makkelijk te beheren.

| Provider | Kenmerken |
|---|---|
| **Cloudflare Pages** | Snel wereldwijd netwerk, https en domeinbeheer in één, vaak een ruim gratis niveau |
| **Netlify** | Zeer eenvoudig: koppel GitHub, elke wijziging staat automatisch online. Formulieren ingebouwd |
| **Vercel** | Zelfde werkwijze als Netlify, sterk bij moderne frameworks |
| **GitHub Pages** | Gratis voor statische sites rechtstreeks uit een GitHub-repo |
| **Firebase Hosting** (Google) | Snel, https inbegrepen, goed te combineren met Google-diensten |
| **AWS S3 + CloudFront** | Zeer schaalbaar, meer instelwerk |
| **Azure Static Web Apps** | Voor wie in het Microsoft-ecosysteem werkt |
| **Gewone webhosting** (bijv. TransIP, Hostnet, Combell) | Upload via FTP; handig als de klant al zo'n pakket heeft |

Heeft een klant dynamische functies (eigen afsprakensysteem, inlog, webshop)? Dan heeft die site net als deze een server nodig, en kies je uit deel 1.

### Praktische aanpak voor klantenwebsites
1. **Eén GitHub-repository per klant.** Zo blijft alles gescheiden en overdraagbaar.
2. **Hosting per klant apart** (bij voorkeur in een account van jou, zodat je overzicht houdt, of in een account van de klant, zodat zij eigenaar blijven). Spreek dit vooraf af en leg het vast.
3. **Domeinnaam op naam van de klant.** Jij beheert de DNS-instellingen. Een klant moet altijd kunnen verhuizen.
4. **Automatisch uitrollen:** koppel de repo aan Netlify/Cloudflare Pages/Vercel; een `git push` zet de nieuwe versie live.
5. **Https** is bij al deze providers automatisch en gratis.
6. **Back-ups:** de code staat op GitHub; bewaar wachtwoorden in een wachtwoordmanager.

### Stappen: een statische klantensite op Netlify of Cloudflare Pages
1. Zet de website in een GitHub-repository.
2. Kies *Add new site → Import from Git* en selecteer de repo.
3. Build command: `npm run build` (als de site TypeScript gebruikt, anders leeg). Publish directory: de map met het eindresultaat (bijv. `dist` of `public`).
4. Voeg onder *Domain settings* het domein van de klant toe en zet de DNS-records die de provider toont bij de domeinregistrar.

---

## Waar moet je op letten (beide delen)

- **AVG/GDPR:** kies bij voorkeur een **EU-regio** (bijv. Frankfurt, Amsterdam, Parijs). Je verwerkt namen, e-mailadressen en telefoonnummers. Zorg voor een **privacyverklaring** op elke site en maak afspraken met klanten over wie wat beheert.
- **Kosten:** begin klein en schaal op. Let op kosten voor domeinnaam (jaarlijks), e-mail en eventuele databases.
- **E-mail:** Gmail via app-wachtwoord is prima om te starten. Voor veel verkeer of een zakelijk adres op je eigen domein: een e-mailprovider als Brevo, Postmark of Mailgun (alleen `SMTP_*` aanpassen).
- **Geheimen** (`.env`) alleen in het dashboard van de provider, nooit in GitHub.
- **Monitoring:** zet een gratis uptime-controle aan (bijv. UptimeRobot) zodat je het hoort als de site uit de lucht is.
