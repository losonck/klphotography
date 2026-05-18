# Resend Domain Verification — Runbook (Phase 6 execution)

**Domain:** klphotography.ie
**Purpose:** Verify Resend can send email "from" `enquiries@klphotography.ie` (instead of `onboarding@resend.dev`) for production contact form enquiries.
**Timing:** Execute this runbook during **Phase 6** (after DNS-03 creates the Cloudflare DNS zone for klphotography.ie and the IEDR nameserver swap in DNS-04 / DNS-05 has propagated). **Do NOT execute in Phase 5** — the Cloudflare DNS zone for klphotography.ie does not exist yet, so there is nowhere to add the records.
**Owner of execution:** Whoever is running the Phase 6 cutover (currently the project owner).
**Requirement:** FORM-08 (Resend sending domain verified via SPF + DKIM records in Cloudflare DNS).

---

## Prerequisites (must be true before starting)

1. [ ] Resend account exists and is signed in (free tier, signed up via `klphotography.ie@gmail.com` per Phase 5 Plan 05-01).
2. [ ] Phase 6 DNS-03 has completed: the Cloudflare DNS zone for `klphotography.ie` exists in the CF dashboard.
3. [ ] Phase 6 DNS-04 / DNS-05 has completed: the IEDR registrar (maxer.ie) has been pointed at the Cloudflare nameservers and CF is authoritative for the zone. Verify with `Resolve-DnsName klphotography.ie -Server 1.1.1.1 -Type NS` — expect the Cloudflare `*.ns.cloudflare.com` pair, NOT `ns10.wixdns.net` / `ns11.wixdns.net`.
4. [ ] Phase 1 DNS snapshot is accessible at the canonical path: `.planning/dns/CURRENT-ZONE.md`. (Phase 1 deliberately placed the snapshot under `.planning/dns/` — outside any phase folder — because the cutover story spans Phase 1 → Phase 5 → Phase 6. See `.planning/phases/01-foundation-dns-pre-flight/01-02-SUMMARY.md` line 34 for the rationale.)
5. [ ] You have admin access to the Cloudflare dashboard for the `klphotography` Pages project (needed in Step 6 to update the `CONTACT_FROM_EMAIL` environment variable).
6. [ ] You have a test email address you can read (used in Step 7 to submit a real enquiry through production).

---

## Step 1: Add domain to Resend

1. Log in to https://resend.com.
2. In the sidebar, click **Domains** → **Add Domain**.
3. Enter domain name: `klphotography.ie`.
4. Region: select **EU (Ireland / Frankfurt)** if presented — lower latency for EU senders and aligned with GDPR data-residency expectations. If the region picker is not shown, accept the default.
5. Click **Add**.

Resend now displays the wizard with all DNS records that must be added. **Keep this browser tab open** — you will copy values from it in Step 2.

---

## Step 2: Read the records from Resend's wizard

Resend's wizard shows a table similar to the ones below. Copy the exact values from the dashboard; placeholders marked `[FROM-RESEND-WIZARD]` are filled in by you from the dashboard at the moment of execution. Do NOT invent or guess values — the account-specific DKIM hashes are unique per Resend account and only generated when the domain is added.

When you fill these in, replace the placeholder with the verbatim value and leave a short comment for posterity so this document becomes an as-built record (e.g. `# captured 2026-MM-DD from Resend wizard`).

### 2a. TXT — SPF

| Host | Type | Value | TTL |
|------|------|-------|-----|
| `klphotography.ie` (or `@`) | TXT | `[FROM-RESEND-WIZARD]` — expected pattern `v=spf1 include:_spf.resend.com ~all` | Auto / 3600 |

### 2b. CNAME — DKIM (typically 3 records)

| Host | Type | Value | TTL |
|------|------|-------|-----|
| `[FROM-RESEND-WIZARD]._domainkey.klphotography.ie` | CNAME | `[FROM-RESEND-WIZARD].resend.com` | Auto / 3600 |
| `[FROM-RESEND-WIZARD]._domainkey.klphotography.ie` | CNAME | `[FROM-RESEND-WIZARD].resend.com` | Auto / 3600 |
| `[FROM-RESEND-WIZARD]._domainkey.klphotography.ie` | CNAME | `[FROM-RESEND-WIZARD].resend.com` | Auto / 3600 |

