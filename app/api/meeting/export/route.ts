import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { generateDocx } from '@/lib/meetingGenerator';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
<<<<<<< HEAD
    const cookieStore = await cookies();
=======
    const cookieStore = cookies();
>>>>>>> 2df9ebff25e016119b2a497f00296378c99d034e
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

    const isMember = user.member_type === 'monthly' || user.member_type === 'lifetime';
    const membershipValid = user.member_type === 'lifetime' || 
      (user.member_expires_at && new Date(user.member_expires_at) > new Date());

    if (!isMember || !membershipValid) {
      if (user.has_used_export) {
        return NextResponse.json({ error: '免费用户只能导出一次，请升级会员' }, { status: 429 });
      }

      await updateUser({} as any, user.id, {
        has_used_export: true,
      });
    }

    const body = await request.json() as any;
    const buffer = await generateDocx(body);

    return new NextResponse(new Uint8Array(buffer) as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="会议纪要.docx"',
      },
    });
  } catch (error) {
    console.error('导出Word错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
