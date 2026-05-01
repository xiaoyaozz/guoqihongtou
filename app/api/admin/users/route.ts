import { NextResponse } from 'next/server';
import { getUserById, getAllUsers, updateUser } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const users = await getAllUsers({} as any, limit, offset);
    const sanitizedUsers = users.map(({ password, ...u }) => u);
    
    return NextResponse.json({ success: true, users: sanitizedUsers });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

    const adminUser = await getUserById({} as any, decoded.id);
    if (!adminUser || !adminUser.is_admin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const body = await request.json() as { userId: number; [key: string]: any };
    const { userId, ...updates } = body;
    
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const updatedUser = await updateUser({} as any, userId, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const { password, ...sanitizedUser } = updatedUser;
    return NextResponse.json({ success: true, user: sanitizedUser });
  } catch (error) {
    console.error('更新用户错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
