# Why We Do Physics — request ledger

## Product

- [x] Bottom-up community portrait; open submission rather than editorial selection.
- [x] Native on-site form with a private Google Sheets moderation queue.
- [x] Moderation limited to consent, privacy, spam, abuse, and basic validity.
- [x] Declarations limited to 140 characters, with a 20-character minimum.
- [x] Optional city appears on the map only with explicit permission.
- [x] University / institution is required and displayed on each submitted response.
- [x] Career stage and primary arXiv field are required so every response can be filtered; PhD year remains optional.
- [x] Career stage row is undergrad, master’s, PhD, postdoc, faculty, alumni.
- [x] Per-declaration sharing, hearts, and private flags.
- [x] Contact address shown as `contact@whywedophysics.com`.
- [ ] Configure that address through Cloudflare Email Routing to the AI4Theory mailbox destination.
- [ ] Connect the production domain and deploy through Cloudflare Pages; keep Bluehost as registrar only.

## Interface

- [x] Compact header: blue `WHY WE DO PHYSICS` over lowercase `a community portrait`.
- [x] Both brand lines have the same rendered width using interletter spacing.
- [x] Header and footer rules have the same inset width.
- [x] Hero question is vertically centered beside one fixed-height rotating card.
- [x] Previous and next arrows sit outside the featured card.
- [x] No print control, repeated title, map title, separator, or explanatory map copy.
- [x] Answer colors are split roughly evenly between black and PaperView blue `#0056b3`.
- [x] Cards are fixed height.
- [x] Declaration text is top-aligned; contributor, institution, and location occupy separate lines above the bottom action row.
- [x] arXiv fields and career stages are lowercase, compact tags.
- [x] Card tags use a white fill rather than a grey fill.
- [x] Filter chips use separate arXiv-field and career-stage rows beside the response and country tally.
- [x] Search offers `RECENT | POPULAR`; popular sorts by hearts.
- [x] Six cards per page; compact `PREVIOUS  n/N  NEXT` controls sit lower right and reserve no space when hidden.
- [x] Preview data includes a seventh card so `NEXT` is visible after the first six.
- [x] Mobile layout keeps the compact header, fixed cards, tags, filters, map, and pager usable without extra whitespace.
- [x] Example map cards occupy non-overlapping positions.
- [x] Map cards always use PaperView blue text and are assigned to longitude-ordered lanes with non-crossing connectors.
- [x] One row shows common arXiv categories; `+` expands a second arXiv row containing the remaining categories, including `math-ph`.
- [x] The undergrad/master’s/PhD/postdoc/faculty/alumni row sits below the arXiv rows.
- [x] A compact `CLEAR` control appears only while a map filter is selected.
- [x] arXiv and career-stage chips support multiple simultaneous selections.
- [x] Links have no underlines; sharing uses an icon.
- [x] Header omits redundant site sharing; card icons share individual declarations.
- [x] Submit form leads with the 140-character declaration and groups metadata into compact rows.
- [x] The optional editable City field remains; a filled `City, Country` value appears on the map and an empty field does not.
- [x] There is no separate map-permission checkbox; entering a City value is the map opt-in.
- [x] Institution is a searchable local list with write-in support and can auto-fill City for non-alumni.
- [x] Alumni do not auto-fill City but may enter it manually.
- [x] The form labels the required career-level selector `Career Stage`.
- [x] Optional PhD year uses the compact `YYYY` placeholder.
- [x] Name field keeps the `Name` label and uses `As it will appear` as its placeholder.
- [x] Submit form has no draft-preview explanatory line.
- [x] Submission confirmation directs questions and comments to `contact@whywedophysics.com`.
- [x] Submission confirmation keeps the copyable ID but omits the `Reference ID` label.
- [x] The confirmation shows the optional ID and COPY control without instructing people to save it.
- [x] Confirmation explains the identifier minimally: “This ID identifies your post.”
- [x] Identifier explanation and contact sentence share one paragraph and one font in the narrower confirmation dialog.
- [x] Post identifiers use the `WWDP-` prefix.
- [x] Submit form states: “Submissions subject to moderation and community flagging.”
- [x] Desktop Submit dialog fits without an unnecessary internal scrollbar; mobile retains scrolling only when the viewport requires it.
- [x] About mission: “Physics is changing. The reasons why we do it will shape what it becomes. This project records those reasons, one short declaration at a time. Add yours.”
- [x] The About call to action stays on its own line and uses the same font and grey color as the body; the heading remains unchanged.
- [x] A new or temporarily unreachable wall falls back silently to the illustrative responses; it never displays connection errors or “Waiting for the first response.”

## Repository and operations

- [ ] Create a standalone GitHub repository and place its checkout at `Research/WhyWeDoPhysics`.
- [ ] Configure the Apps Script endpoint and verify a moderated live submission.
- [ ] Verify the production domain, HTTPS, sharing, map permission, and contact forwarding.
- [x] Document the private data model, moderation, backups, free-tier constraint, and Cloudflare deployment path.
