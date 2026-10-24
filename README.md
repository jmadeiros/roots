# Roots interface prototype

Two buildless Roots concepts for the East Bay Permaculture Guild. The deliverable is the static `dist/` directory; it uses native browser ES modules with no package install or build step.

Run a local static server from this project directory:

```sh
python3 -m http.server 4173 --directory dist
```

Open either starting route:

- [Workspace](http://localhost:4173/#/workspace/opportunities): opportunities, project plan, volunteer benefits, and build plan.
- [Dashboard](http://localhost:4173/#/dashboard/overview): overview, people, funding, and events.

Use the sidebar switch to move between concepts. Trail is excluded. Serve these files over HTTP; opening `index.html` directly can block module loading.

Saved opportunities, project edits, checklists, calculator inputs, and demo interest use browser local storage (`roots-demo-v1`). The About dialog includes **Reset demo changes**. This prototype has no backend, shared account state, message delivery, applications, registrations, or payment processing. Invitations are previews. People, project details, and community metrics are illustrative; program information is the supplied October 24, 2026 research snapshot.

`PRODUCT.md` records scope and content constraints. `DESIGN.md` documents the implemented visual system, with component previews and extension tokens in `.impeccable/design.json`.
