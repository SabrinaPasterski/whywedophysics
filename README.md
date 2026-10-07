# Why We Do Physics

Physics is changing. The reasons why we do it will shape what it becomes. This project records those reasons, one short declaration at a time. Add yours.

## Preview

```sh
python3 -m http.server 8768 --directory dist
```

Open `http://localhost:8768`.

Without a configured endpoint, the site shows illustrative responses. Preview submissions remain in the current browser tab.

## Submissions and moderation

The public form is part of the site. A private Google Sheet owned by `ai4theory@gmail.com` and Apps Script provide the moderation queue; contributors are not sent to a Google Form.

1. Create a project at `https://script.google.com` in the account that should own the response data.
2. Paste `google/Code.gs` into the project.
3. Run `setupSite()` once and authorize it. The execution log contains the URL of the private moderation spreadsheet.
   If the Sheet already exists, run `setupBackups()` once to install the private daily Google Drive backup.
4. Deploy as a Web app, executing as the owner, with access set to **Anyone**.
5. Put the deployment URL ending in `/exec` in `dist/config.js` as `endpointUrl`.
6. Submit a test response. It must remain absent from the public wall until **Approved** is checked in the private Responses sheet.

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
- All declaration cards have a fixed height.
- The map includes only opted-in city locations.
- arXiv fields and career stages appear as tags and filter chips.
- Search includes the declaration, contributor metadata, fields, stages, and locations.
- Hearts use a browser-local anonymous identifier. Flags go to the private moderation sheet.
- Each declaration has a stable `#story=` share link and uses the device share sheet when available.

## Hosting

`dist/` is the complete static site and deploys from this GitHub repository to Cloudflare Pages on the Free plan. Work happens on `debug`; `./deploy.sh` merges it into the production `main` branch, whose push triggers Cloudflare. Bluehost remains the domain registrar only. The site does not require the PhysCode droplet or a paid database. Cloudflare also supplies DNS, HTTPS, and email routing for `contact@whywedophysics.com`.

The complete data model, moderation process, free-tier constraint, and deployment checklist are in [`docs/DATA_AND_DEPLOYMENT.md`](docs/DATA_AND_DEPLOYMENT.md).

Do not place credentials in this repository. `dist/config.js` contains only the public Apps Script web-app URL.

## Files

- `dist/` — static public site
- `google/Code.gs` — private Sheets moderation backend
- `REQUESTS.md` — current product and design requirements

The simplified world map is derived from Natural Earth 1:110m country data, which is public domain.
