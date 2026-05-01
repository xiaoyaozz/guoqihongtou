import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, getUserByEmail, checkIpRegistration, recordIpRegistration } from '@/lib/db';
import { hashData } from '@/lib/captcha';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email: string; password: string; captcha: string };
    const { email, password, captcha } = body;

    if (!email || !password || !captcha) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    const cookieStore = cookies();
    const captchaHash = cookieStore.get('captcha_hash')?.value;
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    
    if (!captchaHash || hashData(captcha.toLowerCase(), secret) !== captchaHash) {
      return NextResponse.json({ error: '验证码错误' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    
    const ipRegistered = await checkIpRegistration({} as any, ip, today);
    if (ipRegistered) {
      return NextResponse.json({ error: '同一IP今日已注册过账号' }, { status: 429 });
    }

    const existingUser = await getUserByEmail({} as any, email);
    if (existingUser) {
      return NextResponse.json({ error: '邮箱已被注册' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await createUser({} as any, email, hashedPassword);
    
    await recordIpRegistration({} as any, ip, today);

    return NextResponse.json({ success: true, message: '注册成功，请查收邮件激活账号' });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
