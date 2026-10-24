# Roots

A responsive, interactive nonprofit operations UI based on the supplied Roots concept. Built with HTML, CSS, and JavaScript, with locally hosted DM Sans fonts and no build dependencies.

## Run locally

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173 in a browser.

## Included

- Overview with 35 illustrative volunteers, 42% return rate, and six opportunities.
- Searchable volunteer profiles and local volunteer creation.
- Opportunity filters, saved opportunities, fit explanations, eligibility gaps, and official source links.
- Event details and event creation, sorted by date.
- Consent-aware SMS draft editing with an event-specific invitation and personalized preview.
- Example project planning and browser-local persistence.
- Responsive sidebar/bottom navigation, reduced-motion support, keyboard focus, and accessible form labels.

All seed records, metrics, fit assessments, and events are fictional. This frontend does not send messages, make funding applications, import data, or call an AI service. Changes are stored in localStorage under `roots-demo-v1`; different browsers and origins have separate data.

Source files are in `dist/`. `DESIGN.md` documents the implemented visual system. `PRODUCT.md` records scope and demo constraints.
