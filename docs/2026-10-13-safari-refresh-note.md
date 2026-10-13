# WWDP: Safari refresh follow-up

Saved 2026-10-13 at Sabrina's request for the next review. Notes only; no site
code, production configuration, or deployment changed.

- [ ] Check WWDP in Safari after an ordinary reload and after reopening an
  existing tab. Confirm that current page assets and approved responses load
  together rather than leaving a visitor on stale content.
- [ ] Compare a normal reload with a reload bypassing cache if the discrepancy
  persists. Record the URL, Safari version, visible symptom, and network result
  before choosing a fix.
- [ ] If reproduced, distinguish cached HTML/CSS/JS, cached wall responses, an
  upstream read failure, and an old endpoint configuration. Preserve previously
  approved responses during a transient failure and avoid repeating submissions.

The request identifies Safari refresh as a follow-up; it does not establish a
specific cause or that a fix has already been verified. Existing checked-off
cache/endpoint requirements in `../REQUESTS.md` do not close this new check.