The number of DKIM records may differ — **copy exactly what Resend shows**. If the wizard shows 2 or 4 records, use that count. Do not pad or truncate.

### 2c. MX — bounces (optional but recommended)

| Host | Type | Priority | Value | TTL |
|------|------|----------|-------|-----|
| `bounces.klphotography.ie` (subdomain — NOT root) | MX | `[FROM-RESEND-WIZARD]` (typically `10`) | `[FROM-RESEND-WIZARD]` (typical pattern `feedback-smtp.eu-west-1.amazonses.com` or similar) | Auto / 3600 |

**DO NOT add an MX record to the root domain `klphotography.ie`.** The root MX is currently empty (confirmed by the Phase 1 DNS snapshot at `.planning/dns/CURRENT-ZONE.md`, "MX" section: *"no MX records exist for klphotography.ie"*). The owner's email address `klphotography.ie@gmail.com` is a Gmail mailbox under the `gmail.com` domain — it does NOT depend on any MX record on `klphotography.ie`. The bounce MX MUST therefore go on the `bounces.` subdomain only, never on root.

---

## Step 3: SPF MERGE CHECK (critical — read before adding the TXT record)

Before adding the Resend SPF TXT record, check the Phase 1 DNS snapshot for any **existing** SPF record on `klphotography.ie`. Two SPF records on the same host produce a PermError and the receiving MTA ignores ALL of them — this is Pitfall 5 from Phase 5 RESEARCH §3 and it silently breaks every outbound email.

Run from the repository root (Windows PowerShell or Git Bash both work):
```
grep -in "spf1\|TXT" .planning/dns/CURRENT-ZONE.md
```

**Case A: No existing SPF record found in the snapshot.**
This is the expected case for `klphotography.ie` as of Phase 1 capture (2026-05-17). The snapshot states verbatim: *"No SPF, no DKIM, no DMARC currently published. Phase 5 (Resend domain verification) will introduce these from a clean slate — no merging required."* (`.planning/dns/CURRENT-ZONE.md` lines 73-74).
→ Add the Resend SPF TXT record exactly as shown by Resend's wizard. Continue to Step 4.

**Case B: Existing SPF record found** (would appear in the snapshot as a TXT record whose value starts `v=spf1`).
→ DO NOT add a second TXT SPF record. Multiple `v=spf1` TXT records on the same host cause a PermError and all SPF records get ignored.
→ Instead, **MERGE the includes into one record**. Example:
   - Existing: `v=spf1 include:_spf.google.com ~all`
   - Resend wants: `v=spf1 include:_spf.resend.com ~all`
   - Merged (this is what you add to CF DNS as the single SPF record): `v=spf1 include:_spf.google.com include:_spf.resend.com ~all`
→ Save the merged record in CF DNS as a TXT record on the root.

Sanity check the result after Step 4 propagates:
```
Resolve-DnsName klphotography.ie -Server 1.1.1.1 -Type TXT
```
→ Expect exactly ONE TXT value starting `v=spf1` and ending `~all`. If you see two `v=spf1` lines, delete one in the CF DNS dashboard and re-check.

---

## Step 4: Add records to Cloudflare DNS

1. Go to https://dash.cloudflare.com → select the `klphotography.ie` zone → **DNS** → **Records**.
2. For each record from Step 2 (after applying any SPF merge from Step 3):
   - Click **Add record**.
   - **Type**: TXT or CNAME or MX (per row from Step 2).
   - **Name**: as shown. Cloudflare auto-strips the `.klphotography.ie` suffix — paste just the host part (or `@` for root). For example, `resend._domainkey.klphotography.ie` is entered as `resend._domainkey`.
   - **Target / Content / Mail server**: as shown in Step 2. For CNAMEs the target must be entered verbatim (case-insensitive in DNS, but copy/paste avoids typos).
   - **Proxy status**: **DNS only** (gray cloud) — required for SPF, DKIM, and MX records. Cloudflare orange-cloud (proxied) silently breaks email authentication for these record types.
   - **TTL**: Auto.
   - Click **Save**.
3. Repeat for the SPF TXT, every DKIM CNAME, and the optional bounces MX.
4. Confirm every record appears in the zone records list before moving on.

