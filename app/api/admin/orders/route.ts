import { NextResponse } from 'next/server';
import { getUserById, getAllOrders } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orders = await getAllOrders({} as any, limit, offset);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
