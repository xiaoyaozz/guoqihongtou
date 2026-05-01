import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, updateUser } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { hashData } from '@/lib/captcha';
import { cookies } from 'next/headers';

const isLocal = process.env.NODE_ENV !== 'production' || !process.env.CF_PAGES;

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

    const user = await getUserByEmail({} as any, email);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 本地开发模式自动验证用户
    if (isLocal && !user.is_verified) {
      await updateUser({} as any, user.id, { is_verified: true });
      user.is_verified = true;
    }

    if (!user.is_verified) {
      return NextResponse.json({ error: '请先激活账号' }, { status: 403 });
    }

    const passwordValid = await bcrypt.compare(password, user.password as string);
    if (!passwordValid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const token = signToken(user, secret);

    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