---

## Step 5: Verify in Resend dashboard

1. Return to the Resend browser tab from Step 1 (**Domains** → `klphotography.ie`).
2. Click **Verify DNS Records**.
3. Wait for DNS propagation — typically 1–15 minutes through Cloudflare. The DNS standard allows up to 48 hours, but Cloudflare's authoritative edge is usually visible from public resolvers within minutes.
4. Refresh periodically. Each record row turns green when Resend's verifier can resolve it.
5. When all rows show green checkmarks, the domain status changes to **Verified**.

If any record stays red after ~30 minutes:
- Re-check the host + type + value for that row against Step 2 (CNAME content is the most common typo source).
- Re-check the **Proxy status** is **DNS only** (gray cloud), not Proxied (orange cloud).
- For SPF: `Resolve-DnsName klphotography.ie -Server 1.1.1.1 -Type TXT` — confirm exactly one `v=spf1` line.
- For DKIM CNAME: `Resolve-DnsName <selector>._domainkey.klphotography.ie -Server 1.1.1.1 -Type CNAME` — confirm it resolves to the `resend.com` target shown in the wizard.

---

## Step 6: Switch production `CONTACT_FROM_EMAIL`

Only execute this step **after** the domain shows **Verified** in the Resend dashboard.

1. Go to Cloudflare Dashboard → **Workers & Pages** → `klphotography` → **Settings** → **Variables and Secrets**.
2. Locate `CONTACT_FROM_EMAIL` under the **Production** environment.
3. Edit the value:
   - From: `KL Photography <onboarding@resend.dev>` (the Plan 05-01 dev/preview value)
   - To: `KL Photography <enquiries@klphotography.ie>` (production cutover value)
4. Click **Save**.
5. Cloudflare Pages will trigger a redeploy automatically when a Functions-scope environment variable changes. If it does not, trigger one manually:
   - Easiest: push an empty commit (`git commit --allow-empty -m "chore: trigger redeploy after Resend domain cutover" && git push`).
   - Or use the CF Pages **Deployments** tab → **Retry deployment** on the latest production build.
6. Wait for the redeploy to complete (visible in CF Pages → **Deployments** tab → status `Success` on the latest production build).

**Important:** Do NOT change Preview's `CONTACT_FROM_EMAIL`. Preview should keep `onboarding@resend.dev` so the owner can test against preview without consuming the verified-domain sender reputation.

---

## Step 7: Production round-trip verification

1. Open the production URL: https://klphotography.ie (or whichever apex URL Phase 6 has cut over to).
2. Submit a test enquiry through the real contact form. Use a test email address you control as the "couple's" email field.
3. Check the `klphotography.ie@gmail.com` inbox — the enquiry email should arrive within seconds.
4. Open the email in Gmail → click the three-dot menu (kebab) at the top-right of the message → **Show original**.
5. Verify the `From:` header reads `KL Photography <enquiries@klphotography.ie>` (NOT `onboarding@resend.dev`).
6. Verify the `Reply-To:` header matches the test couple email you entered in the form.
7. In the same "Show original" view, verify the authentication results show PASS:
   - `Authentication-Results: ... spf=pass`
   - `Authentication-Results: ... dkim=pass`
   - (DMARC will be `none` until DMARC is added — outside the scope of this runbook.)

If both SPF and DKIM show `pass` and the `From:` header is `enquiries@klphotography.ie`: domain verification + production cutover are complete. Mark **FORM-08** as Complete in `.planning/REQUIREMENTS.md`.

---

## Owner-confirm checklist (sign off at end of Phase 6 cutover)

