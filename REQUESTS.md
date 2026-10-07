# Why We Do Physics — request ledger

## Product

- [x] Bottom-up community portrait; open submission rather than editorial selection.
- [x] Native on-site form with a private Google Sheets moderation queue.
- [x] The moderation Sheet keeps real responses at the top and puts the `Approved` checkbox in column A.
- [x] New moderation entries and the public wall both default to newest first.
- [x] Deploy the Apps Script update that emails `ai4theory@gmail.com` when a new submission is saved; a mail failure must not lose or reject the submission.
- [x] Migrate production to the 17-column schema, keep timestamps in the compact original format, remove the three `C0DE` test rows, and preserve the approved Sabrina and Joseph submissions.
- [x] Moderation limited to consent, privacy, spam, abuse, and basic validity.
- [x] Declarations limited to 140 characters, with a 20-character minimum.
- [x] Optional city appears on the map only with explicit permission.
- [x] University / institution is required and displayed on each submitted response.
- [x] Career stage and primary arXiv field are required so every response can be filtered; PhD year remains optional.
- [x] Career stage row is undergrad, master’s, PhD, postdoc, faculty, alumni.
- [x] Per-declaration sharing, hearts, and private flags.
- [x] Contact address shown as `contact@whywedophysics.com`.
- [x] Configure that address through Cloudflare Email Routing to the AI4Theory mailbox destination.
- [x] Connect the production domain and deploy through Cloudflare Pages; keep Bluehost as registrar only.

## Interface

- [x] Compact header: blue `WHY WE DO PHYSICS` over lowercase `a community portrait`.
- [x] Keep the blue φ favicon as the small `why-phy` mark; do not replace it with WiPhy branding.
- [x] Use a larger blue φ-and-stop mark within the square: position the φ slightly lower, shorten its stem, then use a compact flat-sided extension after a gap equal to the extension's height so it can also read as a question. The lower extension is a 4×4 square matching the φ stem width, with an exact 4-unit gap. Verified in the local full-size SVG preview.
- [x] Both brand lines have the same rendered width using interletter spacing in Safari and Chrome.
- [x] Brand spacing is CSS-only and stable on first paint; `a community portrait` does not wobble after load or fall back to word-only justification in Safari.
- [x] Mobile keeps the full world map in view without a horizontal scrollbar, with the header, hero, cards, search, and footer fitting a 390px viewport.
- [x] Header and footer rules have the same inset width.
- [x] Hero question is vertically centered beside one fixed-height rotating card.
- [x] Illustrative rows are excluded from the rotating top carousel.
- [x] Previous and next arrows sit outside the featured card.
- [x] Featured-card arrows are grey and disabled when there is no previous or next real response.
- [x] No print control, repeated title, map title, separator, or explanatory map copy.
- [x] Answer colors are split roughly evenly between black and PaperView blue `#0056b3`.
- [x] Cards are fixed height.
- [x] Declaration text is top-aligned; contributor, institution, and location occupy separate lines above the bottom action row.
- [x] Declaration text sits slightly lower beneath the date and tag row without changing card height.
- [x] Optional PhD year appears beside the contributor name as `Name, PhD YYYY`; it is smaller and regular weight, and only the name is bold.
- [x] arXiv fields and career stages are lowercase, compact tags.
- [x] Card tags use a white fill rather than a grey fill.
- [x] Filter chips use separate arXiv-field and career-stage rows beside the response and country tally.
- [x] Search offers `RECENT | POPULAR`; popular sorts by hearts.
- [x] Each page shows exactly two rows: 6 cards on desktop, 8 on wide screens, 4 on tablet, and 2 on mobile; compact `PREVIOUS  n/N  NEXT` controls sit lower right and reserve no space when hidden.
- [x] There is no local preview response mode or embedded preview content.
- [x] Mobile layout keeps the compact header, fixed cards, tags, filters, map, and pager usable without extra whitespace.
- [x] Example map cards occupy non-overlapping positions.
- [x] Map cards always use PaperView blue text and are assigned to longitude-ordered lanes with non-crossing connectors.
- [x] Map pins are always visible; one declaration card appears on hover/focus or tap, and clicking the map background clears it.
- [x] Every mapped submission has its own dot; the declaration in the upper-right featured card has the larger dot.
- [x] One row shows common arXiv categories; `+` expands a second arXiv row containing the remaining categories, including `math-ph`.
- [x] The undergrad/master’s/PhD/postdoc/faculty/alumni row sits below the arXiv rows.
- [x] A compact `CLEAR` control appears only while a map filter is selected, at the left of the career-stage row.
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
- [x] A temporarily unreachable wall silently uses the last successful approved response data; sample content is not hardcoded in the browser.
- [x] Production HTML, CSS, and JavaScript do not mix stale cached versions after a deployment.
- [x] The production endpoint configuration overrides any legacy browser-local backend URL so an existing visitor cannot stay pinned to an old Apps Script deployment.
- [x] Invalid legacy browser visitor IDs are regenerated so the backend cannot reject a returning visitor while the page silently keeps stale cached responses.
- [x] Relay wall and submission requests through a same-origin Cloudflare Pages Function so Chrome cannot reject the Apps Script response as a third-party script.
- [x] Store illustrative responses as normal moderated Sheet rows so they can be approved, unapproved, or removed like any other entry.

## Repository and operations

- [x] Create a standalone GitHub repository and place its checkout at `Research/WhyWeDoPhysics`.
- [x] Configure the Apps Script endpoint and verify a moderated live submission.
- [x] Verify the production apex and `www` domains, HTTPS, live wall endpoint, declaration sharing, and map opt-in behavior.
- [ ] Verify end-to-end delivery from `contact@whywedophysics.com` to the AI4Theory mailbox.
- [x] Document the private data model, moderation, backups, free-tier constraint, and Cloudflare deployment path.
