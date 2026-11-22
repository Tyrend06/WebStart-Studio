# data/: JSON-bestanden

**Taal: JSON.** JSON is een simpel tekstformaat om gegevens op te slaan (lijsten met velden). Het is geen programmeertaal: het bevat alleen data die de website uitleest. Het bestand `src/models/` leest deze bestanden.

## portfolio.json: jouw klanten

Nu staat er `[]`: dat betekent "nog geen klanten". De portfolio-pagina laat dan automatisch de melding *"Nog geen klanten in ons portfolio"* zien.

Heb je een klant? Voeg een blok toe tussen de blokhaken:

```json
[
  {
    "name": "Kapsalon Voorbeeld",
    "url": "https://www.kapsalon-voorbeeld.nl",
    "category": "Kapper",
    "description": "Moderne website met online afspraken.",
    "image": "/images/kapsalon-voorbeeld.jpg"
  }
]
```

| Veld | Verplicht | Uitleg |
|---|---|---|
| `name` | ja | Naam van het bedrijf |
| `url` | ja | Link naar de live website (begint met `https://`). Een klik op de kaart opent deze website |
| `category` | nee | Bijv. "Kapper" of "Rijschool" |
| `description` | nee | Korte omschrijving |
| `image` | nee | Screenshot. Zet het plaatje in `public/images/` en verwijs ernaar, of gebruik een `https://`-link |

Meerdere klanten? Zet een komma tussen de blokken `{ ... }, { ... }`. Let op: de laatste krijgt **geen** komma.

## appointments.json: afspraken

Wordt automatisch aangemaakt zodra iemand een afspraak boekt. Dit bestand staat niet op GitHub (zie `.gitignore`) omdat het persoonsgegevens van klanten bevat. Niet handmatig bewerken.
