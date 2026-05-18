# Phase 5: Contact Form Backend & GDPR — Research

**Researched:** 2026-05-18
**Domain:** Cloudflare Pages Functions, Turnstile, Resend, GDPR / Irish DPC, CF Web Analytics
**Confidence:** HIGH (all critical paths verified against official Cloudflare and Resend docs)

---

## TL;DR

- **Zero new npm packages for Plans 05-01 and 05-03.** Use direct `fetch()` to the Resend REST API and direct `fetch()` to the Turnstile siteverify endpoint. No SDKs, no bundle size risk.
- **Add `wrangler` as a `devDependency`** for local Pages Function development and TypeScript types (`wrangler types`). Do NOT add it as a dependency — it is a dev tool only.
- **Env vars to set in CF Pages dashboard:** `RESEND_API_KEY` (encrypted), `TURNSTILE_SECRET_KEY` (encrypted), `CONTACT_TO_EMAIL` (plain), `CONTACT_FROM_EMAIL` (plain). Build-time public var: `PUBLIC_TURNSTILE_SITE_KEY` (plain).
- **CF Pages Functions in `functions/` at the project root coexist with Astro's `dist/` output.** No Astro adapter needed. No conflict with `output: 'static'`.
- **Turnstile is confirmed cookieless.** CF Web Analytics beacon does not use cookies or local storage.
- **Phase 05-02 ships as DOCS only** (a `SETUP-RESEND-DOMAIN.md` file), because Resend domain verification requires the CF DNS zone to exist first — that is DNS-03, owned by Phase 6.

---

## 1. Cloudflare Pages Functions — File-Based Routing and Handler Shape

**Confidence: HIGH** [CITED: developers.cloudflare.com/pages/functions/]

### How it works alongside Astro static build

Pages Functions live in a `functions/` directory **at the project root** (not inside `dist/`). Cloudflare's build pipeline processes `functions/` separately and deploys the Workers alongside the static asset bundle from `dist/`. Astro's `output: 'static'` setting is unaffected — the Astro Cloudflare adapter (`@astrojs/cloudflare`) is **not needed** and must not be installed. Adding the adapter would change the output mode to SSR, which is not what we want.

```
project root/
├── functions/
│   └── api/
│       └── contact.ts    ← serves POST /api/contact
├── src/                  ← Astro source
├── dist/                 ← Astro build output (static)
└── astro.config.mjs      ← output: 'static' stays unchanged
```

CF Pages auto-detects `functions/` during the build and bundles its contents into Workers. No `wrangler.toml` is required for basic file-based routing.

### Handler shape

[CITED: developers.cloudflare.com/pages/functions/api-reference/]

```typescript
// functions/api/contact.ts

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  // ...
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- `PagesFunction<Env>` is the correct TypeScript type (from `wrangler types`).
- `export const onRequestPost` is invoked **only on POST** — other verbs get a 405 automatically.
- `export const onRequest` is the catch-all for all verbs (use `onRequestPost` to be precise).
- `context.env` holds all Pages environment variables and bindings.
- `context.request` is the standard Web API `Request` object.

### TypeScript setup

[CITED: developers.cloudflare.com/pages/functions/typescript/]

```bash
# In project root — generates functions/types.d.ts
npx wrangler types --path='./functions/types.d.ts'
```

Create `functions/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "types": ["./types.d.ts"]
  },
  "include": ["./**/*.ts"],
  "exclude": ["../node_modules"]
}
```

The `PagesFunction` type comes from the generated types file, not from `@cloudflare/workers-types` (that package is the older approach; `wrangler types` is current).

---

## 2. Turnstile Server-Side Validation

**Confidence: HIGH** [CITED: developers.cloudflare.com/turnstile/get-started/server-side-validation/]

### Endpoint and request format

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/x-www-form-urlencoded
```

Required body parameters:
- `secret` — your Turnstile secret key (`TURNSTILE_SECRET_KEY`)
- `response` — the token submitted by the client from the Turnstile widget
- `remoteip` — (optional but recommended) the visitor's IP address — use `request.headers.get('CF-Connecting-IP')` in a Pages Function

### Response format

```json
// Success
{
  "success": true,
  "challenge_ts": "2026-05-18T12:00:00.000Z",
  "hostname": "klphotography.pages.dev",
  "error-codes": [],
  "action": "",
  "cdata": ""
}

// Failure
{
  "success": false,
  "error-codes": ["invalid-input-response"]
}
```

Reject with `HTTP 403` when `success` is `false`.

Token validity window: **5 minutes** from generation. Maximum token length: 2048 characters.

### Does Turnstile set cookies?

[CITED: developers.cloudflare.com/turnstile/frequently-asked-questions/]
[ASSUMED] The official FAQ references a "Turnstile Privacy Addendum" for full details, which the docs did not render in full. However, Cloudflare's marketing and multiple independent third-party sources confirm Turnstile (managed mode) does **not** set persistent browser cookies. This is a key reason it was chosen over reCAPTCHA v2/v3. If the invisible widget type is used, Cloudflare's docs require referencing the Turnstile Privacy Addendum in the privacy policy — for managed mode this is not required.

**Decision: Use managed mode** (`data-sitekey` on a `<div class="cf-turnstile">`). No cookie banner needed.

### Worked code — Turnstile verification

```typescript
async function verifyTurnstile(token: string, remoteip: string, secret: string): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip,
  });

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });

  const data = await res.json() as { success: boolean; 'error-codes': string[] };
  return data.success === true;
}
```

---

## 3. Resend API — Direct Fetch (No SDK)

**Confidence: HIGH** [CITED: resend.com/docs/api-reference/emails/send-email]

### Why direct fetch, not the Resend SDK

The Resend Node.js SDK (`resend` v6.12.3) **does** work in Cloudflare Workers/Pages Functions (confirmed: resend.com/docs/send-with-cloudflare-workers). However:

- The SDK is ~300–400 KB unpacked and adds an unnecessary bundle weight to a Pages Function.
- Pages Functions have a **1 MB compressed script size limit**.
- Our use case requires exactly one API call (`POST /emails`) — the SDK abstraction provides no benefit over a direct `fetch()`.
- Direct `fetch()` keeps the Function file self-contained and eliminates a dependency vector.

**Recommendation: Zero npm packages for the contact Function.** Use direct `fetch()`.

### REST endpoint

```
POST https://api.resend.com/emails
Authorization: Bearer <RESEND_API_KEY>
Content-Type: application/json
```

