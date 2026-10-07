# Data and deployment

## Chosen architecture

- **Public site:** Cloudflare Pages on the Free plan.
- **Domain:** `whywedophysics.com`; Bluehost remains the registrar only. DNS moves to Cloudflare, matching the other public sites.
- **Submission form:** the form on the site. Contributors are not redirected to Google Forms.
- **Private data:** a Google Sheet created and owned by `ai4theory@gmail.com`, reached through a Google Apps Script web app.
- **Contact:** Cloudflare Email Routing sends `contact@whywedophysics.com` to the same verified mailbox used by `contact@ai4theory.org`.

Production is connected to the public repository at `https://github.com/SabrinaPasterski/whywedophysics`. Cloudflare Pages serves both `https://whywedophysics.com` and `https://www.whywedophysics.com`; the Pages fallback remains `https://whywedophysics.pages.dev`.

No paid Cloudflare, Google, database, email, or droplet service is required. Do not select a paid Cloudflare plan, buy a Workers add-on, add a billing method, or move this site onto the PhysCode droplet.

## What is saved

The private spreadsheet contains three tabs:

### Responses

- submission time;
- display name;
- university or institution;
- career stage;
- optional PhD year;
- primary arXiv category;
- the 20–140 character declaration;
- optional city and country; entering the field places the response on the public map, while leaving it empty omits the response from the map;
- display consent and map permission;
- the permanent `WWDP-…` post ID;
- moderation status;
- map coordinates generated from an opted-in city.

### Hearts

- post ID;
- a random browser identifier;
- creation time.

### Flags

- post ID;
- a random browser identifier;
- selected flag reason;
- creation time and resolution state.

The form does **not** collect email addresses. The site does not store raw IP addresses. The private spreadsheet must never be published or shared publicly. Apps Script returns only approved responses with display consent. City and coordinates are returned only when the contributor filled the optional City field.

## Moderation

1. Open the private response Sheet while signed in as `ai4theory@gmail.com`.
2. Review a pending row.
3. Check **Approved** to publish it.
4. Uncheck **Approved** to remove it from the public wall.
5. Review community reports in **Flags** and mark resolved reports there.

Moderation is operational, not editorial: basic validity, spam, abuse, attribution, privacy, and consent.

## Google setup

1. Sign in to Apps Script as `ai4theory@gmail.com`.
2. Create a project named **Why We Do Physics** and paste `google/Code.gs` into `Code.gs`.
3. Run `setupSite()` once and authorize access. Its execution log gives the private Sheet URL.
   For an existing Sheet created before backups were added, run `setupBackups()` once as well.
4. Deploy as a web app: execute as the owner and allow **Anyone** to call it.
5. Put the `/exec` deployment URL in `dist/config.js` as `endpointUrl`.
6. Submit a test entry. It must stay off the wall until **Approved** is checked.

The Apps Script deployment URL is public by design, but it is not a credential. Never commit Google credentials or make the Sheet public.

## Cloudflare setup

1. Create the standalone GitHub repository and push this project.
2. In Cloudflare Pages, import the repository on the **Free** plan.
3. Use no framework and no build command; set the output directory to `dist` and the production branch to `main`.
4. Attach `whywedophysics.com` and `www.whywedophysics.com`.
5. At Bluehost, replace only the domain nameservers with the two nameservers Cloudflare assigns. Do not purchase or enable Bluehost hosting, email, SSL, or other add-ons.
6. Enable Cloudflare Email Routing for `contact@whywedophysics.com` using the already verified AI4Theory mailbox destination.

The live configuration uses Cloudflare's managed MX, DKIM, and SPF records. The catch-all rule remains disabled; only the explicit `contact@whywedophysics.com` route forwards to the verified AI4Theory destination.

Cloudflare supplies HTTPS automatically after DNS becomes active.

Normal development stays on `debug`. Run `./deploy.sh` only for an explicit production release; it merges `debug` into `main`, pushes `main`, and returns to `debug`.

## Backups and recovery

- Google Sheets version history protects ordinary edits to the live moderation file.
- `setupBackups()` creates a private **Why We Do Physics — backups** folder in the AI4Theory Google Drive, takes an immediate independent copy, and installs one daily backup trigger.
- The automated retention policy keeps 90 days of daily copies and first-of-month copies for two years. The job checks at most 1,000 files per run.
- Export the private Sheet as `.xlsx` before any structural change.
- To restore, open the chosen dated backup, make a copy, and update the Apps Script `SHEET_ID` property only after verifying its three tabs and headers.
- Apps Script source is versioned in this repository.
- The public site is reproducible from `dist/`.
- Unchecking **Approved** is the normal reversible way to remove a post from public view.
