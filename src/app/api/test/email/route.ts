import { NextRequest, NextResponse } from 'next/server';
import { sendAlertEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    message: 'POST to this endpoint to send a local test alert email.',
    configured: {
      smtpHost: !!process.env.SMTP_HOST,
      smtpUser: !!process.env.SMTP_USER,
      smtpPass: !!process.env.SMTP_PASS,
      recipients: !!process.env.ALERT_EMAIL_RECIPIENTS,
      enabled: process.env.ENABLE_EMAIL_ALERTS !== 'false',
    },
  });
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const result = await sendAlertEmail('scan_started', {
    websiteName: 'Local email test',
    domain: 'localhost',
    message: body.message || 'This is a local WebMonitoring email test.',
    meta: {
      triggeredBy: '/api/test/email',
      triggeredAt: new Date().toISOString(),
    },
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