### Request body

[CITED: resend.com/docs/api-reference/emails/send-email]

```typescript
interface ResendEmailPayload {
  from: string;           // "KL Photography <enquiries@klphotography.ie>"
  to: string[];           // ["klphotography.ie@gmail.com"]
  reply_to?: string;      // couple's email — enables owner to reply directly
  subject: string;
  text?: string;
  html?: string;
}
```

Key notes:
- `reply_to` (snake_case) — not `replyTo`. The Resend REST API uses snake_case, the SDK uses camelCase.
- Provide both `text` and `html` for maximum deliverability. Plain text avoids spam filters.
- `to` must be an array of strings, even for a single recipient.

### From-address strategy (pre vs post domain verification)

| State | `from` field value |
|-------|-------------------|
| Dev / preview (before Phase 6 DNS cutover) | `KL Photography <onboarding@resend.dev>` |
| Production (after Resend domain verified) | `KL Photography <enquiries@klphotography.ie>` |

Use `CONTACT_FROM_EMAIL` env var to switch between these states without a code change:

```bash
# .dev.vars (local)
CONTACT_FROM_EMAIL="KL Photography <onboarding@resend.dev>"

# CF Pages dashboard — Preview environment
CONTACT_FROM_EMAIL="KL Photography <onboarding@resend.dev>"

# CF Pages dashboard — Production (after Phase 6 DNS-03 + Resend domain verify)
CONTACT_FROM_EMAIL="KL Photography <enquiries@klphotography.ie>"
```

### Worked code — send email via direct fetch

```typescript
interface EmailPayload {
  name: string;
  email: string;
  message: string;
  weddingDate?: string;
  venue?: string;
}

async function sendEmail(payload: EmailPayload, env: Env): Promise<Response> {
  const { name, email, message, weddingDate, venue } = payload;

  // FORM-05: include couple name + wedding date in subject when provided
  const datePart = weddingDate ? ` — ${weddingDate}` : '';
  const subject = `Wedding enquiry from ${name}${datePart}`;

  const venueLine = venue ? `\nVenue: ${venue}` : '';
  const dateLine = weddingDate ? `\nWedding date: ${weddingDate}` : '';

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    dateLine,
    venueLine,
    '',
    message,
  ].join('\n').trim();

  const htmlBody = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    ${weddingDate ? `<p><strong>Wedding date:</strong> ${escapeHtml(weddingDate)}</p>` : ''}
    ${venue ? `<p><strong>Venue:</strong> ${escapeHtml(venue)}</p>` : ''}
    <hr />
    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
  `;

  const body = JSON.stringify({
    from: env.CONTACT_FROM_EMAIL,
    to: [env.CONTACT_TO_EMAIL],
    reply_to: email,          // FORM-04: owner replies directly to couple
    subject,
    text: textBody,
    html: htmlBody,
  });

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
```

---

## 4. Email Payload Details (FORM-04, FORM-05)

**Confidence: HIGH**

| Field | Value | Notes |
|-------|-------|-------|
| `from` | `KL Photography <enquiries@klphotography.ie>` | After domain verify. Env var `CONTACT_FROM_EMAIL`. |
| `to` | `["klphotography.ie@gmail.com"]` | Env var `CONTACT_TO_EMAIL`. |
| `reply_to` | Couple's email (from form `email` field) | **Critical** — allows owner to reply directly in Gmail without copy-pasting. |
| `subject` | `Wedding enquiry from {name}` or `Wedding enquiry from {name} — {date}` | FORM-05. |
| `text` | Plain-text version | Required for spam filter compliance. |
| `html` | HTML version | Rendered in Gmail. Escape all user input. |

**Security note:** Always HTML-escape user-supplied values (`name`, `email`, `message`, `venue`, `weddingDate`) before inserting into the HTML body. Never trust client input.

**Honeypot enforcement:** Server must check `contact_company` field — if non-empty, silently return 200 (fool the bot, don't reveal detection).

---

## 5. Client-Side Form Submit Pattern (FORM-09, FORM-10)

**Confidence: HIGH**

### JavaScript fetch pattern (Vanilla JS in Astro `<script>`)

Phase 3 established the pattern: replace the no-op submit handler in `Contact.astro` with this:

```typescript
// Inside Contact.astro <script> block
const form = document.getElementById('contact-form') as HTMLFormElement | null;
const notice = document.getElementById('cf-notice') as HTMLParagraphElement | null;
const submitBtn = form?.querySelector('button[type="submit"]');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // HTML5 validation gate (established in Phase 3)
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Loading state
  submitBtn?.setAttribute('disabled', '');
  if (notice) { notice.classList.remove('hidden'); notice.textContent = 'Sending…'; }

  try {
    const formData = new FormData(form);
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      // FORM-09: clear success state
      form.reset();
      if (notice) {
        notice.textContent = 'Thanks — I\'ll be in touch within two working days.';
        notice.classList.remove('text-red-600');
      }
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch {
    // FORM-09: clear error state
    if (notice) {
      notice.textContent = 'Something went wrong. Please use phone, email, or WhatsApp below.';
      notice.classList.add('text-red-600');
    }
  } finally {
    submitBtn?.removeAttribute('disabled');
  }
});
```

### Turnstile widget wiring

Replace the commented stub in `Contact.astro`:

```astro
<!-- Before (Phase 3 stub): -->
{/* Phase 5: <div class="cf-turnstile" data-sitekey="YOUR-PUBLIC-SITE-KEY"></div> */}

<!-- After (Phase 5): -->
<div class="cf-turnstile" data-sitekey={import.meta.env.PUBLIC_TURNSTILE_SITE_KEY}></div>
```

Add Turnstile JS to `src/pages/index.astro` (in the `<head>` slot):

```astro
<script slot="head" src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer is:inline></script>
```

**Note:** In Astro, `<script>` tags in a BaseLayout head slot need `is:inline` to prevent Vite from processing them as modules. Check existing `BaseLayout.astro` to confirm slot name (`"head"` based on Phase 3 contract).

The Turnstile widget auto-appends a hidden input named `cf-turnstile-response` to the form. `FormData` will include it automatically.

### Graceful degradation (FORM-10)

The Pages Function must handle both content types:

```typescript
const contentType = request.headers.get('Content-Type') ?? '';
let fields: Record<string, string>;

