# Roots dashboard

A standalone, responsive dashboard based on the Roots concept for the East Bay Permaculture Guild.

## Run locally

Run `python3 -m http.server 8765 --directory dist`, then open `http://localhost:8765`.

No build step or package installation is needed. Hosting serves `dist/`.

## Features

- Overview with demo metrics, project summaries, and a persistent next-step checklist.
- Six opportunities with primary sources, eligibility requirements, participant/organization distinctions, filtering, search, saved shortlists, and CSV export.
- Volunteer profiles, skills search, and suggested project matches.
- Project creation and potential team selection.
- Gathering creation, invitation preview/copy, and attendance hour approval.
- Replacing a gathering's attendance updates totals without double-counting.

## Data boundaries

All people, projects, gatherings, activity, and metrics are fictional. Browser localStorage persists demo state under `roots-demo-v1`. There is no shared backend or user account database. The UI reports when local storage is unavailable. No invitations, applications, payments, or provider hour claims are submitted.

Program facts were checked October 24, 2026. Check the official linked provider terms before relying on an opportunity. No Guild partnership or eligibility is established. Potential, approved, and received funding are kept distinct.

The shared concept proposes future integration with Garden Steward's Vue/Strapi foundation, subject to maintainer confirmation. This prototype does not perform that integration.

## Verification

JavaScript syntax checks passed. Desktop and 390px mobile layouts were inspected in the browser. Tested saved opportunities across reload, project creation from an opportunity, potential team updates, skills search, and repeat attendance approval without duplicate hours. Reviewed keyboard focus, program conditions, and storage failure messaging.
