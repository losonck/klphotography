---
phase: 01-foundation-dns-pre-flight
plan: 02
subsystem: infra
tags: [dns, dns-cutover, wix, cloudflare, maxer-ie, iedr]

requires:
  - phase: n/a
    provides: First plan — depends on nothing
provides:
  - Frozen snapshot of klphotography.ie's authoritative DNS zone
  - Registrar identity confirmed (maxer.ie) with login access verified
  - Risk re-assessment: PITFALLS P3 (DNS cutover breaks email) effectively N/A for this domain
affects: [06-launch-cutover]

tech-stack:
  added: []
  patterns:
    - DNS snapshot tooling: PowerShell Resolve-DnsName (dig unavailable on Windows host); resolver pinned to 1.1.1.1
    - Pre-flight discipline: capture-before-change. `.planning/dns/CURRENT-ZONE.md` is treated as forensic — do not edit post-capture

key-files:
  created:
    - .planning/dns/CURRENT-ZONE.md
    - .planning/dns/registrar.md
  modified: []

key-decisions:
  - "Stay at maxer.ie — annual €19.50, transfer to another IEDR registrar saves €1–2/yr (not worth migration friction). .ie cannot move to Cloudflare Registrar."
  - "PITFALLS P3 (DNS cutover breaks email) downgraded from CRITICAL to LOW for this domain — no MX/SPF/DKIM/DMARC exist; email is at gmail.com (klphotography.ie@gmail.com is a Gmail mailbox, not a custom-domain mailbox)."
  - "Phase 6 nameserver change can DROP every existing record without breaking any live service — Wix is the only consumer of the existing records."

patterns-established:
  - "DNS findings live under .planning/dns/ (not under a phase folder), since cutover spans Phase 1 (snapshot) → Phase 5 (Resend DKIM additions) → Phase 6 (the actual swap)"

requirements-completed: [DNS-01, DNS-02]

duration: ~15min
completed: 2026-05-17
---

# Phase 1, Plan 2: DNS Pre-flight Summary

**klphotography.ie zone snapshotted (Wix NS + 3 Wix-IP A records, NO MX/TXT/SPF/DKIM/DMARC), registrar confirmed as maxer.ie, Phase 6 cutover de-risked**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-17T11:11:22Z (first dig query)
- **Completed:** 2026-05-17T11:35:00Z
- **Tasks:** 3 (2 auto + 1 user checkpoint)
- **Files modified:** 2 created

## Accomplishments

- Live DNS zone captured against 1.1.1.1 resolver and recorded in `.planning/dns/CURRENT-ZONE.md`
- Critical finding: **no MX, no SPF, no DKIM, no DMARC** — email is on gmail.com, not on klphotography.ie. The DNS cutover risk story is much simpler than expected
- Registrar identified: **maxer.ie**, login losonck@gmail.com, renewal 2027-11-12, €39/2yr
- Transfer-to-CF question answered: Cloudflare Registrar does not support .ie; transfer to another IEDR registrar would save €1–2/yr and is not worth the cost

## Task Commits

1. **DNS snapshot + registrar identity** — `6f63c6b` (docs(01): capture DNS pre-flight (zone snapshot + registrar identity))

> Both files landed in one commit because they are read together by Phase 6 (one without the other has no value).

## Files Created/Modified

- `.planning/dns/CURRENT-ZONE.md` — NS, SOA, A/AAAA/CNAME/MX/TXT/DMARC/DKIM probes; tables for records to DROP and records to PRESERVE; risk re-assessment of P3
- `.planning/dns/registrar.md` — maxer.ie identity, dashboard URL, renewal date, pre-Phase-6 access checklist

## Decisions Made

- See `key-decisions` in frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule: env-availability] `dig` unavailable on Windows host**
- **Found during:** Task 1 (first attempt at `dig @1.1.1.1 klphotography.ie ANY`)
- **Issue:** Bash environment on this Windows host has no `dig` binary.
- **Fix:** Switched all DNS probes to PowerShell `Resolve-DnsName ... -Server 1.1.1.1 -Type ... -DnsOnly`. Plan already listed this fallback for Windows-without-WSL.
- **Files modified:** None (operational change only)
- **Verification:** All record types resolved; results recorded in CURRENT-ZONE.md.
- **Committed in:** N/A

---

**Total deviations:** 1 auto-fixed (env tooling — fallback already documented in plan)
**Impact on plan:** None — Resolve-DnsName produced equivalent results.

## Issues Encountered

- `whois.weare.ie` rejected automated HTTP fetch (ECONNREFUSED, then a robot-detection response). The registrar identity came from the owner directly during the checkpoint, which is the more authoritative source anyway.

## User Setup Required

- Phase 6 will require active access to the maxer.ie dashboard (confirmed already working).
- No external account creation required for this plan.

## Next Phase Readiness

- Phase 6 cutover plan can now be written against a concrete record list. The dead-simple zone (no MX/TXT/DKIM) means Phase 6's risk surface is dominated by:
  1. Getting Cloudflare zone + nameservers right
  2. Setting the apex correctly (CNAME-flatten or A to CF Pages target)
  3. Wix subscription cancellation timing (cancel AFTER the cutover succeeds, not before)
- No blockers carried forward.

---
*Phase: 01-foundation-dns-pre-flight*
*Completed: 2026-05-17*