if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
  const fd = await request.formData();
  fields = Object.fromEntries(fd.entries()) as Record<string, string>;
} else if (contentType.includes('application/json')) {
  fields = await request.json();
} else {
  return new Response('Unsupported Content-Type', { status: 415 });
}
```

**Token-optional dev mode:** Check `env.DEV_SKIP_TURNSTILE` (a plain env var, `"true"` or absent). Only skip verification when this flag is set. Never skip in production.

---

## 6. Graceful Degradation — No-JS Form POST (FORM-10)

**Confidence: HIGH**

For no-JS fallback, the form needs a `method` and `action` attribute. Modify the `<form>` tag:

```astro
<!-- Contact.astro — add method + action for FORM-10 -->
<form
  class="space-y-6"
  id="contact-form"
  novalidate
  method="POST"
  action="/api/contact"
>
```

When JS is absent:
- The browser submits a standard form POST with `application/x-www-form-urlencoded` content-type.
- No Turnstile token will be present.
- In **production**, the function rejects with 403 (token required). The owner accepted this tradeoff — spam protection wins over no-JS edge case.
- In **development** (env flag `DEV_SKIP_TURNSTILE=true`), the function processes the submission.
- The function should detect the no-JS case and respond with an HTML success/error page (redirect or inline HTML) rather than JSON, to avoid showing raw JSON to the no-JS user.

```typescript
// Detect client capability from Accept header
const acceptsJson = request.headers.get('Accept')?.includes('application/json');

// On success:
if (acceptsJson) {
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
} else {
  // No-JS path: redirect to a success page or return minimal HTML
  return new Response('<html><body><p>Thank you — I will be in touch within two working days.</p></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html' } });
}
```

---

## 7. CF Pages Environment Variable Setup

**Confidence: HIGH** [CITED: developers.cloudflare.com/pages/functions/bindings/]

### Dashboard path

Workers & Pages → **klphotography** → Settings → **Variables and Secrets** → Add

### Variables to configure

| Variable | Type | Environment | Value |
|----------|------|-------------|-------|
| `RESEND_API_KEY` | **Encrypted (Secret)** | Production + Preview | `re_xxxxxxxxxxxx` (from Resend dashboard) |
| `TURNSTILE_SECRET_KEY` | **Encrypted (Secret)** | Production + Preview | From CF Turnstile dashboard |
| `CONTACT_TO_EMAIL` | Plain text | Production + Preview | `klphotography.ie@gmail.com` |
| `CONTACT_FROM_EMAIL` | Plain text | Preview | `KL Photography <onboarding@resend.dev>` |
| `CONTACT_FROM_EMAIL` | Plain text | Production | `KL Photography <enquiries@klphotography.ie>` (after Phase 6 DNS verify) |
| `DEV_SKIP_TURNSTILE` | Plain text | Preview only | `true` (for testing without Turnstile) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Plain text | Production + Preview | From CF Turnstile dashboard (build-time public var) |

### PUBLIC_* convention for Astro

Variables prefixed `PUBLIC_` are **exposed to the browser** by Astro's build system (via `import.meta.env.PUBLIC_*`). The Turnstile **site key** is safe to expose publicly (it is the public-facing key). The Turnstile **secret key** must never be prefixed `PUBLIC_`.

`PUBLIC_TURNSTILE_SITE_KEY` must be set as a **build-time** variable in CF Pages because Astro reads it during `npm run build`. Navigate to Settings → Environment variables, set it for both Production and Preview.

### Local development `.dev.vars`

Create `.dev.vars` at the project root (already gitignored via `*.local` and `.env.*` patterns — add explicit `.dev.vars` entry):

```
# .dev.vars — NOT committed (gitignore this file explicitly)
RESEND_API_KEY=re_test_xxxxxxxxxxxx
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
CONTACT_TO_EMAIL=your-test-email@gmail.com
CONTACT_FROM_EMAIL=KL Photography <onboarding@resend.dev>
DEV_SKIP_TURNSTILE=true
```

**Turnstile test secret key:** Cloudflare provides `1x0000000000000000000000000000000AA` as a test secret that always returns `success: true`. Use this in `.dev.vars` and for CF Preview environment.

Add `.dev.vars` to `.gitignore` explicitly:

```gitignore
# Local Pages Function dev secrets
.dev.vars
```

---

## 8. Resend SPF / DKIM Records (Phase 05-02 — DOCS ONLY)

**Confidence: MEDIUM** [Multiple sources corroborate the pattern; exact values come from Resend dashboard after domain is added]

Phase 05-02 **does not add DNS records** (the CF DNS zone does not exist yet — DNS-03 belongs to Phase 6). It produces a `SETUP-RESEND-DOMAIN.md` document with the exact records to add during Phase 6.

### How to get the exact values

1. Log into resend.com → Domains → Add Domain → enter `klphotography.ie`
2. Resend displays the exact DNS records to add. Copy them verbatim.
3. Record them in `SETUP-RESEND-DOMAIN.md`.

### Expected record structure (pattern — exact values from Resend dashboard)

[ASSUMED — pattern verified from multiple third-party sources; exact hash values are account-specific]

**SPF TXT record:**

| Host | Type | Value |
|------|------|-------|
| `klphotography.ie` (or `@`) | TXT | `v=spf1 include:_spf.resend.com ~all` |

If `klphotography.ie` already has an SPF record (from the existing Wix/Gmail setup captured in Phase 1 DNS snapshot), merge the includes: `v=spf1 include:_spf.resend.com include:<existing_include> ~all`. Do not create two SPF TXT records on the same host.

**DKIM CNAME records (3 records):**

Resend typically generates 3 DKIM CNAME records with names like:

| Host | Type | Value |
|------|------|-------|
| `resend._domainkey.klphotography.ie` | CNAME | `resend._domainkey.resend.com` (exact value from dashboard) |

The actual subdomain names and CNAME values are account-specific hashes provided by Resend's domain wizard. Do not guess them.

**MX record for bounces:**

Resend may show an MX record for bounce processing. This is optional but improves deliverability. It goes on a subdomain like `bounces.klphotography.ie`, not the root. Verify during Phase 6 DNS setup.

**No MX record on root domain** — email for `klphotography.ie@gmail.com` is delivered through Gmail's MX records, which are preserved from the Phase 1 DNS snapshot. Do not alter the root MX.

### SETUP-RESEND-DOMAIN.md structure

The Phase 05-02 deliverable is a planning document at:
`.planning/phases/05-contact-form-backend-gdpr/SETUP-RESEND-DOMAIN.md`

Sections:
1. Prerequisites (Resend account, domain added to Resend)
2. Records to add (table with exact values from Resend dashboard — fill in after logging in)
3. SPF merge warning (if existing SPF record found in Phase 1 DNS snapshot)
4. Verification steps (Resend dashboard shows green checkmarks after propagation — up to 48h)
5. Post-verify: update `CONTACT_FROM_EMAIL` env var in CF Pages Production to `KL Photography <enquiries@klphotography.ie>`

---

## 9. Cloudflare Web Analytics Beacon (GDPR-02, GDPR-03)

**Confidence: HIGH** [CITED: developers.cloudflare.com/web-analytics/faq/]

### Beacon script tag

```html
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'
></script>
```

Add this to `BaseLayout.astro` just before `</body>` (or use the existing `<slot name="head">` equivalent for body). In Astro with `is:inline` to prevent Vite processing:

```astro
<!-- In BaseLayout.astro, just before </body> -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon={`{"token": "${import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN}"}`}
  is:inline
