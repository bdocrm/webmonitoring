import { NextResponse } from 'next/server';
import { collectListeningMentions } from '@/lib/listening';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await collectListeningMentions();
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Listening collection failed:', error);
    return NextResponse.json(
      { error: 'Unable to collect listening data right now.' },
      { status: 500 }
    );
  }
}
