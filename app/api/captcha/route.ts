import { NextResponse } from 'next/server';
import { generateCaptcha, hashData } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function GET() {
  const { text, svg } = generateCaptcha();
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const hash = hashData(text.toLowerCase(), secret);
  
  const cookieStore = cookies();
  cookieStore.set('captcha_hash', hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  });
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
