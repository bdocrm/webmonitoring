import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

const DEFAULT_RECIPIENTS = [
  'allianz.vanna@gmail.com',
  'allianzsynergia.web@gmail.com',
  'jovie.recto@allianzsynergia.com.ph',
  'allianz.sonnyguiyab@gmail.com',
];

export type AlertType = 'scan_started' | 'scan_progress' | 'scan_completed' | 'site_down' | 'possible_attack' | 'security_alert';

function parseRecipients(value: string) {
  return value
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

function getRecipients() {
  const configuredRecipients = parseRecipients(env.ALERT_EMAIL_RECIPIENTS);
  return configuredRecipients.length > 0 ? configuredRecipients : DEFAULT_RECIPIENTS;
}

function getEmailDomain(value: string) {
  const match = value.trim().toLowerCase().match(/@([^>\s]+)>?$/);
  return match?.[1] || '';
}

function getSender() {
  const configuredFrom = env.EMAIL_FROM.trim();
  const smtpUserDomain = getEmailDomain(env.SMTP_USER);
  const configuredFromDomain = getEmailDomain(configuredFrom);

  if (!configuredFromDomain || (smtpUserDomain && configuredFromDomain !== smtpUserDomain)) {
    return env.SMTP_USER;
  }

  return configuredFrom;
}

const smtpSecure = env.SMTP_PORT === 465;

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: smtpSecure,
      requireTLS: !smtpSecure,
      auth: env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
    })
  : null;

export async function sendAlertEmail(
  type: AlertType,
  details: {
    websiteName: string;
    domain: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    meta?: Record<string, string | number | boolean | null | undefined>;
  }
) {
  if (!env.ENABLE_EMAIL_ALERTS) {
    console.info('Email notifications are disabled. Skipping alert.', { type, websiteName: details.websiteName });
    return { ok: false, reason: 'disabled' };
  }

  if (!transporter || !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('Email notifications are not configured. Skipping alert.', { type, websiteName: details.websiteName });
    return { ok: false, reason: 'missing-config' };
  }

  const recipients = getRecipients();

  if (recipients.length === 0) {
    console.warn('Email notifications have no recipients configured. Skipping alert.', { type, websiteName: details.websiteName });
    return { ok: false, reason: 'missing-recipients' };
  }

  const subjectMap: Record<AlertType, string> = {
    scan_started: 'Website scan started',
    scan_progress: 'Website scan progress update',
    scan_completed: 'Website scan completed',
    site_down: 'Website is down',
    possible_attack: 'Possible attack or blocking event detected',
    security_alert: 'Security alert detected',
  };

  const lines = [
    `Website: ${details.websiteName}`,
    `Domain: ${details.domain}`,
    '',
    details.message,
  ];

  if (details.actionUrl) {
    lines.push('', `${details.actionLabel || 'Open dashboard'}:`, details.actionUrl);
  }

  if (details.meta && Object.keys(details.meta).length > 0) {
    lines.push('', 'Details:');
    Object.entries(details.meta).forEach(([key, value]) => {
      lines.push(`${key}: ${value ?? 'n/a'}`);
    });
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">${subjectMap[type]}</h2>
      <p><strong>Website:</strong> ${details.websiteName}</p>
      <p><strong>Domain:</strong> ${details.domain}</p>
      <p>${details.message.replace(/\n/g, '<br />')}</p>
      ${details.actionUrl ? `<p><a href="${details.actionUrl}" style="display:inline-block;padding:10px 14px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;">${details.actionLabel || 'Open dashboard'}</a></p><p style="font-size:12px;color:#4b5563;">${details.actionUrl}</p>` : ''}
      ${details.meta && Object.keys(details.meta).length > 0 ? `<br /><strong>Details:</strong><ul>${Object.entries(details.meta).map(([key, value]) => `<li>${key}: ${value ?? 'n/a'}</li>`).join('')}</ul>` : ''}
    </div>
  `;

  try {
    const from = getSender();

    await transporter.sendMail({
      from,
      to: recipients.join(','),
      subject: `${subjectMap[type]} - ${details.domain}`,
      text: lines.join('\n'),
      html,
    });

    return { ok: true, recipientCount: recipients.length, from };
  } catch (error) {
    console.error('Failed to send alert email', error);
    return { ok: false, reason: 'send-failed' };
  }
}
