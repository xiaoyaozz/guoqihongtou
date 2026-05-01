import { NextResponse } from 'next/server';
import { getUserById, createOrder } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { createPrecreateTrade, generateOrderNo } from '@/lib/alipay';
import { cookies } from 'next/headers';

const PACKAGES = {
  monthly: { price: 19.9, name: '月卡会员' },
  lifetime: { price: 199, name: '终身会员' },
};

export async function POST(request: Request) {
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
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const body = await request.json() as { packageType: 'monthly' | 'lifetime' };
    const { packageType } = body;

    if (!packageType || !['monthly', 'lifetime'].includes(packageType)) {
      return NextResponse.json({ error: '套餐类型无效' }, { status: 400 });
    }

    const pkg = PACKAGES[packageType as keyof typeof PACKAGES];
    const orderNo = generateOrderNo();

    const config = {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do',
    };

    const { qrCode } = await createPrecreateTrade(config, orderNo, pkg.price, pkg.name);

    const order = await createOrder({} as any, {
      order_no: orderNo,
      user_id: user.id,
      package_type: packageType as 'monthly' | 'lifetime',
      amount: pkg.price,
      status: 'pending',
      qr_code: qrCode,
      alipay_trade_no: null,
      paid_at: null,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('创建订单错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
