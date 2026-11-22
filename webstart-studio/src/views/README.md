# src/views/: de "V" van MVC

**Talen in deze map: HTML + EJS.**

- **HTML** bepaalt de structuur van elke pagina (koppen, knoppen, formulieren).
- **EJS** (*Embedded JavaScript templates*) is HTML met kleine stukjes "slimme" code, zodat de server data kan invullen. De bestanden eindigen daarom op `.ejs` in plaats van `.html`. De browser krijgt uiteindelijk gewone HTML.

## Hoe lees je EJS?

| Schrijfwijze | Betekenis |
|---|---|
| `<%= waarde %>` | Zet een waarde in de pagina (veilig: speciale tekens worden onschadelijk gemaakt) |
| `<%- include('...') %>` | Plak een ander bestand (bijv. de header of footer) op deze plek |
| `<% if (...) { %> ... <% } %>` | Toon iets alleen als aan een voorwaarde is voldaan |
| `<% lijst.forEach(...) %>` | Herhaal een stukje HTML voor elk item in een lijst |

## Mapindeling

- `partials/`: herbruikbare stukken: `head.ejs` (bovenkant van de HTML), `header.ejs` (navigatiebalk) en `footer.ejs` (voet met social media + paginalinks). Pas je de navbar aan, dan verandert hij op alle pagina's.
- `pages/`: de pagina's zelf: `home`, `portfolio`, `contact`, `appointment`, `404`, `error`.
- `emails/`: de e-mails die de website verstuurt (contactbericht, afspraakbevestiging).

Voorbeeld: de portfolio-pagina (`pages/portfolio.ejs`) toont een melding als `items` leeg is, en anders voor elke klant een klikbare kaart.
