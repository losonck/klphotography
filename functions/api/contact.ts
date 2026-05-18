/**
 * POST /api/contact — Cloudflare Pages Function.
 *
 * Receives a wedding-enquiry submission from src/components/sections/Contact.astro,
 * verifies the Turnstile token (server-side per Turnstile docs + RESEARCH section 2),
 * and dispatches the enquiry to the owner's Gmail via the Resend REST API (direct
 * fetch — no SDK per D-01 + RESEARCH section 3).
 *
 * Contract documented in 05-01-PLAN.md <behavior> block.
 *
 * Env access: ONLY via the `env` parameter on context. NEVER via Astro-Vite
 * build-time env globals (Pitfall 8 — those are undefined in the Workers runtime).
 *
 * Zero npm imports — pure Web API (fetch, URLSearchParams, FormData, Response, JSON).
 */

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

const HONEYPOT_FIELD = 'contact_company';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 1. Parse body — accept both multipart/form-data (JS path) and
    //    application/x-www-form-urlencoded (no-JS path) per D-09 + RESEARCH section 5.
    const contentType = request.headers.get('Content-Type') ?? '';
    let fields: Record<string, string>;

    if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const fd = await request.formData();
      fields = Object.fromEntries(
        [...fd.entries()].map(([k, v]) => [k, String(v)]),
      );
    } else {
      return jsonError(415, 'Unsupported content type');
    }

    const acceptsJson = (request.headers.get('Accept') ?? '').includes(
      'application/json',
    );

    // 2. Honeypot (silent accept to fool bots — D-14 + T-05-01-09).
    //    Bot fills any non-empty value -> we return 200 success WITHOUT sending email
    //    or calling Turnstile. Honeypot is defense-in-depth on top of Turnstile.
    if (fields[HONEYPOT_FIELD]?.trim()) {
      return successResponse(acceptsJson);
    }

    // 3. Required field validation.
    for (const field of REQUIRED_FIELDS) {
      if (!fields[field]?.trim()) {
        return jsonError(400, `${field} is required`);
      }
    }

    // 4. Length validation (per MAX_FIELD_LENGTHS).
    for (const [field, max] of Object.entries(MAX_FIELD_LENGTHS)) {
      if (fields[field] && fields[field].length > max) {
        return jsonError(400, `${field} exceeds maximum length`);
      }
    }

    // 5. Email format sanity check (RFC-5322 is intractable; we only block the
    //    obviously-broken cases — Resend rejects further malformed addresses).
    if (!fields.email.includes('@') || !fields.email.includes('.')) {
      return jsonError(400, 'Invalid email address');
    }

    // 6. Turnstile siteverify — skip ONLY when env.DEV_SKIP_TURNSTILE === 'true'
    //    (string compare; the env var is plain text per RESEARCH section 7).
    //    Production CF Pages env has NO such var so this branch never short-circuits.
    const skipTurnstile = env.DEV_SKIP_TURNSTILE === 'true';
    if (!skipTurnstile) {
      const token = fields['cf-turnstile-response'];
      if (!token) {
        return jsonError(403, 'Turnstile token required');
      }
      const remoteip = request.headers.get('CF-Connecting-IP') ?? '';
      const valid = await verifyTurnstile(
        token,
        remoteip,
        env.TURNSTILE_SECRET_KEY,
      );
      if (!valid) {
        return jsonError(403, 'Turnstile verification failed');
      }
    }

    // 7. Send via Resend REST API (direct fetch; reply_to snake_case per D-01 + Pitfall 2).
    const emailRes = await sendEmail(fields, env);
    if (!emailRes.ok) {
      // Log Resend status + body for owner debugging in CF Functions logs.
      // Does NOT log couple's form fields (GDPR — T-05-01-06 mitigation).
      const errorBody = await emailRes.text();
      console.error('Resend error:', emailRes.status, errorBody);
      return jsonError(502, 'Failed to send email');
    }

    return successResponse(acceptsJson);
  } catch (err) {
    // Log the error object only — never the request body (T-05-01-06).
    console.error('Unexpected error:', err);
    return jsonError(500, 'Internal server error');
  }
};

// --- Helpers ---

const jsonHeaders = { 'Content-Type': 'application/json' };
const htmlHeaders = { 'Content-Type': 'text/html; charset=utf-8' };

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: jsonHeaders,
  });
}

function successResponse(acceptsJson: boolean): Response {
  if (acceptsJson) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  }
  // No-JS path per D-09 + RESEARCH section 6 — return a minimal HTML success
  // page so the browser does not display raw JSON to the user.
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Thank you — KL Photography</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6;">
    <h1>Thank you</h1>
    <p>Your enquiry has been received. I'll be in touch within two working days.</p>
    <p><a href="/">Return to klphotography.ie</a></p>
  </body>
</html>`;
  return new Response(html, { status: 200, headers: htmlHeaders });
}

async function verifyTurnstile(
  token: string,
  remoteip: string,
  secret: string,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token, remoteip });
  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body,
    },
  );
  if (!res.ok) return false;
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

async function sendEmail(
  fields: Record<string, string>,
  env: Env,
): Promise<Response> {
  const { name, email, message, wedding_date, venue } = fields;

  // Subject builder per D-13 + FORM-05 + RESEARCH section 4.
  const datePart = wedding_date ? ` — ${wedding_date}` : '';
  const subject = `Wedding enquiry from ${name}${datePart}`;

  // Plain-text body — no escaping needed (no HTML rendering).
  const textLines = [`Name: ${name}`, `Email: ${email}`];
  if (wedding_date) textLines.push(`Wedding date: ${wedding_date}`);
  if (venue) textLines.push(`Venue: ${venue}`);
  textLines.push('', message);

  // HTML body — esc() on ALL user input before insertion to defend against
  // XSS in the owner's Gmail HTML viewer per RESEARCH section 4 + T-05-01-04.
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
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email, // FORM-04 + D-01 + Pitfall 2 — snake_case key required by Resend REST API
      subject,
      text: textLines.join('\n'),
      html,
    }),
  });
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
