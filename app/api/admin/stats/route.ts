import { NextResponse } from 'next/server';
import { getUserById, getStatistics } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
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
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const stats = await getStatistics({} as any);
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('获取统计错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
