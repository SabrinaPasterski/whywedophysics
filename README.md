# Why We Do Physics

A bottom-up collection of short declarations from people who do physics.

## Preview

```sh
python3 -m http.server 8768 --directory dist
```

Open `http://localhost:8768`.

Without a configured endpoint, the site shows illustrative responses. Preview submissions remain in the current browser tab.

## Submissions and moderation

The public form is part of the site. Google Sheets and Apps Script provide the private submission queue; contributors are not sent to a Google Form.

1. Create a project at `https://script.google.com` in the account that should own the response data.
2. Paste `google/Code.gs` into the project.
3. Run `setupSite()` once and authorize it. The execution log contains the URL of the private moderation spreadsheet.
4. Deploy as a Web app, executing as the owner, with access set to **Anyone**.
5. Put the deployment URL ending in `/exec` in `dist/config.js` as `endpointUrl`.
6. Submit a test response. It must remain absent from the public wall until **Approved** is checked in the private Responses sheet.

Moderation is for consent, privacy, spam, abuse, and basic form validity—not editorial selection. Unchecking **Approved** removes a response from the public wall.

The form accepts:

- name;
- optional institution or affiliation;
- optional career stage and PhD year;
- optional primary arXiv field and arXiv identifier;
- a 20–140 character declaration;
- optional city and country, published only when map permission is checked;
- required display consent.

No email address is collected. The private spreadsheet must not be published.

## Public behavior

- One featured declaration appears beside the question, with previous and next controls.
- All declaration cards have a fixed height.
- The map includes only opted-in city locations.
- arXiv fields and career stages appear as tags and filter chips.
- Search includes the declaration, contributor metadata, fields, stages, and locations.
- Hearts use a browser-local anonymous identifier. Flags go to the private moderation sheet.
- Each declaration has a stable `#story=` share link and uses the device share sheet when available.

## Hosting

`dist/` is the complete static site. Upload its contents to the Bluehost document root for the domain, or deploy the same directory elsewhere and point Bluehost DNS to it. The site contact is `contact@whywedophysics.com`; configure that address to forward to `contact@ai4theory.org`.

Do not place credentials in this repository. `dist/config.js` contains only the public Apps Script web-app URL.

## Files

- `dist/` — static public site
- `google/Code.gs` — private Sheets moderation backend
- `REQUESTS.md` — current product and design requirements

The simplified world map is derived from Natural Earth 1:110m country data, which is public domain.
