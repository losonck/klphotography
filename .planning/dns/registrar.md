# Domain Registrar — klphotography.ie

**Registrar:** maxer.ie
**IEDR-accredited:** Yes (registrar of record per owner; verify via https://www.iedr.ie/whois-search/ before cutover)
**Login email:** losonck@gmail.com
**Dashboard URL:** https://www.maxer.ie/ (sign in → My Account → domain management)
**Login access:** Confirmed by owner during Phase 1
**Current renewal date:** 2027-11-12 (interpreted from "12/11/2027" in DD/MM/YYYY Irish format)
**Current cost:** €39 per 2 years (~€19.50 / year)

## Why this matters

- Cloudflare Registrar does NOT support .ie. Registration must stay at an IEDR-accredited registrar.
- maxer.ie holds the registration and the authority to change nameservers.
- Phase 6 LAUNCH-02 will switch nameservers from `ns10.wixdns.net` / `ns11.wixdns.net` (see CURRENT-ZONE.md) to the pair Cloudflare assigns when the zone is created.
- Losing access to the maxer.ie account would block the cutover.

## Should we transfer to a different registrar?

Considered, rejected for v1:

| Registrar | Approx .ie price/yr | Notes |
|-----------|---------------------|-------|
| maxer.ie (current) | ~€19.50 | Already there, no migration friction |
| Blacknight | ~€20 | Largest .ie registrar |
| Letshost | ~€18 | Slightly cheaper |
| Cloudflare Registrar | N/A | Does NOT support .ie |

Annual savings of transferring ≈ €1–2. Not worth the auth-code dance, transfer lock, and 5–7 day transfer window. **Stay at maxer.ie.**

## Pre-Phase 6 checklist

- [ ] Login at https://www.maxer.ie/ still works on day of cutover
- [ ] 2FA backup codes (if 2FA enabled on the maxer.ie account) accessible
- [ ] Renewal paid for at least 60 days past planned cutover date — current paid through 2027-11-12, so plenty of headroom
- [ ] Locate the "Nameservers" / "DNS" panel in the maxer.ie dashboard ahead of cutover so the actual change is fast (minutes, not hours)

## Notes

- maxer.ie also offers hosting / email — currently NOT used for this domain (Wix hosts the site; Gmail handles `klphotography.ie@gmail.com` which is a gmail.com mailbox, not a custom-domain mailbox). Nothing on maxer.ie infrastructure will be affected by the cutover.
- If the maxer.ie dashboard does not allow setting arbitrary nameservers (some smaller registrars require a support ticket), flag that during Phase 6 prep — would add a 24–48h lead time.
