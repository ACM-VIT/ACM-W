interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface ContactData {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

export const onRequestPost = async ({ request, env }: PagesContext) => {
  let data: ContactData;

  try {
    data = await request.json() as ContactData;
  } catch {
    return json({ message: 'Invalid request body' }, 400);
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const phone = data.phone?.trim() || 'N/A';
  const message = data.message?.trim();

  if (!name || !email || !message) {
    return json({ message: 'Missing required fields' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: 'Invalid email address' }, 400);
  }

  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.error('Missing RESEND_API_KEY or RESEND_FROM environment variable');
    return json({ message: 'Server configuration error: Missing email credentials' }, 500);
  }

  const text = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: ['acm@vit.ac.in'],
        reply_to: email,
        subject: `New Contact Form Submission from ${name}`,
        text,
        html: `<h3>New Contact Form Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
      }),
    });

    if (!response.ok) {
      console.error('Error sending email:', await response.text());
      return json({ message: 'Failed to send email' }, 500);
    }

    return json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return json({ message: 'Failed to send email' }, 500);
  }
};
