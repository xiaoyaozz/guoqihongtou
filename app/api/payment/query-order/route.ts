import { NextResponse } from 'next/server';
import { getOrderByOrderNo, updateOrder, updateUser, getUserById } from '@/lib/db';
import { queryTrade } from '@/lib/alipay';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { orderNo: string };
    const { orderNo } = body;

    if (!orderNo) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
    }

    const order = await getOrderByOrderNo({} as any, orderNo);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ success: true, order });
    }

    const config = {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || '',
      gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do',
    };

    const { trade_status, trade_no } = await queryTrade(config, orderNo);

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      await updateOrder({} as any, orderNo, {
        status: 'paid',
        alipay_trade_no: trade_no,
        paid_at: new Date().toISOString(),
      });

      const user = await getUserById({} as any, order.user_id);
      if (user) {
        const memberExpiresAt = order.package_type === 'lifetime' 
          ? null 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await updateUser({} as any, user.id, {
          member_type: order.package_type,
          member_expires_at: memberExpiresAt,
        });
      }

      const updatedOrder = await getOrderByOrderNo({} as any, orderNo);
      return NextResponse.json({ success: true, order: updatedOrder });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('查询订单错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