- [ ] Resend dashboard shows `klphotography.ie` status = **Verified** (all rows green).
- [ ] CF DNS zone `klphotography.ie` contains: 1× SPF TXT (root), N× DKIM CNAMEs (`*._domainkey`), optionally 1× bounces MX on `bounces.klphotography.ie`.
- [ ] No proxied (orange cloud) records among the email-auth records.
- [ ] `Resolve-DnsName klphotography.ie -Server 1.1.1.1 -Type TXT` returns exactly ONE `v=spf1` value.
- [ ] CF Pages `CONTACT_FROM_EMAIL` Production = `KL Photography <enquiries@klphotography.ie>`.
- [ ] CF Pages `CONTACT_FROM_EMAIL` Preview = `KL Photography <onboarding@resend.dev>` (unchanged).
- [ ] CF Pages production deployment redeployed AFTER the env var change (deployment timestamp postdates the env var edit).
- [ ] Real test enquiry through production URL delivered to `klphotography.ie@gmail.com`.
- [ ] Gmail "Show original" confirms `From:` is `enquiries@klphotography.ie` AND `spf=pass` AND `dkim=pass`.
- [ ] FORM-08 ticked off in `.planning/REQUIREMENTS.md`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Resend shows "Domain not verified" after 1h | SPF conflict (duplicate `v=spf1` on root) or DNS not propagated | Re-check Step 3 SPF merge logic. Run `Resolve-DnsName klphotography.ie -Server 1.1.1.1 -Type TXT` from a public resolver. |
| DKIM record stays red in Resend | CNAME is Proxied (orange cloud) in Cloudflare | Switch the record to **DNS only** (gray cloud) in CF DNS dashboard. Wait a few minutes and re-verify. |
| DKIM record stays red in Resend | Wrong host or target (CNAME value mismatch) | Re-read the exact value from the Resend wizard; copy/paste — do not retype. Case matters in the host even though DNS is case-insensitive — match the wizard exactly. |
| Email arrives but `spf=fail` or `dkim=fail` in headers | Records point to wrong values, or SPF was duplicated | Re-execute Step 2 carefully. Run `Resolve-DnsName klphotography.ie -Type TXT` and check for a single `v=spf1` line. |
| Email arrives from `onboarding@resend.dev` not `enquiries@klphotography.ie` | `CONTACT_FROM_EMAIL` Production env var not updated, or CF Pages did not redeploy after the change | Re-do Step 6. Check the CF Pages **Deployments** tab — the latest production deployment must postdate the env var edit. Push an empty commit if needed. |
| Gmail inbox stops receiving the owner's existing mail | Root MX accidentally changed (should never happen if Step 2c was followed) | Restore root MX state from the Phase 1 DNS snapshot at `.planning/dns/CURRENT-ZONE.md` — that snapshot records "no MX records exist for klphotography.ie", i.e. root MX must remain empty. Delete any MX you accidentally added at the root. |
| Resend wizard shows MORE than 3 DKIM records | Resend changed its DKIM rollout, OR account has multiple selectors | Add all of them. The "typically 3" note in Step 2b is observational, not normative. |
| Verification still failing after 48h | Wrong CF DNS zone (you may have added records to a different domain) | Confirm the CF zone selected in Step 4 is `klphotography.ie` and that CF is authoritative for it (Prerequisite 3). |

---

## References

- Phase 5 RESEARCH §8 — `.planning/phases/05-contact-form-backend-gdpr/05-RESEARCH.md` (this runbook operationalises that section).
- **Phase 1 DNS snapshot — `.planning/dns/CURRENT-ZONE.md`** (used for SPF merge check in Step 3 and root-MX safety check in Step 2c). Note: Phase 1 deliberately placed the snapshot under `.planning/dns/` rather than under `.planning/phases/01-foundation-dns-pre-flight/` because the cutover story spans Phase 1 → Phase 5 → Phase 6 (rationale: `.planning/phases/01-foundation-dns-pre-flight/01-02-SUMMARY.md`).
- Phase 5 Plan 05-01 — `.planning/phases/05-contact-form-backend-gdpr/05-01-PLAN.md` (defines the `CONTACT_FROM_EMAIL` env var and the dev/preview value `onboarding@resend.dev`).
- Phase 6 ROADMAP entry — `.planning/ROADMAP.md` "Phase 6: Launch Cutover" (DNS-03, DNS-04, DNS-05). This runbook is consumed by Phase 6 DNS-03 follow-on work.
- Resend domains docs: https://resend.com/docs/dashboard/domains/introduction
- SPF spec on multiple records: https://datatracker.ietf.org/doc/html/rfc7208#section-3.2 (one TXT record per host).
- Cloudflare DNS proxying for email records: https://developers.cloudflare.com/dns/manage-dns-records/reference/proxied-dns-records/ (proxying breaks SPF/DKIM/MX — must be DNS only).
