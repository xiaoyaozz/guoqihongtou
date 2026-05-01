import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { generateMeetingMinutes } from '@/lib/meetingGenerator';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = verifyToken(token, secret);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Token无效' }, { status: 401 });
    }

    const user = await getUserById({} as any, decoded.id);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const isMember = user.member_type === 'monthly' || user.member_type === 'lifetime';
    const membershipValid = user.member_type === 'lifetime' || 
      (user.member_expires_at && new Date(user.member_expires_at) > new Date());

    if (!isMember || !membershipValid) {
      const lastGenDate = user.last_generation_date?.split('T')[0];
      if (lastGenDate !== today) {
        await updateUser({} as any, user.id, {
          daily_generations: 0,
          last_generation_date: new Date().toISOString(),
        });
        user.daily_generations = 0;
      }

      if (user.daily_generations >= 3) {
        return NextResponse.json({ error: '今日生成次数已用完，请升级会员' }, { status: 429 });
      }

      await updateUser({} as any, user.id, {
        daily_generations: user.daily_generations + 1,
      });
    }

    const body = await request.json() as any;
    const minutes = generateMeetingMinutes(body);

    return NextResponse.json({ success: true, minutes });
  } catch (error) {
    console.error('生成会议纪要错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
