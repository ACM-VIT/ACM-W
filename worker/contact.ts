const CONTACT_PATH = '/api/contact';
const CONTACT_FROM = 'contact@acmw.acmvit.in';
const CONTACT_TO = 'acm@vit.ac.in';

interface EmailAddress {
  email: string;
  name?: string;
}

interface EmailMessage {
  to: string | EmailAddress | Array<string | EmailAddress>;
  from: string | EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | EmailAddress;
}

interface EmailBinding {
  send(message: EmailMessage): Promise<{ messageId: string }>;
}

interface Env {
  EMAIL: EmailBinding;
}

interface ContactData {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  },
});

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const asTrimmedString = (value: unknown) => (
  typeof value === 'string' ? value.trim() : ''
);

const isAllowedOrigin = (request: Request) => {
  const origin = request.headers.get('Origin');
  if (!origin) return true;

  return origin === 'https://acmw.acmvit.in'
    || origin === 'http://localhost:5173'
    || origin === 'http://localhost:8787';
};

const handleContact = async (request: Request, env: Env) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed' }, 405);
  }

  if (!isAllowedOrigin(request)) {
    return json({ message: 'Origin not allowed' }, 403);
  }

  const contentLength = Number(request.headers.get('Content-Length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > 20_000) {
    return json({ message: 'Request body too large' }, 413);
  }

  let data: ContactData;
  try {
    data = await request.json() as ContactData;
  } catch {
    return json({ message: 'Invalid request body' }, 400);
  }

  const name = asTrimmedString(data.name);
  const email = asTrimmedString(data.email);
  const phone = asTrimmedString(data.phone) || 'N/A';
  const message = asTrimmedString(data.message);

  if (!name || !email || !message) {
    return json({ message: 'Missing required fields' }, 400);
  }

  if (name.length > 100 || email.length > 254 || phone.length > 30 || message.length > 5_000) {
    return json({ message: 'One or more fields are too long' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: 'Invalid email address' }, 400);
  }

  const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
  const html = [
    '<h3>New Contact Form Submission</h3>',
    `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
    `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
    `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>`,
    '<p><strong>Message:</strong></p>',
    `<p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>`,
  ].join('');

  try {
    await env.EMAIL.send({
      from: { email: CONTACT_FROM, name: 'ACM-W VIT' },
      to: CONTACT_TO,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      text,
      html,
    });

    return json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Cloudflare Email Service failed to send the contact message', error);
    return json({ message: 'Failed to send email' }, 502);
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== CONTACT_PATH) {
      return json({ message: 'Not found' }, 404);
    }

    return handleContact(request, env);
  },
};
