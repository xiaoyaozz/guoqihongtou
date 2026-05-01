import { NextResponse } from 'next/server';
import { getOrderByOrderNo, updateOrder, updateUser, getUserById } from '@/lib/db';
import { verifyCallback } from '@/lib/alipay';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    const publicKey = process.env.ALIPAY_PUBLIC_KEY || '';
    if (!verifyCallback(params, publicKey)) {
      return new Response('fail', { status: 400 });
    }

    const outTradeNo = params.out_trade_no;
    const tradeStatus = params.trade_status;
    const tradeNo = params.trade_no;

    const order = await getOrderByOrderNo({} as any, outTradeNo);
    if (!order) {
      return new Response('fail', { status: 404 });
    }

    if (order.status === 'paid') {
      return new Response('success');
    }

    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      await updateOrder({} as any, outTradeNo, {
        status: 'paid',
        alipay_trade_no: tradeNo,
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
    }

    return new Response('success');
  } catch (error) {
    console.error('支付宝回调错误:', error);
    return new Response('fail', { status: 500 });
  }
}