></script>
```

Or hard-code the token (it is a public token — no security risk):

```astro
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "abc123yourtokenhere"}'
  is:inline
></script>
```

### Where to find the token

CF Dashboard → **Web Analytics** → your site → **Manage site** → copy the JS snippet. The token is the value in `data-cf-beacon='{"token":"..."}'`.

### Is it cookieless?

[VERIFIED against multiple sources including the RUM beacon documentation]

Cloudflare Web Analytics:
- Does **not** set cookies
- Does **not** use `localStorage`, `sessionStorage`, or `IndexedDB`
- Does **not** store persistent data in the browser
- Discards the visitor's IP address at the nearest CF data center; does not log it
- Is **GDPR-safe without a cookie banner** for EU/EEA visitors
- Collects only performance metrics (page load time, LCP, FID, etc.) and basic referrer/path data

This is confirmed by the [CF Web Analytics RUM beacon docs](https://developers.cloudflare.com/speed/observatory/rum-beacon/) and [independent technical reviews](https://www.ctrl.blog/entry/review-cloudflare-analytics.html).

**Requirement GDPR-02 is satisfied** (no cookies) without any code changes beyond adding the script tag.
**Requirement GDPR-03 is satisfied** (no cookie banner needed).

---

## 10. GDPR `/privacy` Policy — Required Content for Ireland

**Confidence: HIGH (structure)** [ASSUMED for specific DPC contact details — verify at dataprotection.ie before launch]

### Legal framework

- **GDPR Article 13** — information to be provided at time of data collection (contact form)
- **GDPR Article 14** — information where personal data not obtained from the data subject
- **Irish Data Protection Act 2018** — gives effect to GDPR in Ireland
- **DPC (Data Protection Commission) Ireland** — supervisory authority

KL Photography is a **micro-enterprise** (sole trader). The privacy policy must be in **plain language** (GDPR Art. 12) and cover Art. 13 requirements.

### Required sections and content

#### Data Controller
```
KL Photography
[Owner's full legal name and address — OWNER-CONFIRM]
Ireland
Email: klphotography.ie@gmail.com
```

#### Data Collected via Contact Form (Art. 13(1)(d) + (e))

| Field | Is it personal data? | Optional? |
|-------|---------------------|-----------|
| Name | Yes | Required |
| Email address | Yes | Required |
| Wedding date | No (not personal) | Optional |
| Venue | No (not personal) | Optional |
| Message | Potentially yes (may contain personal info) | Required |

#### Purpose and Legal Basis (Art. 13(1)(c))
- **Purpose:** To respond to your enquiry about wedding photography services.
- **Legal basis:** Legitimate interest (Art. 6(1)(f)) — responding to a direct enquiry. Alternatively: pre-contractual measures (Art. 6(1)(b)) if the enquiry is understood as a step toward a contract.

#### Data Processors (Art. 13(1)(e))

| Processor | Role | Location | Privacy policy |
|-----------|------|----------|----------------|
| Cloudflare, Inc. | Website hosting, form processing infrastructure, spam protection (Turnstile), analytics | USA (SCCs apply) | cloudflare.com/privacypolicy |
| Resend, Inc. | Email delivery of your enquiry to the photographer | USA (SCCs apply) | resend.com/legal/privacy-policy |
| Google LLC (Gmail) | Storage of received emails in photographer's mailbox | USA (SCCs apply) | policies.google.com/privacy |

#### Retention (Art. 13(2)(a))
"We retain enquiry data in our email inbox for up to 12 months, or until a booking is confirmed or declined, whichever comes first. You may request deletion at any time."

#### Data Subject Rights (Art. 13(2)(b))
Under GDPR, you have the right to:
- Access your personal data (Art. 15)
- Correct inaccurate data (Art. 16)
- Request deletion ("right to be forgotten", Art. 17)
- Restrict processing (Art. 18)
- Object to processing (Art. 21)
- Data portability (Art. 20)
- Lodge a complaint with the DPC (Art. 77)

Contact: `klphotography.ie@gmail.com` to exercise any right.

#### DPC Ireland Contact (Art. 13(2)(d))

[ASSUMED — verify exact current details at dataprotection.ie before publishing]

```
Data Protection Commission (DPC)
21 Fitzwilliam Square South
Dublin 2
D02 RD28
Ireland

Tel: +353 57 868 4800 / +353 (0)761 104 800
Web: https://www.dataprotection.ie
```

**Online complaint form:** https://www.dataprotection.ie/en/individuals/exercising-your-rights/raise-concern-form

#### No automated decision-making
No automated profiling or decision-making occurs (Art. 13(2)(f)).

#### International transfers
Data is transferred to processors in the USA (Cloudflare, Resend, Google). Transfers are covered by Standard Contractual Clauses (SCCs) under GDPR Art. 46. See each processor's data transfer documentation.

#### Changes to this policy
"We may update this policy. The date at the top of the page shows when it was last revised."

### robots.txt changes (Phase 05-03)

When the real policy publishes, remove `Disallow: /privacy` from `public/robots.txt` in the same commit that removes the `noindex` meta tag from `privacy.astro`. Keep `Disallow: /styleguide` and the `Sitemap:` line byte-identical (Phase 2 lesson).

### GDPR-05: Privacy link adjacent to submit button

The Phase 3 Contact.astro already includes a disclosure paragraph:

```html
<p class="text-sm text-ink-soft">By submitting, you'll receive a reply within two working days.
We don't share your details. Privacy:
<a href="/privacy" class="text-bronze hover:text-bronze-hover underline">how we handle this</a>.</p>
```

This satisfies GDPR-05. The link is immediately above the `<Button type="submit">`, which counts as "adjacent." No further markup change is required for this requirement.

---

## 11. `dist/` Secret Leak Audit

**Confidence: HIGH**

The Astro static build places generated HTML/JS/CSS in `dist/`. Because secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) are only accessed server-side in `functions/api/contact.ts` and are never imported into Astro components, they will not appear in `dist/`.

`PUBLIC_TURNSTILE_SITE_KEY` will appear in `dist/` — this is intentional (it is the public widget key).

### Audit commands to run after build

```bash
# In project root, after npm run build
# These must ALL return empty (zero matches)

grep -r "re_" dist/ | grep -v ".map"
grep -r "RESEND_API_KEY" dist/
grep -r "TURNSTILE_SECRET_KEY" dist/
grep -r "1x00000000000000" dist/        # test secret key pattern

# These are EXPECTED and should NOT be empty
grep -r "PUBLIC_TURNSTILE_SITE_KEY\|cf-turnstile" dist/
```

**Negative gate:** Any match on the first four patterns is a build failure — investigate before deploying.

---

## 12. No-Cookie Verification (GDPR-02)

**Confidence: HIGH**

After Phase 5 deploys to CF Pages preview:

```javascript
// Run in browser DevTools console on klphotography.pages.dev
// After full page load (including Turnstile and analytics beacon)
console.log('Cookies:', document.cookie);
// Expected: "" (empty string)

// Check application → cookies in DevTools
// Expected: no entries for klphotography.pages.dev
```

Cloudflare Web Analytics and Turnstile (managed mode) are both confirmed to not set cookies. The site's own code sets none. Lighthouse audit → Privacy panel can also verify.

**Manual check:** DevTools → Application → Storage → Cookies → `klphotography.pages.dev` → should be empty after full load.

---

## 13. No Third-Party Scripts Beyond Turnstile + Analytics

**Confidence: HIGH**

Phase 3 ships zero third-party script tags. Phase 4 ships zero. Phase 5 adds exactly two:

1. Turnstile: `https://challenges.cloudflare.com/turnstile/v0/api.js`
2. CF Web Analytics: `https://static.cloudflareinsights.com/beacon.min.js`

**Audit command (run on `dist/index.html` after build):**

```bash
# Should return ONLY the two approved script sources
grep -oE 'src="[^"]*"' dist/index.html | sort -u

# Negative greps — must return empty
grep -i "google-analytics\|googletagmanager\|ga\.js\|gtag\|facebook\.net\|fbq\|hotjar\|intercom\|hubspot\|zendesk\|livechat" dist/index.html
```

GDPR-04 (no third-party scripts for v1) is satisfied.

---

## 14. Privacy Link Adjacent to Submit Button (GDPR-05)

Already satisfied by Phase 3 markup (see Section 10 above). The `<p>` disclosure text containing the `/privacy` link sits immediately above the `<Button type="submit">`. No change required to the form structure.

---

## 15. Lighthouse Accessibility — DESIGN-06 (a11y ≥95)

**Confidence: HIGH** (baseline established; regression check needed after Phase 5 changes)

Phase 4 achieved a11y 100 on `/`. Phase 5 changes that could affect a11y:

| Change | a11y risk | Mitigation |
|--------|-----------|------------|
| Turnstile widget rendered in DOM | The Turnstile iframe has its own accessibility — managed mode is generally accessible | Low risk — Turnstile is CF-maintained |
| `<Button>` loading state wire-up | Must ensure disabled state has accessible text | Use `aria-disabled` pattern; Button primitive already handles this |
| `/privacy` page — replacing stub content with full policy | New heading hierarchy, paragraph structure | Verify h1 > h2 ordering in policy content; no skipped heading levels |

**DESIGN-06 verification command** (run after Phase 5 deploys to preview):

```bash
# Using Lighthouse CLI (install once: npm install -g lighthouse)
lighthouse https://klphotography.pages.dev/ --only-categories=accessibility --output=json --quiet | jq '.categories.accessibility.score * 100'
lighthouse https://klphotography.pages.dev/privacy/ --only-categories=accessibility --output=json --quiet | jq '.categories.accessibility.score * 100'

# Both must be ≥ 95
```

**Form submit button and notice (`aria-live="polite"`)** — already in Phase 3 markup. The `#cf-notice` element with `role="status" aria-live="polite"` ensures AT users get feedback on submission. This is correct.

**Turnstile a11y note:** Turnstile managed mode renders an iframe with visible challenge widget. CF maintains its own WCAG compliance for the widget. Use managed mode (not invisible) so keyboard users can interact.

---

## 16. Astro `output: 'static'` + Pages Functions Coexistence

**Confidence: HIGH** [CITED: developers.cloudflare.com/pages/functions/get-started/]

The `functions/` directory must be at the **project root**, not inside `src/` or `dist/`. CF Pages processes it independently of the Astro build.

**What happens at build time:**
1. `npm run build` runs (`astro build`) → outputs `dist/` (static assets)
2. CF Pages detects `functions/` → bundles TypeScript files into Workers
3. Deployed: static assets served from edge cache, `functions/api/contact.ts` runs as a Worker on POST requests to `/api/contact`

**No conflict.** `astro.config.mjs` `output: 'static'` is not changed.

**The Astro Cloudflare adapter (`@astrojs/cloudflare`) is NOT needed and must NOT be installed.** It is only for SSR deployments, and would require changing `output` from `'static'` to `'server'` or `'hybrid'`.

**Routing precedence:** Pages Functions routes take precedence over static files. `GET /api/contact` would return nothing (no static file at that path) — but the Function only exports `onRequestPost`, so GET requests to `/api/contact` will 404 at the Function level. This is the correct behavior.

---

## 17. Local Development with `wrangler pages dev`

**Confidence: HIGH** [CITED: developers.cloudflare.com/pages/functions/local-development/]

### Install Wrangler

```bash
# devDependency only — not a runtime dependency
npm install --save-dev wrangler
```

Current version: `4.92.0` (verified on npm registry 2026-05-18).

### Start local dev server

```bash
# Build Astro first (or run dev separately)
npm run build

# Then serve with Pages Function support
npx wrangler pages dev dist/
```

Server runs on `http://localhost:8788` by default.

**Important:** `npm run dev` (Astro dev server) does NOT run Pages Functions. You must use `wrangler pages dev dist/` to test the contact form Function locally.

### Two-terminal workflow

```bash
# Terminal 1: Astro watch mode
npm run dev   # serves on :4321 for non-form development

# Terminal 2: Full stack (static + Functions)
npm run build && npx wrangler pages dev dist/   # serves on :8788 with Function support
```

Or add a convenience script to `package.json`:

```json
"scripts": {
  "dev:full": "npm run build && wrangler pages dev dist/"
}
```

### Environment variables locally

`.dev.vars` file format (dotenv syntax, at project root):

```
RESEND_API_KEY="re_xxxxxxxxxxxx"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
CONTACT_TO_EMAIL="your-test-inbox@gmail.com"
CONTACT_FROM_EMAIL="KL Photography <onboarding@resend.dev>"
DEV_SKIP_TURNSTILE="true"
```

Add to `.gitignore`:
```
.dev.vars
```

The existing `.gitignore` has `.env.*` but not `.dev.vars` explicitly — add it.

---

## Package Legitimacy Audit

> slopcheck v0.6.1 is installed. Note: slopcheck performs PyPI lookups; for npm packages, registry verification below is the primary source.

| Package | Registry | Age | Source Repo | npm view | Disposition |
|---------|----------|-----|-------------|----------|-------------|
| `wrangler` (devDep) | npm | ~8 yrs (Cloudflare official CLI) | github.com/cloudflare/workers-sdk | v4.92.0 ✓ | Approved — official Cloudflare tool |
| `resend` (OPTIONAL) | npm | ~9 yrs (2017-02-25) | github.com/resend/resend-node | v6.12.3 ✓ | Listed for reference; **NOT installed** — direct fetch used |

**No new runtime packages for Phase 5.** The Resend SDK is not installed. Direct `fetch()` to the Resend REST API requires zero dependencies.

**Postinstall script check:** `npm view resend scripts.postinstall` → empty (none). `npm view wrangler scripts.postinstall` → empty (none).

**Recommendation: ZERO new npm packages for Plans 05-01 and 05-03.** Add `wrangler` as devDependency only (for `wrangler pages dev` local testing and `wrangler types` TypeScript generation).

---

## Standard Stack

### Phase 5 stack (additions only)

| Tool | Version | Purpose | Source |
|------|---------|---------|--------|
| `wrangler` (devDep) | `^4.92.0` | Local Pages Function dev + type generation | CF official CLI |
| Turnstile (no npm) | n/a | CAPTCHA/spam protection — JS from CDN | CF service |
| Resend REST API (no npm) | n/a | Email delivery — direct `fetch()` | Resend REST API |
| CF Web Analytics (no npm) | n/a | Cookieless analytics — script tag from CDN | CF service |

### No npm install for Turnstile client
The Turnstile widget is a CDN script tag: `https://challenges.cloudflare.com/turnstile/v0/api.js`. No npm package.

### No npm install for Resend
Direct `fetch('https://api.resend.com/emails', ...)`. No npm package.

### No npm install for CF Web Analytics
CDN script tag: `https://static.cloudflareinsights.com/beacon.min.js`. No npm package.

---

## Architecture Patterns

### System Data Flow

```
Browser (Contact.astro form)
    │
    │  POST /api/contact (FormData: name, email, wedding_date, venue, message, cf-turnstile-response)
    ▼
CF Pages Function (functions/api/contact.ts)
    │
    ├─→ Honeypot check: if contact_company non-empty → 200 (silent reject)
    │
    ├─→ Field validation: required fields present?
    │       if missing → 400 JSON error
    │
    ├─→ Turnstile siteverify
    │   POST https://challenges.cloudflare.com/turnstile/v0/siteverify
    │   (token + secret + remoteip)
    │       if success:false → 403 JSON error
    │
    ├─→ Resend REST API
    │   POST https://api.resend.com/emails
    │   (from: CONTACT_FROM_EMAIL, to: CONTACT_TO_EMAIL, reply_to: couple_email, ...)
    │       if Resend error → 502 JSON error
    │
    └─→ 200 JSON { ok: true }

Browser
    │
    ├─→ ok → clear success notice ("Thanks — I'll be in touch within two working days.")
    └─→ error → show error notice ("Something went wrong. Please use phone/email/WhatsApp below.")
```

### Recommended file structure (additions)

```
project root/
├── functions/
│   ├── tsconfig.json           ← Functions-specific tsconfig
│   ├── types.d.ts              ← generated by: npx wrangler types --path='./functions/types.d.ts'
│   └── api/
│       └── contact.ts          ← POST handler (Turnstile verify + Resend send)
├── .dev.vars                   ← local secrets (gitignored)
└── .planning/phases/05-contact-form-backend-gdpr/
    └── SETUP-RESEND-DOMAIN.md  ← Phase 05-02 deliverable (DNS record values)
```

### Contact Function — full skeleton

```typescript
// functions/api/contact.ts

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  DEV_SKIP_TURNSTILE?: string;
}

const REQUIRED_FIELDS = ['name', 'email', 'message'] as const;
const MAX_FIELD_LENGTHS: Record<string, number> = {
  name: 100,
  email: 254,
  venue: 200,
  message: 2000,
  wedding_date: 10,
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 1. Parse body
    const contentType = request.headers.get('Content-Type') ?? '';
    let fields: Record<string, string>;

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const fd = await request.formData();
      fields = Object.fromEntries(
        [...fd.entries()].map(([k, v]) => [k, String(v)])
      );
    } else {
      return jsonError(415, 'Unsupported content type');
    }

    // 2. Honeypot (silent accept to fool bots)
    if (fields['contact_company']) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });
    }

    // 3. Required field validation
    for (const field of REQUIRED_FIELDS) {
      if (!fields[field]?.trim()) {
        return jsonError(400, `${field} is required`);
      }
    }

    // 4. Length validation
    for (const [field, max] of Object.entries(MAX_FIELD_LENGTHS)) {
      if (fields[field] && fields[field].length > max) {
        return jsonError(400, `${field} exceeds maximum length`);
      }
    }

    // 5. Email format sanity check
    if (!fields.email.includes('@') || !fields.email.includes('.')) {
      return jsonError(400, 'Invalid email address');
    }

    // 6. Turnstile verification
    const skipTurnstile = env.DEV_SKIP_TURNSTILE === 'true';
    if (!skipTurnstile) {
      const token = fields['cf-turnstile-response'];
      if (!token) {
        return jsonError(403, 'Turnstile token required');
      }
      const remoteip = request.headers.get('CF-Connecting-IP') ?? '';
      const valid = await verifyTurnstile(token, remoteip, env.TURNSTILE_SECRET_KEY);
      if (!valid) {
        return jsonError(403, 'Turnstile verification failed');
      }
    }

    // 7. Send email via Resend REST API
    const emailRes = await sendEmail(fields, env);
    if (!emailRes.ok) {
      const errorBody = await emailRes.text();
      console.error('Resend error:', emailRes.status, errorBody);
      return jsonError(502, 'Failed to send email');
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jsonHeaders });

  } catch (err) {
    console.error('Unexpected error:', err);
    return jsonError(500, 'Internal server error');
  }
};

// --- Helpers ---

const jsonHeaders = { 'Content-Type': 'application/json' };

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: jsonHeaders,
  });
}

async function verifyTurnstile(token: string, remoteip: string, secret: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token, remoteip });
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const data = await res.json() as { success: boolean };
  return data.success === true;
}

async function sendEmail(fields: Record<string, string>, env: Env): Promise<Response> {
  const { name, email, message, wedding_date, venue } = fields;
  const datePart = wedding_date ? ` — ${wedding_date}` : '';
  const subject = `Wedding enquiry from ${name}${datePart}`;

  const textLines = [`Name: ${name}`, `Email: ${email}`];
  if (wedding_date) textLines.push(`Wedding date: ${wedding_date}`);
  if (venue) textLines.push(`Venue: ${venue}`);
  textLines.push('', message);

  const html = `
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>Email:</strong> ${esc(email)}</p>
    ${wedding_date ? `<p><strong>Wedding date:</strong> ${esc(wedding_date)}</p>` : ''}
    ${venue ? `<p><strong>Venue:</strong> ${esc(venue)}</p>` : ''}
    <hr>
    <p style="white-space:pre-wrap">${esc(message)}</p>
  `;

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject,
      text: textLines.join('\n'),
      html,
    }),
  });
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
```

---

## Common Pitfalls

### Pitfall 1: Installing `@astrojs/cloudflare` adapter
**What goes wrong:** Changes `output: 'static'` to SSR, breaks the entire Astro build, generates a `_worker.js` that conflicts with `functions/` routing.
**How to avoid:** Do not install any Astro Cloudflare adapter. Pages Functions work independently of Astro's output mode.

### Pitfall 2: `reply_to` vs `replyTo` in Resend API
**What goes wrong:** The Resend REST API uses `reply_to` (snake_case). The SDK uses `replyTo` (camelCase). Using `replyTo` in a direct `fetch()` body will silently ignore the field — owner will not be able to reply to couples.
**How to avoid:** Use `reply_to` when sending JSON to the Resend REST API directly.

### Pitfall 3: Forgetting `is:inline` on CDN script tags in Astro
**What goes wrong:** Astro's Vite bundler tries to process the Turnstile and Analytics script tags as local modules, fails with import errors.
**How to avoid:** Add `is:inline` to all CDN `<script>` tags (Turnstile, CF Analytics beacon).

### Pitfall 4: `PUBLIC_TURNSTILE_SITE_KEY` not set at build time
**What goes wrong:** `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` resolves to `undefined` in the built HTML; the Turnstile widget renders with no site key and fails silently or shows an error.
**How to avoid:** Set `PUBLIC_TURNSTILE_SITE_KEY` as a **build-time** variable in CF Pages Settings → Environment Variables → Production AND Preview. It must be available when `npm run build` runs, not just at runtime.

### Pitfall 5: SPF record conflict (two SPF TXT records)
**What goes wrong:** DNS has one SPF record from Gmail/Google Workspace setup and you add a second for Resend. Multiple SPF TXT records on the same host cause "PermError" — both records are ignored.
**How to avoid:** Merge into a single SPF record. E.g.: `v=spf1 include:_spf.google.com include:_spf.resend.com ~all`. Check Phase 1 DNS snapshot for existing SPF before writing SETUP-RESEND-DOMAIN.md.

### Pitfall 6: `grep -c` vs `grep -oE | wc -l` on minified Astro HTML
**What goes wrong:** Astro minifies built HTML to one line per file. `grep -c` counts matching lines (returns 1 even if 10 occurrences). Verification gates using `grep -c` fail or give wrong counts.
**How to avoid:** Use `grep -oE 'PATTERN' dist/file.html | wc -l` for occurrence counts. Established in Phase 3 SUMMARY (Deviation 1).

### Pitfall 7: Not adding `.dev.vars` to `.gitignore`
**What goes wrong:** `.dev.vars` contains real API keys and gets committed to the repo. The existing `.gitignore` covers `.env.*` but not `.dev.vars` explicitly.
**How to avoid:** Add `.dev.vars` as an explicit line in `.gitignore` (Plan 05-01 Task 0).

### Pitfall 8: Using `import.meta.env.*` inside Pages Functions
**What goes wrong:** `import.meta.env` is an Astro/Vite construct. It is not available inside `functions/*.ts` (these run in the Workers runtime, not Node.js). Runtime env vars in Functions are accessed via `context.env.VARIABLE_NAME`.
**How to avoid:** Never use `import.meta.env` inside `functions/`. Always use `env.VARIABLE_NAME` from the context parameter.

---

## Open Questions (RESOLVED)

| # | Question | Resolution |
|---|----------|-----------|
| Q1 | Should we use the Resend SDK or direct fetch? | **Direct fetch.** SDK works in Workers but is unnecessarily large (~300KB unpacked). Our use case is a single API call. |
| Q2 | Does the Astro Cloudflare adapter need to be installed? | **No.** Pages Functions work independently. Installing the adapter would break the static build. |
| Q3 | Does Turnstile set cookies? | **No.** Managed mode is confirmed cookieless. No cookie banner needed. |
| Q4 | Is CF Web Analytics really cookieless? | **Yes.** Confirmed by CF RUM beacon docs — no cookies, no local storage, no persistent browser data. |
| Q5 | Can we use `onboarding@resend.dev` as from address before domain verification? | **Yes.** Resend's test/onboarding domain works immediately without domain setup. Controlled by `CONTACT_FROM_EMAIL` env var. |
| Q6 | Where does `functions/` go — in the project root or inside `dist/`? | **Project root.** `functions/` must not be inside `dist/`. CF Pages processes them separately. |
| Q7 | Does `PUBLIC_TURNSTILE_SITE_KEY` need special treatment? | **Yes — it must be set at build time** (Astro bakes it into the HTML at build). Set it in CF Pages env vars, not just in `.dev.vars`. |
| Q8 | What is the Turnstile test secret key for dev? | `1x0000000000000000000000000000000AA` — always returns success. Use in `.dev.vars` and Preview environment. |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Turnstile managed mode does not set cookies | §2, §12 | Would require cookie banner — revisit CF docs when Phase 5 ships |
| A2 | Resend SPF record format is `v=spf1 include:_spf.resend.com ~all` | §8 | Wrong format → domain verification fails. Get exact value from Resend dashboard. |
| A3 | Resend generates 3 DKIM CNAME records | §8 | Number may differ. Verify in Resend dashboard during Phase 05-02 authoring. |
| A4 | DPC Ireland contact details (phone, address) | §10 | DPC may have updated contact info. Verify at dataprotection.ie before publishing privacy page. |
| A5 | `is:inline` required for CDN script tags in BaseLayout | §5, §9 | If BaseLayout uses a different head slot mechanism, approach may need adjustment. Check BaseLayout.astro. |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | `npm run build`, wrangler | ✓ | `.nvmrc` specifies ≥22.12 | — |
| npm | Package install | ✓ | bundled with Node | — |
| wrangler | Local Pages Function dev | Not yet installed | 4.92.0 on registry | Install: `npm install --save-dev wrangler` |
| Resend account | FORM-04 email delivery | Pending (user creating) | n/a | `onboarding@resend.dev` works on free tier without domain verify |
| CF Turnstile keys | FORM-03 spam protection | Pending (user provisioning) | n/a | Test key `1x0000000000000000000000000000000AA` for local dev |
| CF Web Analytics token | GDPR-03 cookieless analytics | Pending (CF account exists) | n/a | Skip beacon in dev |

**Blocking dependencies for Phase 05-01 execution:**
- Resend API key (`RESEND_API_KEY`) must be in `.dev.vars` before local testing
- Turnstile site key + secret key must be provisioned and in `.dev.vars`

Both keys can be provisioned in 10 minutes (no DNS or domain ownership required for Turnstile; Resend free account is instant sign-up with test domain).

---

## Security Domain

### ASVS Categories Applicable

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | Yes | Server-side: required field check, max length, email format; HTML escape before email output |
| V4 Access Control | Partial | Turnstile token required on every POST; no authenticated routes in this phase |
| V2 Authentication | No | No user login |
| V3 Session Management | No | No sessions |
| V6 Cryptography | No | API keys stored in CF Pages encrypted secrets (never in code) |

### Threat Model

| Threat | STRIDE | Mitigation |
|--------|--------|-----------|
| Bot/spam form submissions | Tampering | Turnstile server-side verification + honeypot field |
| Secret key exposure in built HTML | Information Disclosure | Keys only in `functions/` via `context.env` — never imported into Astro components |
| XSS via form field in email HTML body | Tampering | HTML-escape all user input before building email HTML |
| Reply-to header injection | Tampering | Use the Resend `reply_to` field (Resend handles header construction); never build raw email headers |
| Denial-of-service via contact form | Elevation of Privilege | Turnstile rate-limits; Resend free tier 3000/mo acts as a natural cap |
| Privacy page indexed before ready | Information Disclosure | `noindex` meta + `robots.txt Disallow /privacy` until real policy ships (Phase 3 established; remove in same commit as policy publish) |

---

## Sources

### Primary (HIGH confidence)
- [CF Pages Functions API Reference](https://developers.cloudflare.com/pages/functions/api-reference/) — handler shape, EventContext type, env object
- [CF Pages Functions TypeScript](https://developers.cloudflare.com/pages/functions/typescript/) — PagesFunction type, wrangler types command
- [CF Pages Functions — Get Started](https://developers.cloudflare.com/pages/functions/get-started/) — functions/ directory placement, coexistence with static output
- [CF Pages Functions — Bindings](https://developers.cloudflare.com/pages/functions/bindings/) — env vars, dashboard path, PUBLIC_* convention
- [CF Pages Functions — Local Development](https://developers.cloudflare.com/pages/functions/local-development/) — wrangler pages dev command
- [Turnstile Server-Side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) — siteverify endpoint, request/response format
- [Resend REST API — Send Email](https://resend.com/docs/api-reference/emails/send-email) — endpoint, auth, request body fields including reply_to
- [Resend — Cloudflare Workers](https://resend.com/docs/send-with-cloudflare-workers) — SDK confirmed working in Workers runtime
- [CF Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — beacon script tag format `data-cf-beacon`
- [CF Speed Observatory RUM Beacon](https://developers.cloudflare.com/speed/observatory/rum-beacon/) — confirmed no cookies, no localStorage, no persistent browser storage
- [Wrangler secrets / .dev.vars](https://developers.cloudflare.com/workers/wrangler/configuration/#secrets) — .dev.vars file format (dotenv syntax)

### Secondary (MEDIUM confidence)
- [Resend SPF/DKIM pattern](https://dmarc.wiki/resend) — `v=spf1 include:_spf.resend.com ~all` pattern; exact values from Resend dashboard required
- [Cloudflare Community — DKIM setup with Resend](https://community.cloudflare.com/t/i-have-set-up-dkim-as-presented-in-resend-but-it-is-not-verified/806974) — confirms CNAME record pattern
- [Ethical Data Hub — CF Analytics cookie banner](https://ethicaldatahub.com/cloudflare-analytics-cookie-banner/) — confirms no cookie banner needed with CF Web Analytics

### Tertiary (LOW confidence)
- [ctrl.blog — CF Web Analytics review](https://www.ctrl.blog/entry/review-cloudflare-analytics.html) — independent technical review confirming cookieless behavior; supports MEDIUM confidence on cookie claim

---

## Metadata

**Confidence breakdown:**
- CF Pages Functions handler shape: HIGH — verified against official API reference
- Turnstile siteverify endpoint/format: HIGH — official docs, clear specification
- Resend direct fetch: HIGH — official REST API docs + confirmed Workers compatibility
- GDPR policy structure: HIGH (structure) / ASSUMED (DPC contact details — verify before publish)
- CF Web Analytics cookieless: HIGH — confirmed by RUM beacon official docs
- Resend SPF/DKIM record values: MEDIUM — exact values require Resend dashboard login

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable APIs; Resend and Turnstile APIs change rarely)
