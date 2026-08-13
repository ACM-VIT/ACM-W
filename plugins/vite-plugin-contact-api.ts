/**
 * Vite dev-server plugin that handles POST /api/contact locally.
 *
 * In production the same endpoint is served by the Cloudflare Pages Function
 * at functions/api/contact.ts. This plugin mirrors that logic so `npm run dev`
 * (plain Vite) can test the contact form without needing `wrangler pages dev`.
 *
 * Reads RESEND_API_KEY and RESEND_FROM from the root `.env` file.
 */

import type { Plugin } from 'vite';

interface ContactData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default function contactApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req, res) => {
        // Only handle POST
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Method not allowed' }));
          return;
        }

        // Read the request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }

        let data: ContactData;
        try {
          data = JSON.parse(Buffer.concat(chunks).toString());
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid request body' }));
          return;
        }

        const name = data.name?.trim();
        const email = data.email?.trim();
        const phone = data.phone?.trim() || 'N/A';
        const message = data.message?.trim();

        if (!name || !email || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Missing required fields' }));
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Invalid email address' }));
          return;
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const RESEND_FROM = process.env.RESEND_FROM;

        if (!RESEND_API_KEY || !RESEND_FROM) {
          console.error(
            '[contact-api] Missing RESEND_API_KEY or RESEND_FROM in .env',
          );
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              message: 'Server configuration error: Missing email credentials',
            }),
          );
          return;
        }

        const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
        const html =
          `<h3>New Contact Form Submission</h3>` +
          `<p><strong>Name:</strong> ${name}</p>` +
          `<p><strong>Email:</strong> ${email}</p>` +
          `<p><strong>Phone:</strong> ${phone}</p>` +
          `<p><strong>Message:</strong></p>` +
          `<p>${message.replace(/\n/g, '<br/>')}</p>`;

        const isTestSender =
          RESEND_FROM === 'onboarding@resend.dev';
        const RESEND_TEST_TO = process.env.RESEND_TEST_TO;
        const toAddress = isTestSender
          ? (RESEND_TEST_TO || RESEND_FROM)
          : 'acm@vit.ac.in';

        if (isTestSender) {
          console.log(
            `[contact-api] Using onboarding@resend.dev — sending to ${toAddress} instead of acm@vit.ac.in`,
          );
          if (!RESEND_TEST_TO) {
            console.warn(
              '[contact-api] Tip: set RESEND_TEST_TO=your-email@gmail.com in .env to receive test emails',
            );
          }
        }

        try {
          const apiRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: RESEND_FROM,
              to: [toAddress],
              reply_to: email,
              subject: `New Contact Form Submission from ${name}`,
              text,
              html,
            }),
          });

          if (!apiRes.ok) {
            const errBody = await apiRes.text();
            console.error('[contact-api] Resend error:', errBody);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Failed to send email' }));
            return;
          }

          console.log('[contact-api] Email sent successfully');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Email sent successfully' }));
        } catch (error) {
          console.error('[contact-api] Error sending email:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Failed to send email' }));
        }
      });
    },
  };
}
