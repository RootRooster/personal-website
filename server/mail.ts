import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_KEY);

const FROM = process.env.MAIL_FROM || 'nikcadez.com <blog@nikcadez.com>';
const REPLY_TO = process.env.MAIL_REPLY_TO || 'gmail@nikcadez.com';
const CONTACT_FROM = process.env.MAIL_CONTACT_FROM || 'nikcadez.com Contact <contact.me@nikcadez.com>';
const CONTACT_TO = process.env.MAIL_CONTACT_TO || 'gmail@nikcadez.com';

// Strip control characters that could allow email header injection
function stripControl(str: string): string {
  return str.replace(/[\r\n\x00-\x1f]/g, ' ');
}

// HTML-escape user input to prevent injection
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Send a contact form inquiry to you
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const name = esc(data.name);
  const email = esc(data.email);
  const subject = esc(data.subject);
  const message = esc(data.message);

  await resend.emails.send({
    from: CONTACT_FROM,
    to: CONTACT_TO,
    replyTo: data.email,
    subject: stripControl(`${data.subject} — from ${data.name}`),
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: #333;">New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `,
  });
}

// Notify all subscribers about a new blog post
export async function sendNewPostNotification(
  subscribers: { email: string }[],
  post: { id: number; title: string; excerpt: string },
  siteUrl: string,
) {
  if (subscribers.length === 0) return;

  const title = esc(post.title);
  const excerpt = esc(post.excerpt);
  const postUrl = `${esc(siteUrl)}/blog/${post.id}`;

  // Send individually so each person gets their own email
  const results = await Promise.allSettled(
    subscribers.map((sub) =>
      resend.emails.send({
        from: FROM,
        to: sub.email,
        replyTo: REPLY_TO,
        subject: stripControl(`New Post: ${post.title}`),
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h1 style="font-size: 24px; color: #333;">${title}</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">${excerpt}</p>
            <a href="${postUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #4b8eff; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Read Article
            </a>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
            <p style="color: #999; font-size: 12px;">You're receiving this because you subscribed at pro.nikcadez.com</p>
          </div>
        `,
      })
    )
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) console.error(`Failed to send ${failed}/${subscribers.length} newsletter emails`);
}
