# Why We Do Physics

Physics is changing. The reasons why we do it will shape what it becomes. This project records those reasons, one short declaration at a time. Add yours.

Live site: [whywedophysics.com](https://whywedophysics.com)

## Local development

```sh
python3 serve.py --port 8768
```

Open `http://localhost:8768`.

The preview server serves `dist/` and relays `/api` to the same Apps Script backend as Cloudflare, so approved declarations and backend interactions match production. Local submissions reach the real moderation queue. In production, a temporary backend outage can display the last successful approved response data cached by that browser.

## Submissions and moderation

The public form is part of the site. A private Google Sheet owned by `ai4theory@gmail.com` and Apps Script provide the moderation queue; a same-origin Cloudflare Pages Function relays browser requests to Apps Script so contributors are not sent to a Google Form.

1. Create a project at `https://script.google.com` in the account that should own the response data.
2. Paste `google/Code.gs` into the project.
3. Run `setupSite()` once and authorize it. The execution log contains the URL of the private moderation spreadsheet.
   If the Sheet already exists, run `setupBackups()` once to install the private daily Google Drive backup.
   Run `migrateModerationSheet()` after upgrading an existing response Sheet to the current headers.
4. Deploy as a Web app, executing as the owner, with access set to **Anyone**.
5. Put the deployment URL ending in `/exec` in `dist/config.js` as `endpointUrl`.
6. Submit a test response. It must remain absent from the public wall until **Approved** is checked in the private Responses sheet.

The live backend sends `ai4theory@gmail.com` a best-effort moderation alert after each successfully saved submission, with its ID, contributor, declaration, and a link to the private Sheet. Google Apps Script sends the email without a paid service. If email delivery fails, the response remains safely stored in the moderation queue. The Mail permission is approved for the production Apps Script deployment.

Moderation is for consent, privacy, spam, abuse, and basic form validity—not editorial selection. Unchecking **Approved** removes a response from the public wall.

The form accepts:

- name;
- required university or institution;
- searchable local institution suggestions that auto-fill an editable `City, Country` field for non-alumni while preserving write-in entries;
- required career stage and primary arXiv field;
- optional PhD year;
- a 20–140 character declaration;
- optional city and country; filling the field places the response on the map and leaving it empty omits the response from the map;
- required display consent.
- a copyable submission ID for follow-up;

No email address is collected. The private spreadsheet must not be published.

Google Sheets version history is supplemented by a private daily Drive copy: 90 daily backups plus first-of-month backups retained for two years. This uses the AI4Theory account's existing free Drive storage and does not require another service.

## Public behavior

- One featured declaration appears beside the question, with previous and next controls.
- Illustrative Sheet rows stay out of the featured carousel.
- All declaration cards have a fixed height.
- The map includes only opted-in city locations; pins are always visible and one card appears on hover, focus, or tap.
- arXiv fields and career stages appear as tags and filter chips.
- Search includes the declaration, contributor metadata, fields, stages, and locations.
- Hearts use a browser-local random identifier. The private Sheet keeps at most one heart row per response and browser identifier; the backend aggregates those rows into the public count and returns only that count plus whether the current browser has liked the response. Clearing site data or using another browser or device creates a new identifier. Flags go to the private moderation sheet.
- Each declaration has a stable `#story=` share link and uses the device share sheet when available.

## Hosting

`dist/` is the complete static site and deploys from this GitHub repository to Cloudflare Pages on the Free plan. Work happens on `debug`; `./deploy.sh` merges it into the production `main` branch, whose push triggers Cloudflare. Bluehost remains the domain registrar only. The site does not require the PhysCode droplet or a paid database. Cloudflare also supplies DNS, HTTPS, and email routing for `contact@whywedophysics.com`.

Production source: [github.com/SabrinaPasterski/whywedophysics](https://github.com/SabrinaPasterski/whywedophysics). Cloudflare serves the apex and `www` domains from the same Pages project; GitHub pushes to `main` deploy automatically.

The complete data model, moderation process, free-tier constraint, and deployment checklist are in [`docs/DATA_AND_DEPLOYMENT.md`](docs/DATA_AND_DEPLOYMENT.md).

Do not place credentials in this repository. `functions/api.js` contains only the public Apps Script web-app URL; it is not a credential.

## Files

- `dist/` — static public site
- `serve.py` — local static preview plus `/api` relay
- `google/Code.gs` — private Sheets moderation backend
- `REQUESTS.md` — current product and design requirements

The simplified world map is derived from Natural Earth 1:110m country data, which is public domain.
